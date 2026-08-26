@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Mode Launch
if errorlevel 1 (
  echo.
  echo Game startup failed. See server-error.txt for details.
  pause
)
