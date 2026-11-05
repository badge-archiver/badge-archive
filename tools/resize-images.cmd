@echo off
setlocal
rem Ресайз/пережатие картинок для веба. Запускается из любого места — сам найдёт корень репо.
rem Аргументы прокидываются скрипту: --dry-run, --keep-size, --max-width=N, --max-kb=N, каталог...
cd /d "%~dp0.."

where node >nul 2>nul
if errorlevel 1 (
  echo [!] node not found in PATH — нужен Node.js 18+
  pause
  exit /b 1
)

call node tools\resize-images.mjs %*
set EXITCODE=%errorlevel%

echo.
pause
exit /b %EXITCODE%
