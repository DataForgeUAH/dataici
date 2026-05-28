METADATA = {
    "type": "resample",
    "label": "Resample",
    "category": "Resampling",
    "params": [
        {"key": "rule",   "label": "Rule (ej: 1S, 1T, 2H, 1D)", "type": "text", "default": ""},
        {"key": "sparse", "label": "Sparse resampling",          "type": "text", "default": "true"},
        {"key": "closed", "label": "closed",                     "type": "text", "default": "None"},
        {"key": "label",  "label": "label",                      "type": "text", "default": "None"},
        {"key": "kind",   "label": "kind",                       "type": "text", "default": "None"},
        {"key": "origin", "label": "origin",                     "type": "text", "default": "epoch"},
        {"key": "offset", "label": "offset",                     "type": "text", "default": ""},
    ]
}

# Signal to main.py that this block returns a Resampler, not a DataFrame
IS_RESAMPLER = True


def _parse_bool(val):
    if isinstance(val, bool):
        return val
    return str(val).strip().lower() not in ("false", "0", "")


def run(df, params):
    import pandas as pd

    rule      = (params.get("rule",   "") or "").strip()
    sparse    = _parse_bool(params.get("sparse", "true"))
    closed    = (params.get("closed", "None") or "None").strip()
    label_val = (params.get("label",  "None") or "None").strip()
    kind      = (params.get("kind",   "None") or "None").strip()
    origin    = (params.get("origin", "epoch") or "epoch").strip()
    offset    = (params.get("offset", "") or "").strip()

    if not rule:
        raise ValueError("resample: debes especificar una regla (e.g. '1T', '1H', '1D').")

    if not isinstance(df.index, pd.DatetimeIndex):
        raise ValueError(
            "resample: el índice debe ser DatetimeIndex. "
            "Usa el bloque Set Index con una columna datetime antes de este bloque."
        )

    if sparse:
        resampler = df.resample(rule)
        code = [f'resampler = df.resample("{rule}")']
    else:
        kwargs = {}
        if closed and closed != "None":
            kwargs["closed"] = closed
        if label_val and label_val != "None":
            kwargs["label"] = label_val
        if kind and kind != "None":
            kwargs["kind"] = kind
        if origin:
            kwargs["origin"] = origin
        if offset:
            kwargs["offset"] = offset

        resampler = df.resample(rule, **kwargs)
        kw_s = ", ".join(f"{k}={repr(v)}" for k, v in kwargs.items())
        rule_s = f'"{rule}"' + (f", {kw_s}" if kw_s else "")
        code = [f"resampler = df.resample({rule_s})"]

    # Return the Resampler object — aggregation is done by the Aggregate block
    return resampler, code
