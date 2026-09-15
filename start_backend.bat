@echo off
title Spring Boot Backend Server (MySQL Connector)
color 0a

echo =========================================================================
echo  Starting Spring Boot Backend on http://localhost:8080
echo  Connecting to MySQL Cloud Database (Aiven): defaultdb
echo =========================================================================
echo.

set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%

cd /d "%~dp0backend"
mvn spring-boot:run

pause
