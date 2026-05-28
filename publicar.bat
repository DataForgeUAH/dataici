@echo off
REM DataICI — publicar cambios a GitHub (Windows)
REM Uso: publicar.bat "descripción del cambio"

SET MSG=%~1
IF "%MSG%"=="" SET MSG=Actualización DataICI

echo 🔨 Compilando frontend...
cd frontend
call npm run build
IF ERRORLEVEL 1 (echo ❌ Error al compilar & exit /b 1)

echo 📦 Copiando archivos...
cd ..
rmdir /s /q dataici\static
xcopy /e /i /y frontend\dist dataici\static

echo 🚀 Subiendo a GitHub...
git add .
git commit -m "%MSG%"
git push

echo.
echo ✅ Listo. Los usuarios actualizan con:
echo    pip install --upgrade git+https://github.com/dataforgeuah/dataici.git
