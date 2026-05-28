import pandas as pd
import os

METADATA = {
    "type": "read_excel",
    "label": "Read Excel",
    "category": "Data I/O",
    "params": [
        {"key": "path",           "label": "path",                "type": "text",   "default": ""},
        {"key": "multiple_files", "label": "read multiple files", "type": "toggle", "default": False},
        {"key": "name",           "label": "name",                "type": "text",   "default": ""},
        {"key": "header",         "label": "header (None / int)", "type": "text",   "default": "0"},
    ]
}

def run(df, params):
    path     = params.get("path", "").strip()
    name     = params.get("name", "").strip()
    multiple = params.get("multiple_files", False)

    raw_header = params.get("header", "0").strip()
    header = None if raw_header == "None" else int(raw_header) if raw_header.isdigit() else 0

    if multiple:
        import glob
        pattern = os.path.join(path, "*.xlsx")
        files = glob.glob(pattern)
        if not files:
            raise FileNotFoundError(f"No se encontraron archivos Excel en: {path}")
        dfs = [pd.read_excel(f, header=header) for f in sorted(files)]
        df = pd.concat(dfs, ignore_index=True)
        code = [
            "import glob",
            f'files = glob.glob("{os.path.join(path, "*.xlsx")}")',
            f'df = pd.concat([pd.read_excel(f, header={header}) for f in sorted(files)], ignore_index=True)',
        ]
    else:
        full_path = os.path.join(path, name) if name else path
        df = pd.read_excel(full_path, header=header)
        code = [
            f'df = pd.read_excel(',
            f'    "{full_path}",',
            f'    header={header}',
            ')',
        ]

    return df, code
