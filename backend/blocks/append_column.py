import numpy as np
import pandas as pd
METADATA = {
    "type": "append_column",
    "label": "Append a Column",
    "category": "Columns",
    "params": [
        {"key": "colname", "label": "colname", "type": "text", "default": "new_col"},
    ]
}

def run(df, params):
    colname = params.get("colname", "new_col").strip()
    if not colname:
        raise ValueError("Especifica el nombre de la nueva columna.")
    df[colname] = 'None'
    code = [f'df["{colname}"] = None']
    return df, code
