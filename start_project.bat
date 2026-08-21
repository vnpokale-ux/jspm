@echo off
title TSSM BSCOER Campus Lost & Found System Launcher
color 0b

echo =========================================================================
echo  TSSM's Bhivarabai Sawant College of Engineering and Research, Pune
echo  JSPM Group of Institutes - Campus Lost and Found Platform
echo =========================================================================
echo.

echo [1/2] Starting Spring Boot Backend in a new window...
start "Spring Boot Backend (MySQL)" "%~dp0start_backend.bat"

echo [2/2] Opening Frontend Web Application in Default Browser...
start "" "%~dp0frontend\index.html"

echo.
echo =========================================================================
echo  1. Spring Boot is running and connected to MySQL on: http://localhost:8080
echo  2. Frontend is running at: file:///%~dp0frontend/index.html
echo =========================================================================
pause
