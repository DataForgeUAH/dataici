METADATA = {
    "type":     "sample_rows",
    "label":    "Sample Rows",
    "category": "DataFrame",
    "params": [
        {"key": "n",            "label": "n",            "type": "text", "default": ""},
        {"key": "frac",         "label": "frac",         "type": "text", "default": ""},
        {"key": "random_state", "label": "random state", "type": "text", "default": ""},
        {"key": "ignore_index", "label": "ignore index", "type": "text", "default": "false"},
    ]
}


def _parse_bool(val):
    if isinstance(val, bool):
        return val
    return str(val).strip().lower() == "true"


def run(df, params):
    n_raw   = str(params.get("n",            "") or "").strip()
    fr_raw  = str(params.get("frac",         "") or "").strip()
    rs_raw  = str(params.get("random_state", "") or "").strip()
    ignore_index = _parse_bool(params.get("ignore_index", False))

    kwargs = {"ignore_index": ignore_index}

    # frac takes precedence over n if both are provided
    if fr_raw and fr_raw.lower() not in ("", "none"):
        try:
            kwargs["frac"] = float(fr_raw)
        except ValueError:
            pass
    elif n_raw and n_raw.lower() not in ("", "none"):
        try:
            kwargs["n"] = int(n_raw)
        except ValueError:
            pass

    if rs_raw and rs_raw.lower() not in ("", "none"):
        try:
            kwargs["random_state"] = int(rs_raw)
        except ValueError:
            pass

    df   = df.sample(**kwargs)
    kw_s = ", ".join(f"{k}={repr(v)}" for k, v in kwargs.items())
    code = [f"df = df.sample({kw_s})"]
    return df, code
