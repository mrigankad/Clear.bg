@echo off
cd /d "%~dp0backend"
call ..\venv\Scripts\activate.bat
uvicorn api.server:app --reload --port 8000
pause
