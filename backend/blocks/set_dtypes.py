METADATA = {
    "type": "set_dtypes",
    "label": "Set Dtypes",
    "category": "DataFrame",
    "params": [
        {"key": "mapping", "label": "mapping", "type": "text", "default": ""},
    ]
}

def run(df, params):
    import pandas as pd
    raw = params.get("mapping", "")
    if not raw.strip():
        raise ValueError("Especifica al menos un mapeo columna:tipo.")

    dtype_map = {}
    for pair in raw.split(";"):
        pair = pair.strip()
        if ":" not in pair:
            continue
        col, dtype = pair.split(":", 1)
        dtype_map[col.strip()] = dtype.strip()

    if not dtype_map:
        raise ValueError("Especifica al menos un mapeo columna:tipo.")

    code = []
    for col, dtype in dtype_map.items():
        if dtype == "datetime":
            df[col] = pd.to_datetime(df[col], format='mixed', errors='coerce')
            code.append(f"s = df['{col}']")
            code.append(f"df['{col}'] = pd.to_datetime(s, format='mixed', errors='coerce')")
        elif dtype == "numeric":
            df[col] = pd.to_numeric(df[col], errors='coerce')
            code.append(f"s = df['{col}']")
            code.append(f"df['{col}'] = pd.to_numeric(s, errors='coerce')")
        elif dtype == "categorical":
            df[col] = df[col].astype("category")
            code.append(f"s = df['{col}']")
            code.append(f"df['{col}'] = s.astype('category')")
        else:
            df[col] = df[col].astype(dtype, errors='ignore')
            code.append(f"s = df['{col}']")
            code.append(f"df['{col}'] = s.astype('{dtype}')")

    return df, code
