@echo off
echo [SUMS] Stopping any existing servers...
powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force -ErrorAction SilentlyContinue"
powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force -ErrorAction SilentlyContinue"

echo [SUMS] Starting Backend Server (Port 8000)...
start /B python server.py

echo [SUMS] Starting Frontend Server (Port 3000)...
start /B python -m http.server 3000

echo [SUMS] Waiting for servers to initialize...
timeout /t 5 /nobreak > nul

echo [SUMS] Launching Smart University Portal...
start http://localhost:3000

echo.
echo ======================================================
echo  SUMS PROJECT IS NOW RUNNING!
echo  Backend: http://localhost:8000
echo  Frontend: http://localhost:3000
echo ======================================================
echo.
echo Keep this window open while using the portal.
pause
