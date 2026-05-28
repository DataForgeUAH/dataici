import json
import math
import pandas as pd

METADATA = {
    "type":     "replace_values",
    "label":    "Replace Values",
    "category": "DataFrame",
    "params": [
        {"key": "target_col",  "label": "Column to replace", "type": "text", "default": ""},
        {"key": "with_type",   "label": "With type",         "type": "text", "default": "number"},
        {"key": "with_value",  "label": "Value",             "type": "text", "default": ""},
        {"key": "with_format", "label": "Datetime format",   "type": "text", "default": "%Y-%m-%d %H:%M:%S"},
        {"key": "conditions",  "label": "Conditions (JSON)", "type": "text", "default": "[]"},
    ]
}


# ── Condition mask builder ────────────────────────────────────────────────────
def _parse_cond_value(raw, vtype, df):
    if vtype == 'column':
        return df[raw] if raw in df.columns else raw
    if vtype == 'number':
        try:
            return float(raw) if '.' in str(raw) else int(raw)
        except (ValueError, TypeError):
            return raw
    if vtype == 'datetime':
        try:
            return pd.Timestamp(raw)
        except Exception:
            return raw
    return raw   # string


def _single_mask(df, cond):
    col      = cond.get('column', '')
    operator = cond.get('operator', '==')
    vtype    = cond.get('type', 'string')
    raw_val  = cond.get('value', '')
    negate   = cond.get('not', False)

    if col not in df.columns:
        return pd.Series([True] * len(df), index=df.index)

    s = df[col]

    if operator == 'isna':
        mask = s.isna()
    elif operator == 'notna':
        mask = s.notna()
    elif operator == 'isin':
        vals = [v.strip() for v in str(raw_val).split(',')]
        mask = s.isin(vals)
    else:
        val = _parse_cond_value(raw_val, vtype, df)
        ops = {'==': s == val, '!=': s != val,
               '<':  s <  val, '<=': s <= val,
               '>':  s >  val, '>=': s >= val}
        mask = ops.get(operator, pd.Series([True] * len(df), index=df.index))

    return ~mask if negate else mask


def _build_mask(df, conds):
    if not conds:
        return pd.Series([True] * len(df), index=df.index)
    mask = _single_mask(df, conds[0])
    for cond in conds[1:]:
        m2      = _single_mask(df, cond)
        logical = cond.get('logical', 'and')
        if logical == 'or':
            mask = mask | m2
        elif logical == 'xor':
            mask = mask ^ m2
        else:
            mask = mask & m2
    return mask


def _mask_repr(conds):
    if not conds:
        return "slice(None)"
    parts = []
    for c in conds:
        col  = c.get('column', '')
        op   = c.get('operator', '==')
        val  = c.get('value', '')
        not_ = 'NOT ' if c.get('not') else ''
        parts.append(f"{not_}df['{col}'] {op} {repr(val)}")
    return ' & '.join(f"({p})" for p in parts)


# ── Main run ──────────────────────────────────────────────────────────────────
def run(df, params):
    target_col  = params.get('target_col', '').strip()
    with_type   = params.get('with_type', 'number')
    raw_value   = params.get('with_value', '')
    with_format = params.get('with_format', '%Y-%m-%d %H:%M:%S').strip()

    if not target_col or target_col not in df.columns:
        raise ValueError(f"replace_values: columna '{target_col}' no encontrada en el DataFrame.")

    conds = []
    try:
        conds = json.loads(params.get('conditions', '[]'))
    except Exception:
        conds = []

    mask      = _build_mask(df, conds)
    mask_repr = _mask_repr(conds)
    code      = []

    # ── number ──
    if with_type == 'number':
        try:
            replacement = float(raw_value) if '.' in str(raw_value) else int(raw_value)
        except (ValueError, TypeError):
            replacement = 0
        df.loc[mask, target_col] = replacement
        code = [f"df.loc[{mask_repr}, '{target_col}'] = {repr(replacement)}"]

    # ── na (NaN) ──
    elif with_type == 'na':
        df.loc[mask, target_col] = float('nan')
        code = [f"df.loc[{mask_repr}, '{target_col}'] = float('nan')"]

    # ── string ──
    elif with_type == 'string':
        df.loc[mask, target_col] = raw_value
        code = [f"df.loc[{mask_repr}, '{target_col}'] = {repr(raw_value)}"]

    # ── datetime ──
    elif with_type == 'datetime':
        try:
            replacement = pd.Timestamp(raw_value)
        except Exception:
            raise ValueError(f"replace_values: no se pudo parsear '{raw_value}' como datetime.")
        df.loc[mask, target_col] = replacement
        fmt_comment = f"  # format: {with_format}" if with_format else ""
        code = [f"df.loc[{mask_repr}, '{target_col}'] = pd.Timestamp({repr(raw_value)}){fmt_comment}"]

    # ── column (copy values from another column) ──
    elif with_type == 'column':
        src_col = raw_value.strip()
        if src_col not in df.columns:
            raise ValueError(f"replace_values: columna fuente '{src_col}' no encontrada.")
        df.loc[mask, target_col] = df.loc[mask, src_col].values
        code = [f"df.loc[{mask_repr}, '{target_col}'] = df.loc[{mask_repr}, '{src_col}']"]

    else:
        code = [f"# replace_values: with_type='{with_type}' no reconocido"]

    return df, code
