from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Any, Optional
from collections import defaultdict, deque
import importlib
import math
import json
import os
import uuid
from datetime import datetime

PROJECTS_FILE = os.path.join(os.path.dirname(__file__), "projects.json")
DIST_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

def _load_projects():
    if not os.path.exists(PROJECTS_FILE):
        return {}
    with open(PROJECTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def _save_projects(projects):
    with open(PROJECTS_FILE, "w", encoding="utf-8") as f:
        json.dump(projects, f, ensure_ascii=False, indent=2)


def _sanitize(obj):
    """Recursively replace NaN/Inf floats with None so JSON serialization never fails."""
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    if isinstance(obj, dict):
        return {k: _sanitize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_sanitize(v) for v in obj]
    return obj

app = FastAPI(title="DataICI API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173",
                   "http://localhost:8000", "http://127.0.0.1:8000"],
    allow_methods=["*"], allow_headers=["*"],
)
_cache = {}

# ── All API routes live under /api ────────────────────────────────────────────
api = APIRouter(prefix="/api")

class NodeDef(BaseModel):
    id: str
    type: str
    params: dict[str, Any] = {}

class EdgeDef(BaseModel):
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class PipelineRequest(BaseModel):
    nodes: list[NodeDef]
    edges: list[EdgeDef]

@api.get("/health")
def root():
    return {"status": "DataICI backend running"}

# ── Project management ────────────────────────────────────────────────────────
@api.get("/projects")
def list_projects():
    projects = _load_projects()
    return sorted(projects.values(), key=lambda p: p["created_at"], reverse=True)

@api.post("/projects")
def create_project(body: dict):
    projects = _load_projects()
    pid  = str(uuid.uuid4())[:8]
    now  = datetime.now().isoformat()
    proj = {
        "id": pid,
        "name":        body.get("name", "Sin nombre"),
        "description": body.get("description", ""),
        "created_at":  now,
        "modified_at": now,
        "nodes": [],
        "edges": [],
    }
    projects[pid] = proj
    _save_projects(projects)
    return proj

@api.get("/projects/{pid}")
def get_project(pid: str):
    projects = _load_projects()
    if pid not in projects:
        return {"error": "Proyecto no encontrado"}
    return projects[pid]

@api.put("/projects/{pid}")
def update_project(pid: str, body: dict):
    projects = _load_projects()
    if pid not in projects:
        return {"error": "Proyecto no encontrado"}
    projects[pid].update({
        "nodes":       body.get("nodes",  projects[pid]["nodes"]),
        "edges":       body.get("edges",  projects[pid]["edges"]),
        "modified_at": datetime.now().isoformat(),
    })
    _save_projects(projects)
    return projects[pid]

@api.delete("/projects/{pid}")
def delete_project(pid: str):
    projects = _load_projects()
    if pid in projects:
        del projects[pid]
        _save_projects(projects)
    return {"ok": True}

# ── Resampler helpers ─────────────────────────────────────────────────────────
def _is_resampler(obj):
    """Return True if obj is a pandas DatetimeIndexResampler (not a DataFrame)."""
    try:
        from pandas.core.resample import DatetimeIndexResampler
        return isinstance(obj, DatetimeIndexResampler)
    except ImportError:
        pass
    return hasattr(obj, "_selected_obj") and hasattr(obj, "mean") and not hasattr(obj, "to_dict")


def _resampler_to_display(resampler):
    """
    Convert a Resampler to a dict describing its windows (no aggregation).
    Each window shows: its timestamp key, row count, and first 5 rows with their
    original index values included so the frontend can render them.
    """
    windows = []
    for key, group in resampler:
        if group.empty:
            continue
        group_head = group.head(5)
        raw_idx_name = group.index.name or "Time"
        idx_col = raw_idx_name if raw_idx_name not in group.columns else f"{raw_idx_name}__idx"
        group_reset = group_head.rename_axis(idx_col).reset_index()
        data_cols   = list(group.columns)
        windows.append({
            "timestamp": str(key),
            "n_rows":    int(len(group)),
            "index_col": idx_col,
            "columns":   data_cols,
            "data":      group_reset.where(group_reset.notna(), other=None).to_dict(orient="records"),
        })
        if len(windows) >= 4:
            break
    return {
        "is_resampler": True,
        "n_windows":    len(windows),
        "windows":      windows,
    }


