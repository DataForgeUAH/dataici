METADATA = {
    "type": "drop_columns",
    "label": "Drop Columns",
    "category": "Columns",
    "params": [
        {"key": "columns", "label": "columns", "type": "text", "default": ""},
    ]
}

def run(df, params):
    cols = [c.strip() for c in params.get("columns", "").split(",") if c.strip()]
    if not cols:
        raise ValueError("Selecciona al menos una columna para eliminar.")
    missing = [c for c in cols if c not in df.columns]
    if missing:
        raise ValueError(f"Columnas no encontradas: {missing}")
    df = df.drop(columns=cols)
    code = [f"df = df.drop(columns={cols})"]
    return df, code
