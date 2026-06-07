@echo off
echo ===================================================
echo Starting TalentAI HRMS - Local Development Environment
echo ===================================================

echo.
echo Starting FastAPI Backend...
start "Backend API" cmd /k "echo Checking backend dependencies... && pip install -r backend/requirements.txt && echo Starting backend server... && uvicorn backend.app.main:app --reload"

echo.
echo Starting React Frontend...
start "Frontend Dashboard" cmd /k "cd frontend && echo Checking frontend dependencies... && npm install && echo Starting frontend server... && npm run dev"

echo.
echo Both services are starting in separate windows.
echo Frontend will be available at http://localhost:5173
echo Backend API docs will be available at http://localhost:8000/docs
echo.
echo You can close this window, or press any key to exit.
pause >nul
