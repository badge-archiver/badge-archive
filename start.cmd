@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [!] node not in PATH — need Node.js 18+ с nodejs.org
  pause
  exit /b 1
)

echo [1/2] build dist\ ...
call node tools\build.mjs
if errorlevel 1 (
  echo [!] build failed — check errors
  pause
  exit /b 1
)

echo [2/2] starting server at http://localhost:4173/ (Ctrl+C — stop)
start "" http://localhost:4173/
call node tools\preview.mjs
