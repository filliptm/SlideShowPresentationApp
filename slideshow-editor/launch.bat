@echo off
REM Slideshow Presentation Studio Launch Script (Windows)

echo.
echo Starting Slideshow Presentation Studio...
echo.

REM Check if frontend node_modules exists
if not exist "node_modules\" (
    echo Installing frontend dependencies...
    call npm install
    echo.
)

REM Check if backend node_modules exists
if not exist "..\server\node_modules\" (
    echo Installing backend dependencies...
    cd ..\server
    call npm install
    cd ..\slideshow-editor
    echo.
)

REM Start backend server
echo Starting backend server...
start "Backend Server" cmd /c "cd ..\server && npm start"

REM Wait for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend dev server
echo Starting frontend...
echo.
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:3001
echo.
echo Press Ctrl+C to stop (you may need to close both windows)
echo.

call npm run dev
