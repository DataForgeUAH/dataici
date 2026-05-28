import io, base64
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import warnings
warnings.filterwarnings('ignore')

plt.rcParams.update({
    'axes.spines.top':    False,
    'axes.spines.right':  False,
    'axes.edgecolor':     '#cccccc',
    'axes.linewidth':     0.8,
    'xtick.color':        '#666666',
    'ytick.color':        '#666666',
    'xtick.labelsize':    9,
    'ytick.labelsize':    9,
    'figure.facecolor':   'white',
    'axes.facecolor':     'white',
})

SCATTER_COLOR = '#1a56a0'
HIST_FACE     = '#aec7e8'
HIST_EDGE     = '#1f77b4'
BOX_FACE      = '#aec7e8'
BOX_EDGE      = '#1f77b4'
DPI           = 150


def _to_b64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', dpi=DPI, facecolor='white', edgecolor='none',
                bbox_inches='tight')
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode()


def make_scatter(col, indices, values):
    """ALL points — overlap creates density effect like DataBruin."""
    idx_arr = np.asarray(indices, dtype=np.float64)
    val_arr = np.asarray(values,  dtype=np.float64)
    # Remove any remaining NaN/Inf
    mask    = np.isfinite(idx_arr) & np.isfinite(val_arr)
    idx_arr, val_arr = idx_arr[mask], val_arr[mask]
    if len(idx_arr) == 0:
        return None

    x_max = float(idx_arr.max())
    fig, ax = plt.subplots(figsize=(14, 5))
    ax.scatter(idx_arr, val_arr,
               s=8, c=SCATTER_COLOR, alpha=0.6,
               linewidths=0, rasterized=True)
    ax.set_ylabel(col, fontsize=9, color='#444')
    ax.xaxis.set_major_formatter(
        ticker.FuncFormatter(lambda x, _: f'{int(x):,}'))
    ax.set_xlim(left=-x_max * 0.02, right=x_max * 1.02)
    ax.margins(y=0.08)
    fig.subplots_adjust(left=0.08, right=0.99, top=0.96, bottom=0.10)
    return _to_b64(fig)


def make_histogram(values):
    """Histogram — fewer bins like DataBruin."""
    arr = np.asarray(values, dtype=np.float64)
    arr = arr[np.isfinite(arr)]
    if len(arr) == 0:
        return None
    # DataBruin visually shows ~10-15 bins
    # Use Scott's rule which gives fewer bins than Sturges for large n
    n_bins = int(np.ceil(np.log2(len(arr)) + 1))
    n_bins = max(5, min(n_bins, 20))  # cap at 20, min 5

    fig, ax = plt.subplots(figsize=(6, 3.5))
    ax.hist(arr, bins=n_bins, color=HIST_FACE, edgecolor=HIST_EDGE, linewidth=0.4)
    ax.set_ylabel('Frequency', fontsize=8, color='#444')
    ax.xaxis.set_major_formatter(ticker.FuncFormatter(lambda x, _: f'{x:g}'))
    ax.yaxis.set_major_formatter(ticker.FuncFormatter(lambda x, _: f'{int(x):,}'))
    ax.margins(x=0.02)
    fig.subplots_adjust(left=0.14, right=0.97, top=0.95, bottom=0.12)
    return _to_b64(fig)


def make_boxplot(col, values):
    """Horizontal boxplot with vertical label."""
    arr = np.asarray(values, dtype=np.float64)
    arr = arr[np.isfinite(arr)]
    if len(arr) < 2:
        return None
    fig, ax = plt.subplots(figsize=(6, 2.4))
    ax.boxplot(arr, vert=False, patch_artist=True, widths=0.55,
        flierprops=dict(marker='o', markersize=3, markerfacecolor='white',
                        markeredgecolor='#555', markeredgewidth=0.8, alpha=0.5),
        medianprops=dict(color=BOX_EDGE, linewidth=2.5),
        boxprops=dict(facecolor=BOX_FACE, edgecolor=BOX_EDGE, linewidth=1.5),
        whiskerprops=dict(color='#333', linewidth=1.5),
        capprops=dict(color='#333', linewidth=1.5),
    )
    ax.set_yticks([1])
    ax.set_yticklabels([col], fontsize=7, rotation=90, va='center')
    ax.xaxis.set_major_formatter(ticker.FuncFormatter(lambda x, _: f'{x:g}'))
    ax.margins(x=0.04)
    fig.subplots_adjust(left=0.10, right=0.97, top=0.93, bottom=0.18)
    return _to_b64(fig)


def make_datetime_line(col, indices, timestamps_ms):
    """Line chart for datetime columns."""
    import datetime
    pairs = [(i, datetime.datetime.fromtimestamp(t / 1000))
             for i, t in zip(indices, timestamps_ms) if t is not None]
    if not pairs:
        return None
    idxs, dates = zip(*pairs)
    fig, ax = plt.subplots(figsize=(11, 4))
    ax.plot(idxs, dates, color=SCATTER_COLOR, linewidth=1)
    import matplotlib.dates as mdates
    ax.yaxis.set_major_formatter(mdates.DateFormatter('%Y-%m'))
    ax.xaxis.set_major_formatter(
        ticker.FuncFormatter(lambda x, _: f'{int(x):,}'))
    ax.set_xlim(left=0)
    ax.margins(y=0.08)
    fig.subplots_adjust(left=0.12, right=0.98, top=0.95, bottom=0.12)
    return _to_b64(fig)


def generate_column_charts(df, col):
    out = {}
    try:
        s     = df[col].copy()
        dtype = str(s.dtype)
        n     = len(df)

        is_num = np.issubdtype(s.dtype, np.number)
        is_dt  = 'datetime' in dtype

        # Try numeric conversion for object columns
        if not is_num and not is_dt:
            try:
                s_conv = pd.to_numeric(s, errors='coerce')
                if s_conv.notna().sum() > len(s) * 0.5:
                    s      = s_conv
                    is_num = True
            except Exception:
                pass

        if is_num:
            try:
                arr        = s.to_numpy(dtype=np.float64, na_value=np.nan)
                mask       = ~np.isnan(arr)
                valid_idxs = np.where(mask)[0]
                valid_vals = arr[mask]

                if len(valid_vals) == 0:
                    return out

                # Scatter — all points
                try:
                    out['scatter'] = make_scatter(col, valid_idxs, valid_vals)
                except Exception as e:
                    print(f"[charts] scatter error for '{col}': {e}")

                # Histogram
                try:
                    out['hist'] = make_histogram(valid_vals)
                except Exception as e:
                    print(f"[charts] hist error for '{col}': {e}")

                # Boxplot — needs at least 2 unique values
                try:
                    if len(np.unique(valid_vals)) >= 2:
                        out['box'] = make_boxplot(col, valid_vals)
                except Exception as e:
                    print(f"[charts] box error for '{col}': {e}")

            except Exception as e:
                print(f"[charts] numeric processing error for '{col}': {e}")

        elif is_dt:
            try:
                sz   = min(5000, n)
                step = max(1, n // sz)
                idxs = list(range(0, n, step))[:sz]
                samp = s.iloc[idxs]
                ts_list = []
                for v in samp:
                    try:
                        ts_list.append(int(pd.Timestamp(v).timestamp() * 1000))
                    except Exception:
                        ts_list.append(None)
                img = make_datetime_line(col, idxs, ts_list)
                if img:
                    out['scatter'] = img
            except Exception as e:
                print(f"[charts] datetime error for '{col}': {e}")

    except Exception as e:
        print(f"[charts] top-level error for '{col}': {e}")

    return out
