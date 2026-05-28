#!/bin/bash
# DataICI — publicar cambios a GitHub
# Uso: bash publicar.sh "descripción del cambio"

MSG=${1:-"Actualización DataICI"}

echo "🔨 Compilando frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then echo "❌ Error al compilar"; exit 1; fi

echo "📦 Copiando archivos..."
cd ..
rm -rf dataici/static/*
cp -r frontend/dist/. dataici/static/

echo "🚀 Subiendo a GitHub..."
git add .
git commit -m "$MSG"
git push

echo ""
echo "✅ Listo. Los usuarios actualizan con:"
echo "   pip install --upgrade git+https://github.com/dataforgeuah/dataici.git"
