@echo off
title Spring Boot Backend Server (MySQL Connector)
color 0a

echo =========================================================================
echo  Starting Spring Boot Backend on http://localhost:8080
echo  Connecting to MySQL Database: campus_lostandfound
echo =========================================================================
echo.

cd /d "%~dp0backend"
mvn spring-boot:run

pause
