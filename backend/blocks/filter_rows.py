import json
import pandas as pd

METADATA = {
    "type": "filter_rows",
    "label": "Filter Rows",
    "category": "DataFrame",
    "params": [
        {"key": "conditions", "label": "conditions", "type": "text", "default": "[]"},
    ]
}

def run(df, params):
    raw = params.get("conditions", "[]")
    try:
        conditions = json.loads(raw) if isinstance(raw, str) else raw
    except Exception:
        raise ValueError("Error al leer las condiciones.")

    if not conditions:
        raise ValueError("Agrega al menos una condición Where.")

    OP_METHOD = {"==": "eq", "!=": "ne", "<": "lt", "<=": "le", ">": "gt", ">=": "ge"}
    OP_SYM    = {"and": "&", "or": "|", "xor": "^"}

    masks      = []
    cond_lines = []

    for i, cond in enumerate(conditions):
        col     = cond.get("column", "")
        op      = cond.get("operator", "==")
        typ     = cond.get("type", "number")
        val     = str(cond.get("value", "0")).strip()
        negate  = cond.get("not", False)
        logical = cond.get("logical", "and")

        if not col or col not in df.columns:
            raise ValueError(f"Columna '{col}' no encontrada en el DataFrame.")

        s = df[col]

        # ── Build mask ───────────────────────────────────────────────────────
        if op == "isna":
            mask      = s.isna()
            code_expr = f"df['{col}'].isna()"

        elif op == "notna":
            mask      = s.notna()
            code_expr = f"df['{col}'].notna()"

        elif op == "isin":
            items = [v.strip() for v in val.split(",") if v.strip()]
            if typ == "number":
                try:
                    parsed = [float(v) for v in items]
                except ValueError:
                    raise ValueError(f"isin numérico: valores inválidos → {items}")
                code_expr = f"df['{col}'].isin({parsed})"
            else:
                parsed    = [v.strip("'\"") for v in items]
                code_expr = f"df['{col}'].isin({parsed!r})"
            mask = s.isin(parsed)

        else:
            method = OP_METHOD.get(op, "eq")

            if typ == "number":
                try:
                    parsed = float(val)
                except ValueError:
                    raise ValueError(f"Valor numérico inválido: '{val}'")
                mask      = getattr(s, method)(parsed)
                code_expr = f"df['{col}'].{method}({parsed})"

            elif typ == "string":
                parsed    = val.strip("'\"")
                mask      = getattr(s, method)(parsed)
                code_expr = f"df['{col}'].{method}('{parsed}')"

            elif typ == "datetime":
                try:
                    parsed = pd.Timestamp(val)
                except Exception:
                    raise ValueError(f"Fecha inválida: '{val}'")
                mask      = getattr(s, method)(parsed)
                code_expr = f"df['{col}'].{method}(pd.Timestamp('{val}'))"

            elif typ == "column":
                if val not in df.columns:
                    raise ValueError(f"Columna de comparación '{val}' no existe.")
                mask      = getattr(s, method)(df[val])
                code_expr = f"df['{col}'].{method}(df['{val}'])"

            else:
                raise ValueError(f"Tipo desconocido: '{typ}'")

        if negate:
            mask      = ~mask
            code_expr = f"~({code_expr})"

        masks.append({"logical": logical, "mask": mask, "expr": code_expr})

    # ── Combine masks ────────────────────────────────────────────────────────
    result_mask = masks[0]["mask"]
    cond_lines  = [f"    ({masks[0]['expr']})"]

    for m in masks[1:]:
        sym = OP_SYM.get(m["logical"], "&")
        if m["logical"] == "and":
            result_mask = result_mask & m["mask"]
        elif m["logical"] == "or":
            result_mask = result_mask | m["mask"]
        elif m["logical"] == "xor":
            result_mask = result_mask ^ m["mask"]
        cond_lines.append(f"    {sym} ({m['expr']})")

    df = df[result_mask]

    code = ["cond = (", *cond_lines, ")", "df = df[cond]"]
    return df, code
