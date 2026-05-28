import streamlit as st
from blocks.load_csv import block_load_csv

st.set_page_config(
    page_title="DataICI",
    page_icon="📊",
    layout="wide"
)

st.title("📊 DataICI")
st.caption("Herramienta de preprocesamiento de datos — prototipo v0.1")

# --- Estado del pipeline ---
if "df" not in st.session_state:
    st.session_state.df = None
if "code_lines" not in st.session_state:
    st.session_state.code_lines = []

# --- Pipeline (por ahora solo carga) ---
st.sidebar.header("Pipeline")
st.sidebar.markdown("**Paso 1** — Cargar CSV")
st.sidebar.divider()
st.sidebar.info("Agrega más bloques aquí en versiones futuras.")

# --- Bloque 1: Cargar CSV ---
df, code = block_load_csv()

if df is not None:
    st.session_state.df = df
    st.session_state.code_lines = code

# --- Vista previa ---
if st.session_state.df is not None:
    df = st.session_state.df

    st.divider()
    st.subheader("Vista previa")

    col1, col2, col3 = st.columns(3)
    col1.metric("Filas", df.shape[0])
    col2.metric("Columnas", df.shape[1])
    col3.metric("Nulos totales", int(df.isnull().sum().sum()))

    st.dataframe(df.head(50), use_container_width=True)

    with st.expander("Tipos de datos"):
        st.dataframe(
            df.dtypes.reset_index().rename(columns={"index": "columna", 0: "tipo"}),
            use_container_width=True
        )

    with st.expander("Estadísticos descriptivos"):
        st.dataframe(df.describe(), use_container_width=True)

    # --- Código generado ---
    st.divider()
    st.subheader("Código Python generado")
    code_str = "\n".join(st.session_state.code_lines)
    st.code(code_str, language="python")

    st.download_button(
        label="⬇️ Descargar script .py",
        data=code_str,
        file_name="pipeline_dataici.py",
        mime="text/plain"
    )
