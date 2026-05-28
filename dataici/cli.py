"""
DataForge — punto de entrada de línea de comandos.

Uso:
    dataici                 # corre en 127.0.0.1:8000
    dataici --port 8080     # puerto personalizado
"""
import argparse
import uvicorn


def main():
    parser = argparse.ArgumentParser(
        prog="dataici",
        description="DataForge — Studio de Preprocesamiento de Datos (UAH)",
    )
    parser.add_argument("--host", default="127.0.0.1", help="Host (default: 127.0.0.1)")
    parser.add_argument("--port", default=8000, type=int, help="Puerto (default: 8000)")
    args = parser.parse_args()

    url = f"http://{args.host}:{args.port}"
    print(f"\n  🚀 DataForge corriendo en {url}")
    print(f"  → Vuelve a la página y haz clic en 'Abrir DataForge'\n")

    uvicorn.run(
        "dataici.main:app",
        host=args.host,
        port=args.port,
        reload=False,
        log_level="warning",
    )


if __name__ == "__main__":
    main()
