METADATA = {
    "type": "set_index",
    "label": "Set Index",
    "category": "Index",
    "params": [
        {"key": "columns", "label": "columns", "type": "text", "default": ""},
    ]
}

def run(df, params):
    cols_raw = params.get("columns", "").strip()
    if not cols_raw:
        raise ValueError("Selecciona al menos una columna para usar como índice.")
    cols = [c.strip() for c in cols_raw.split(",") if c.strip()]
    df.set_index(cols, drop=False, inplace=True)
    cols_repr = str(cols)
    code = [
        f"df.set_index(",
        f"    {cols_repr},",
        f"    drop=False,",
        f"    inplace=True,",
        f")",
    ]
    return df, code
