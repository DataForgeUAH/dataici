import pandas as pd
import os

METADATA = {
    "type": "load_csv",
    "label": "Read CSV",
    "category": "Data I/O",
    "params": [
        {"key": "path",           "label": "path",                 "type": "text",   "default": ""},
        {"key": "multiple_files", "label": "read multiple files",  "type": "toggle", "default": False},
        {"key": "name",           "label": "name",                 "type": "text",   "default": ""},
        {"key": "sep",            "label": "sep",                  "type": "text",   "default": ","},
        {"key": "header",         "label": "header (infer / None / int)", "type": "text", "default": "infer"},
        {"key": "decimal",        "label": "decimal",              "type": "text",   "default": "."},
        {"key": "thousands",      "label": "thousands",            "type": "text",   "default": ""},
    ]
}

def run(df, params):
    path     = params.get("path", "").strip()
    name     = params.get("name", "").strip()
    sep      = params.get("sep", ",") or ","
    decimal  = params.get("decimal", ".") or "."
    thousands = params.get("thousands", "") or None
    multiple = params.get("multiple_files", False)

    raw_header = params.get("header", "infer").strip()
    if raw_header == "None":
        header = None
    elif raw_header == "infer" or raw_header == "":
        header = "infer"
    else:
        try:
            header = int(raw_header)
        except ValueError:
            header = "infer"

    if sep == "\\t":
        sep = "\t"

    if multiple:
        import glob
        pattern = os.path.join(path, "*.csv")
        files = glob.glob(pattern)
        if not files:
            raise FileNotFoundError(f"No se encontraron archivos CSV en: {path}")
        dfs = [pd.read_csv(f, sep=sep, header=header, decimal=decimal, thousands=thousands) for f in sorted(files)]
        df = pd.concat(dfs, ignore_index=True)
        code = [
            "import glob",
            f'files = glob.glob("{os.path.join(path, "*.csv")}")',
            f'df = pd.concat([pd.read_csv(f, sep="{sep}", header={repr(header)}, decimal="{decimal}") for f in sorted(files)], ignore_index=True)',
        ]
    else:
        full_path = os.path.join(path, name) if name else path
        df = pd.read_csv(full_path, sep=sep, header=header, decimal=decimal, thousands=thousands)
        sep_r = "\\t" if sep == "\t" else sep
        code = [
            f'df = pd.read_csv(',
            f'    "{full_path}",',
            f'    sep="{sep_r}",',
            f'    header={repr(header)},',
            f'    decimal="{decimal}",',
            f'    thousands={repr(thousands)}',
            ')',
        ]

    return df, code
