@echo off
echo Starting AI Background Remover API Server...
echo.
cd /d "%~dp0"
call ..\venv\Scripts\activate.bat
python main.py server
pause
