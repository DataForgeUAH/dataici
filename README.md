# DataICI — v0.2

Herramienta visual de preprocesamiento de datos para estudiantes de Ingeniería Civil Industrial.

## Requisitos previos
- Python 3.9+ → https://python.org
- Node.js 18+ → https://nodejs.org

---

## Instalación y ejecución

### 1. Backend (FastAPI + pandas)

Abre una terminal en la carpeta `dataici/`:

```bash
# Windows
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Mac
cd backend
pip3 install -r requirements.txt
uvicorn main:app --reload
```

Backend corriendo en: http://localhost:8000

---

### 2. Frontend (React)

Abre **otra terminal**:

```bash
cd frontend
npm install
npm run dev
```

App disponible en: http://localhost:5173

---

## Estructura del proyecto

```
dataici/
├── backend/
│   ├── main.py                ← API FastAPI
│   ├── requirements.txt
│   └── blocks/                ← un archivo por bloque
│       ├── load_csv.py
│       ├── drop_nulls.py
│       ├── filter_rows.py
│       ├── groupby.py
│       └── export_csv.py
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx              ← app principal
        ├── nodes/
        │   └── BlockNode.jsx    ← nodo del canvas
        └── panels/
            ├── Sidebar.jsx      ← bloques disponibles
            ├── ParamsPanel.jsx  ← parámetros del bloque
            └── PreviewPanel.jsx ← resultados
```

---

## Cómo agregar un nuevo bloque

Solo crear `backend/blocks/nuevo_bloque.py`. El frontend lo detecta automáticamente.

```python
METADATA = {
    "type": "mi_bloque",
    "label": "Mi bloque",
    "category": "Limpieza",   # Entrada / Salida | Limpieza | Análisis
    "params": [
        {"key": "columna", "label": "Columna", "type": "text", "default": ""},
        {"key": "metodo", "label": "Método", "type": "select", "options": ["a", "b"], "default": "a"},
        {"key": "activo", "label": "Activar", "type": "toggle", "default": False},
    ]
}

def run(df, params):
    col = params.get("columna")
    df = df.drop(columns=[col])
    code = [f'df = df.drop(columns=["{col}"])']
    return df, code
```
