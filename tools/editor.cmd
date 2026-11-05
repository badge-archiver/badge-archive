@echo off
setlocal
rem Редактор бейджей/аддонов. Порт можно передать аргументом: editor.cmd 5000
cd /d "%~dp0.."

where node >nul 2>nul
if errorlevel 1 (
  echo [!] node not found in PATH — need Node.js 18+
  pause
  exit /b 1
)

if "%~1"=="" (
  echo Editor: http://localhost:4174/  ^(Ctrl+C — stop^)
  start "" http://localhost:4174/
) else (
  echo Editor: http://localhost:%~1/  ^(Ctrl+C — stop^)
)

call node tools\item-editor\server.mjs %*
