import json

METADATA = {
    "type":     "aggregate",
    "label":    "Aggregate",
    "category": "Resampling",
    "params": [
        {"key": "custom",    "label": "Custom Functions",  "type": "text", "default": "false"},
        {"key": "func",      "label": "General function",  "type": "text", "default": "mean"},
        {"key": "col_funcs", "label": "Per-column funcs",  "type": "text", "default": "{}"},
    ]
}

# pandas resampler does not have a .unique() — map to nunique
_ALIASES = {"unique": "nunique"}


def _is_resampler(obj):
    try:
        from pandas.core.resample import DatetimeIndexResampler
        return isinstance(obj, DatetimeIndexResampler)
    except ImportError:
        pass
    return hasattr(obj, "_selected_obj") and not hasattr(obj, "to_dict")


def run(obj, params):
    custom       = str(params.get("custom",    "false")).strip().lower() == "true"
    func         = (params.get("func",         "mean") or "mean").strip()
    col_funcs_raw = params.get("col_funcs", "{}")

    try:
        col_funcs = json.loads(col_funcs_raw) if col_funcs_raw else {}
    except Exception:
        col_funcs = {}

    is_rs  = _is_resampler(obj)
    prefix = "resampler" if is_rs else "df"

    if custom and col_funcs:
        # Map aliases per-column
        mapped = {col: _ALIASES.get(fn, fn) for col, fn in col_funcs.items()}
        df   = obj.agg(mapped)
        code = [f"df = {prefix}.agg({json.dumps(mapped)})"]
    else:
        actual = _ALIASES.get(func, func)
        df   = getattr(obj, actual)()
        code = [f"df = {prefix}.{actual}()"]

    return df, code
