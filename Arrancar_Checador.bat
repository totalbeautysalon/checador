@echo off
title Servidor Checador Total Beauty
color 0D
echo ==================================================
echo   Iniciando Servidor del Checador Total Beauty...
echo ==================================================
echo.
cd /d "%~dp0"

set NODE_OPTIONS=--use-system-ca
set NODE_TLS_REJECT_UNAUTHORIZED=0

:: Verificar si el servidor ya está corriendo en el puerto 3333
netstat -ano | findstr ":3333 " >nul 2>&1
if errorlevel 1 (
    echo Encendiendo motor del checador en puerto 3333...
    start /B cmd.exe /c "npm.cmd run dev > server.log 2>&1"
) else (
    echo El servidor ya se encuentra activo en el puerto 3333.
)

echo.
echo Abriendo la aplicacion de escritorio en pantalla completa...
start /wait msedge.exe --app="%~dp0Cargando_Checador.html" --start-maximized --user-data-dir="%temp%\TB_Checador_Profile_X1"

echo.
echo ==================================================
echo   La ventana fue cerrada.
echo ==================================================

exit
