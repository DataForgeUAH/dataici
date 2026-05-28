"""
DataICI — punto de entrada de línea de comandos.

Uso:
    dataici                    # corre en 127.0.0.1:8000
    dataici --port 8080        # puerto personalizado
    dataici --no-browser       # no abrir navegador automáticamente
"""
import argparse
import os
import threading
import time
import webbrowser

import uvicorn


def main():
    parser = argparse.ArgumentParser(
        prog="dataici",
        description="DataICI — Studio de Preprocesamiento de Datos (UAH)",
    )
    parser.add_argument("--host",       default="127.0.0.1", help="Host (default: 127.0.0.1)")
    parser.add_argument("--port",       default=8000, type=int, help="Puerto (default: 8000)")
    parser.add_argument("--no-browser", action="store_true",   help="No abrir el navegador automáticamente")
    args = parser.parse_args()

    url = f"http://{args.host}:{args.port}"

    if not args.no_browser:
        def _open():
            time.sleep(1.8)
            webbrowser.open(url)
        t = threading.Thread(target=_open, daemon=True)
        t.start()

    print(f"\n  🚀 DataICI corriendo en {url}\n")
    uvicorn.run(
        "dataici.main:app",
        host=args.host,
        port=args.port,
        reload=False,
        log_level="warning",
    )


if __name__ == "__main__":
    main()
