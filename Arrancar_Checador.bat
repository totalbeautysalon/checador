@echo off
title Servidor Checador Total Beauty
color 0D
echo ==================================================
echo   Iniciando Servidor del Checador Total Beauty...
echo ==================================================
echo.
cd /d "%~dp0"

:: Iniciar el servidor en segundo plano con certificados de Windows para evitar errores de Firebase
set NODE_OPTIONS=--use-system-ca
set NODE_TLS_REJECT_UNAUTHORIZED=0
start /B cmd /c "npm run dev > server.log 2>&1"

echo.
echo Abriendo la aplicacion de escritorio en pantalla completa...
:: Abrir Edge en modo App maximizado con un perfil de navegador 100% aislado
start /wait msedge.exe --app="%~dp0Cargando_Checador.html" --start-maximized --user-data-dir="%temp%\TB_Checador_Profile_X1"

echo.
echo ==================================================
echo   La ventana fue cerrada. El servidor sigue encendido
echo   en segundo plano para cargar instantáneamente.
echo ==================================================

exit
