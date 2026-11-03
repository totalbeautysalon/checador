@echo off
chcp 65001 >nul
title Subir Checador a GitHub - Total Beauty
color 0B

echo ==========================================================
echo       SUBIR CAMBIOS DEL CHECADOR A GITHUB
echo ==========================================================
echo.

cd /d "%~dp0"

:: 1. Localizar Git en el sistema
set "GIT_CMD="
where git >nul 2>&1 && set "GIT_CMD=git"

if not defined GIT_CMD (
    if exist "%LOCALAPPDATA%\Programs\MinGit\cmd\git.exe" (
        set "GIT_CMD=%LOCALAPPDATA%\Programs\MinGit\cmd\git.exe"
    ) else if exist "C:\Program Files\Git\cmd\git.exe" (
        set "GIT_CMD=C:\Program Files\Git\cmd\git.exe"
    ) else if exist "C:\Program Files (x86)\Git\cmd\git.exe" (
        set "GIT_CMD=C:\Program Files (x86)\Git\cmd\git.exe"
    )
)

if not defined GIT_CMD (
    color 0C
    echo [ERROR] No se encontró Git instalado en esta computadora.
    echo.
    pause
    exit /b 1
)

:: 2. Verificar si es un repositorio Git
if not exist ".git" (
    echo Inicializando repositorio Git...
    "%GIT_CMD%" init -b main
    "%GIT_CMD%" remote add origin https://github.com/totalbeautysalon/checador.git
)

:: 3. Asegurar que el remote apunte al repositorio correcto
"%GIT_CMD%" remote get-url origin >nul 2>&1
if errorlevel 1 (
    "%GIT_CMD%" remote add origin https://github.com/totalbeautysalon/checador.git
)

:: 4. Mostrar archivos modificados
echo Archivos detectados con cambios:
echo ----------------------------------------------------------
"%GIT_CMD%" status --short
echo ----------------------------------------------------------
echo.

:: 5. Pedir mensaje del commit
set "COMMIT_MSG="
set /p "COMMIT_MSG=Escribe una descripción del cambio (o presiona ENTER para automático): "

if "%COMMIT_MSG%"=="" (
    set "COMMIT_MSG=Actualización del Checador - %date% %time:~0,5%"
)

echo.
echo [1/3] Agregando archivos al control de versiones...
"%GIT_CMD%" add -A

echo [2/3] Guardando cambios localmente: "%COMMIT_MSG%"...
"%GIT_CMD%" commit -m "%COMMIT_MSG%"

echo.
echo [3/3] Subiendo cambios a GitHub (rama main)...
"%GIT_CMD%" push origin main

if errorlevel 1 (
    color 0C
    echo.
    echo ==========================================================
    echo   [ERROR] Hubo un problema al subir a GitHub.
    echo   Verifica tu conexión a internet o tus credenciales.
    echo ==========================================================
) else (
    color 0A
    echo.
    echo ==========================================================
    echo   ¡ÉXITO! Todos los cambios se subieron correctamente.
    echo   Repositorio: https://github.com/totalbeautysalon/checador
    echo ==========================================================
)

echo.
pause
