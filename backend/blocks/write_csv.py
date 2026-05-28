import os

METADATA = {
    "type": "write_csv",
    "label": "Write CSV",
    "category": "Data I/O",
    "params": [
        {"key": "path",         "label": "path",         "type": "text",   "default": ""},
        {"key": "name",         "label": "name",         "type": "text",   "default": "output.csv"},
        {"key": "sep",          "label": "sep",          "type": "text",   "default": ","},
        {"key": "na_rep",       "label": "NA rep",       "type": "text",   "default": ""},
        {"key": "float_format", "label": "float format", "type": "text",   "default": ""},
        {"key": "header",       "label": "header",       "type": "toggle", "default": True},
        {"key": "index",        "label": "index",        "type": "toggle", "default": True},
        {"key": "decimal",      "label": "decimal",      "type": "text",   "default": "."},
    ]
}

def run(df, params):
    path         = params.get("path", "").strip()
    name         = params.get("name", "output.csv").strip()
    sep          = params.get("sep", ",") or ","
    na_rep       = params.get("na_rep", "") or ""
    float_format = params.get("float_format", "") or None
    header       = params.get("header", True)
    index        = params.get("index", True)
    decimal      = params.get("decimal", ".") or "."

    if sep == "\\t":
        sep = "\t"

    full_path = os.path.join(path, name) if path else name

    df.to_csv(full_path, sep=sep, na_rep=na_rep, float_format=float_format,
              header=header, index=index, decimal=decimal)

    sep_r = "\\t" if sep == "\t" else sep
    code = [
        f'df.to_csv(',
        f'    "{full_path}",',
        f'    sep="{sep_r}",',
        f'    na_rep="{na_rep}",',
        f'    float_format={repr(float_format)},',
        f'    header={header},',
        f'    index={index},',
        f'    decimal="{decimal}"',
        ')',
    ]
    return df, code
