import pandas as pd

METADATA = {
    "type":        "concatenate",
    "label":       "Concatenate",
    "category":    "DataFrame",
    "multi_input": True,
    "params": [
        {"key": "input_count",      "label": "Número de entradas",    "type": "text",   "default": "2"},
        {"key": "axis",             "label": "Axis",                  "type": "text",   "default": "index"},
        {"key": "join",             "label": "Join",                  "type": "text",   "default": "outer"},
        {"key": "change_col_names", "label": "Change column names",   "type": "text",   "default": "None"},
        {"key": "ignore_index",     "label": "Ignore index",          "type": "text",   "default": "false"},
        {"key": "sort",             "label": "Sort",                  "type": "text",   "default": "false"},
    ]
}


def _bool(val):
    if isinstance(val, bool):
        return val
    return str(val).strip().lower() == "true"


def run(dfs, params):
    """dfs: list of DataFrames received from upstream nodes."""
    axis_raw = params.get("axis", "index")
    axis     = 0 if axis_raw == "index" else 1

    join          = params.get("join", "outer")
    change_cols   = params.get("change_col_names", "None")   # None | prefix | suffix
    ignore_index  = _bool(params.get("ignore_index", False))
    sort          = _bool(params.get("sort", False))

    if len(dfs) < 2:
        raise ValueError("Concatenate necesita al menos 2 DataFrames.")

    # ── Rename columns when axis=1 and change_col_names != None ──────────────
    if axis == 1 and change_cols in ("prefix", "suffix"):
        renamed = []
        for i, df in enumerate(dfs):
            if change_cols == "prefix":
                df = df.rename(columns=lambda c: f"df{i+1}_{c}")
            else:
                df = df.rename(columns=lambda c: f"{c}_df{i+1}")
            renamed.append(df)
        dfs = renamed

    # ── Build concat kwargs ───────────────────────────────────────────────────
    kwargs = {"axis": axis, "join": join, "sort": sort}
    if axis == 0:
        kwargs["ignore_index"] = ignore_index

    df_result = pd.concat(dfs, **kwargs)

    # ── Code string ──────────────────────────────────────────────────────────
    frames_repr = ", ".join(f"df_{i+1}" for i in range(len(dfs)))
    code_lines  = []

    if axis == 1 and change_cols == "prefix":
        for i in range(len(dfs)):
            code_lines.append(f"df_{i+1} = df_{i+1}.rename(columns=lambda c: f'df{i+1}_{{c}}')")
    elif axis == 1 and change_cols == "suffix":
        for i in range(len(dfs)):
            code_lines.append(f"df_{i+1} = df_{i+1}.rename(columns=lambda c: f'{{c}}_df{i+1}')")

    kw_str = ", ".join(f"{k}={repr(v)}" for k, v in kwargs.items())
    code_lines.append(f"df = pd.concat([{frames_repr}], {kw_str})")

    return df_result, code_lines