@api.post("/run")
def run_pipeline(req: PipelineRequest):
    import pandas as pd
    import numpy as np

    nodes_by_id = {n.id: n for n in req.nodes}
    incoming  = defaultdict(dict)
    outgoing  = defaultdict(list)

    for edge in req.edges:
        handle = edge.targetHandle or "input-0"
        incoming[edge.target][handle] = edge.source
        outgoing[edge.source].append(edge.target)

    in_degree  = {n.id: 0 for n in req.nodes}
    for edge in req.edges:
        in_degree[edge.target] += 1
    queue      = deque([n.id for n in req.nodes if in_degree[n.id] == 0])
    topo_order = []
    while queue:
        nid = queue.popleft()
        topo_order.append(nid)
        for nb in outgoing[nid]:
            in_degree[nb] -= 1
            if in_degree[nb] == 0:
                queue.append(nb)

    if len(topo_order) != len(req.nodes):
        return {"error": "El pipeline tiene un ciclo o nodos sin conectar."}

    results  = {}
    all_code = ["import pandas as pd", ""]
    last_result = None

    for nid in topo_order:
        node   = nodes_by_id[nid]
        params = dict(node.params)
        try:
            module = importlib.import_module(f"blocks.{node.type}")
            importlib.reload(module)
            meta = getattr(module, "METADATA", {})
            if meta:
                valid_keys = {p["key"] for p in meta.get("params", [])}
                params = {k: v for k, v in params.items() if k in valid_keys}
            multi_input   = meta.get("multi_input", False)
            node_incoming = incoming.get(nid, {})

            if multi_input:
                sorted_handles = sorted(
                    node_incoming.keys(),
                    key=lambda h: int(h.split("-")[1]) if h and "-" in h else 0,
                )
                input_dfs = [results[node_incoming[h]] for h in sorted_handles if node_incoming.get(h) in results]
                if len(input_dfs) < 2:
                    return {"error": f"'{node.type}' necesita al menos 2 entradas conectadas."}
                result, code_lines = module.run(input_dfs, params)
            else:
                if node_incoming:
                    src_id = node_incoming.get("input-0") or list(node_incoming.values())[0]
                    result_in = results.get(src_id)
                else:
                    result_in = None
                result, code_lines = module.run(result_in, params)

            results[nid] = result
            last_result = result
            all_code.extend(code_lines)
            all_code.append("")

        except ModuleNotFoundError:
            return {"error": f"Bloque '{node.type}' no encontrado."}
        except Exception as e:
            return {"error": str(e)}

    if last_result is None:
        return {"error": "Pipeline vacío o sin resultado."}

    if _is_resampler(last_result):
        resampler_info = _resampler_to_display(last_result)
        _cache["df"] = last_result._selected_obj
        return _sanitize({
            **resampler_info,
            "code": "\n".join(all_code).strip(),
        })

    df = last_result
    _cache["df"] = df
    df_safe = df.where(df.notna(), other=None)

    try:
        describe = df.describe(include="all").fillna("").astype(str).to_dict()
    except Exception:
        describe = {}

    for col in df.select_dtypes(include=["datetime64"]).columns:
        try:
            s = df[col].dropna()
            describe[col] = {
                "count": str(len(s)), "mean": str(s.mean()), "min": str(s.min()),
                "25%": str(s.quantile(0.25)), "50%": str(s.median()),
                "75%": str(s.quantile(0.75)), "max": str(s.max()),
            }
        except Exception:
            pass

    box_stats = {}
    for col in df.select_dtypes(include="number").columns:
        try:
            clean = df[col].dropna().astype(float)
            box_stats[col] = {
                "q1": float(clean.quantile(0.25)), "med": float(clean.quantile(0.5)),
                "q3": float(clean.quantile(0.75)), "min": float(clean.min()),
                "max": float(clean.max()), "count": int(len(clean)),
                "missing": int(df[col].isnull().sum()),
            }
        except Exception:
            pass

    value_counts = {}
    for col in df.columns:
        try:
            vc = df[col].value_counts(dropna=True).head(20)
            value_counts[col] = [
                {"value": str(k), "count": int(v), "pct": round(float(v)/len(df), 6)}
                for k, v in vc.items()
            ]
        except Exception:
            pass

    index_names = [n for n in df.index.names if n is not None]
    return _sanitize({
        "data":         df_safe.head(100).to_dict(orient="records"),
        "columns":      list(df.columns),
        "index_names":  index_names,
        "shape":        list(df.shape),
        "nulls":        int(df.isnull().sum().sum()),
        "dtypes":       {col: str(dtype) for col, dtype in df.dtypes.items()},
        "describe":     describe,
        "box_stats":    box_stats,
        "value_counts": value_counts,
        "code":         "\n".join(all_code).strip(),
    })

@api.get("/charts")
def get_charts(col: str):
    df = _cache.get("df")
    if df is None:
        return {"error": "No hay datos. Ejecuta el pipeline primero."}
    if col not in df.columns:
        return {"error": f"Columna '{col}' no encontrada."}
    try:
        from charts import generate_column_charts
        return generate_column_charts(df, col)
    except Exception as e:
        return {"error": str(e)}

@api.get("/blocks")
def list_blocks():
    blocks = []
    blocks_dir = os.path.join(os.path.dirname(__file__), "blocks")
    for fname in sorted(os.listdir(blocks_dir)):
        if fname.endswith(".py") and not fname.startswith("_"):
            try:
                mod = importlib.import_module(f"blocks.{fname[:-3]}")
                if hasattr(mod, "METADATA"):
                    blocks.append(mod.METADATA)
            except Exception:
                pass
    return blocks

# ── Register API router ───────────────────────────────────────────────────────
app.include_router(api)

# ── Serve built frontend (production mode) ────────────────────────────────────
# When frontend/dist exists, serve assets + index.html so users only need:
#   uvicorn main:app --reload   →   http://127.0.0.1:8000
if os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        """Catch-all: serve index.html for all non-API routes (SPA client-side routing)."""
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
