METADATA = {
    "type": "rename_columns",
    "label": "Rename Columns",
    "category": "Columns",
    "params": [
        {"key": "mapping", "label": "mapping", "type": "text", "default": ""},
    ]
}

def run(df, params):
    raw = params.get("mapping", "")
    mapping = {}
    for pair in raw.split("|"):
        pair = pair.strip()
        if ":" not in pair:
            continue
        old, new = pair.split(":", 1)
        old, new = old.strip(), new.strip()
        if old and new:
            mapping[old] = new
    if not mapping:
        raise ValueError("Define al menos un renombrado.")
    df = df.rename(columns=mapping)
    code = [f"df = df.rename(columns={mapping})"]
    return df, code
