METADATA = {
    "type": "reorder_columns",
    "label": "Reorder Columns",
    "category": "Columns",
    "params": [
        {"key": "columns", "label": "columns", "type": "text", "default": ""},
    ]
}

def run(df, params):
    cols = [c.strip() for c in params.get("columns", "").split(",") if c.strip()]
    if not cols:
        raise ValueError("Define el orden de columnas.")
    missing = [c for c in cols if c not in df.columns]
    if missing:
        raise ValueError(f"Columnas no encontradas: {missing}")
    df = df[cols]
    code = [f"df = df[{cols}]"]
    return df, code
