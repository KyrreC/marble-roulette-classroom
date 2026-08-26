@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Mode Stop
if errorlevel 1 (
  echo.
  echo Game server could not be stopped. See the error above.
  pause
)
