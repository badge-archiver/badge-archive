@echo off
setlocal
rem Редактор бейджей/аддонов. Порт можно передать аргументом: editor.cmd 5000
cd /d "%~dp0.."

where node >nul 2>nul
if errorlevel 1 (
  echo [!] node not found in PATH — нужен Node.js 18+
  pause
  exit /b 1
)

if "%~1"=="" (
  echo Editor: http://localhost:4174/  ^(Ctrl+C — стоп^)
  start "" http://localhost:4174/
) else (
  echo Editor: http://localhost:%~1/  ^(Ctrl+C — стоп^)
)

call node item-editor\server.mjs %*
