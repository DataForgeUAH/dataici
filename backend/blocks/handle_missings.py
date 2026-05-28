METADATA = {
    "type": "handle_missings",
    "label": "Handle Missings",
    "category": "DataFrame",
    "params": [
        {"key": "all_columns",              "label": "All Columns",      "type": "text", "default": "true"},
        {"key": "columns",                  "label": "Columns",          "type": "text", "default": ""},
        {"key": "operation",                "label": "Operation",        "type": "text", "default": "dropna"},
        # dropna
        {"key": "axis",                     "label": "Axis",             "type": "text", "default": "index"},
        {"key": "how",                      "label": "How",              "type": "text", "default": "any"},
        {"key": "thresh",                   "label": "Thresh (%)",       "type": "text", "default": ""},
        # fillna
        {"key": "fill_type",                "label": "Fill Type",        "type": "text", "default": "value"},
        {"key": "value_type",               "label": "Value Type",       "type": "text", "default": "number"},
        {"key": "fill_value",               "label": "Fill Value",       "type": "text", "default": "0"},
        {"key": "fill_method",              "label": "Fill Method",      "type": "text", "default": "ffill"},
        {"key": "fill_axis",                "label": "Fill Axis",        "type": "text", "default": "index"},
        {"key": "fill_limit",               "label": "Fill Limit",       "type": "text", "default": ""},
        # interpolate
        {"key": "interp_method",            "label": "Interp Method",    "type": "text", "default": "linear"},
        {"key": "interp_axis",              "label": "Interp Axis",      "type": "text", "default": "index"},
        {"key": "interp_limit",             "label": "Interp Limit",     "type": "text", "default": ""},
        {"key": "interp_limit_direction",   "label": "Limit Direction",  "type": "text", "default": "None"},
        {"key": "interp_limit_area",        "label": "Limit Area",       "type": "text", "default": "None"},
    ]
}


def _parse_limit(raw):
    """Return int or None."""
    try:
        v = int(str(raw).strip())
        return v if v > 0 else None
    except (ValueError, TypeError):
        return None


def run(df, params):
    operation   = params.get("operation", "dropna")
    all_columns = params.get("all_columns", "true").strip().lower() != "false"
    columns_raw = params.get("columns", "")
    subset      = (
        [c.strip() for c in columns_raw.split(",") if c.strip()]
        if not all_columns and columns_raw.strip()
        else None
    )

    code = []

    # ── dropna ────────────────────────────────────────────────────────────────
    if operation == "dropna":
        axis      = params.get("axis", "index")
        how       = params.get("how", "any")
        thresh_raw = params.get("thresh", "").strip()

        kwargs = {"axis": axis}
        if subset:
            kwargs["subset"] = subset

        if thresh_raw:
            try:
                thresh_pct = float(thresh_raw)
                # thresh = minimum number of non-NA values required to keep row/col
                n = df.shape[0] if axis in ("index", "0") else df.shape[1]
                kwargs["thresh"] = max(1, int(thresh_pct / 100.0 * n))
                # thresh and how are mutually exclusive — omit how
            except (ValueError, TypeError):
                kwargs["how"] = how
        else:
            kwargs["how"] = how

        df   = df.dropna(**kwargs)
        code = [f"df = df.dropna({', '.join(f'{k}={repr(v)}' for k, v in kwargs.items())})"]

    # ── fillna ────────────────────────────────────────────────────────────────
    elif operation == "fillna":
        fill_type = params.get("fill_type", "value")

        if fill_type == "value":
            value_type = params.get("value_type", "number")
            raw_val    = params.get("fill_value", "0")
            if value_type == "number":
                try:
                    fill_val = float(raw_val) if "." in str(raw_val) else int(raw_val)
                except (ValueError, TypeError):
                    fill_val = 0
            else:
                fill_val = raw_val

            if subset:
                df[subset] = df[subset].fillna(fill_val)
                code = [f"df[{subset}] = df[{subset}].fillna({repr(fill_val)})"]
            else:
                df   = df.fillna(fill_val)
                code = [f"df = df.fillna({repr(fill_val)})"]

        else:  # method
            method    = params.get("fill_method", "ffill")
            fill_axis = params.get("fill_axis", "index")
            limit     = _parse_limit(params.get("fill_limit", ""))
            axis_val  = None if fill_axis in ("None", "") else fill_axis

            extra = {}
            if axis_val:
                extra["axis"] = axis_val
            if limit:
                extra["limit"] = limit

            if method == "ffill":
                fn = "ffill"
                if subset:
                    df[subset] = df[subset].ffill(**extra)
                    code = [f"df[{subset}] = df[{subset}].ffill({_fmt(extra)})"]
                else:
                    df   = df.ffill(**extra)
                    code = [f"df = df.ffill({_fmt(extra)})"]
            elif method == "bfill":
                fn = "bfill"
                if subset:
                    df[subset] = df[subset].bfill(**extra)
                    code = [f"df[{subset}] = df[{subset}].bfill({_fmt(extra)})"]
                else:
                    df   = df.bfill(**extra)
                    code = [f"df = df.bfill({_fmt(extra)})"]
            else:
                # method == "None" — no-op
                code = ["# fillna: method=None — no action taken"]

    # ── interpolate ───────────────────────────────────────────────────────────
    elif operation == "interpolate":
        imethod    = params.get("interp_method", "linear")
        iaxis      = params.get("interp_axis", "index")
        limit      = _parse_limit(params.get("interp_limit", ""))
        limit_dir  = params.get("interp_limit_direction", "None")
        limit_area = params.get("interp_limit_area", "None")

        kwargs = {"method": imethod}
        if iaxis and iaxis != "None":
            kwargs["axis"] = iaxis
        if limit:
            kwargs["limit"] = limit
        if limit_dir and limit_dir != "None":
            kwargs["limit_direction"] = limit_dir
        if limit_area and limit_area != "None":
            kwargs["limit_area"] = limit_area

        if subset:
            df[subset] = df[subset].interpolate(**kwargs)
            code = [f"df[{subset}] = df[{subset}].interpolate({_fmt(kwargs)})"]
        else:
            df   = df.interpolate(**kwargs)
            code = [f"df = df.interpolate({_fmt(kwargs)})"]

    return df, code


def _fmt(kwargs):
    """Format a dict as keyword arguments string."""
    return ", ".join(f"{k}={repr(v)}" for k, v in kwargs.items())
