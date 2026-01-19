@echo off
REM Android Build Setup Script
REM This script sets up the environment and builds the Android app

echo ========================================
echo   Egas User App - Android Build Setup
echo ========================================
echo.

REM Set JAVA_HOME to Android Studio's JDK
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
echo [OK] JAVA_HOME set to: %JAVA_HOME%

REM Add Java to PATH
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo [OK] Java added to PATH

REM Set ANDROID_HOME
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
echo [OK] ANDROID_HOME set to: %ANDROID_HOME%

REM Add Android SDK tools to PATH
set "PATH=%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%PATH%"
echo [OK] Android SDK tools added to PATH

echo.
echo Verifying Java installation...
java -version

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Java not found!
    echo Please make sure Android Studio is installed at:
    echo   C:\Program Files\Android\Android Studio\
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Starting Android Build...
echo   This will take 5-10 minutes
echo ========================================
echo.

REM Run the Android build
call npx expo run:android

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   [OK] Build Complete!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo   [ERROR] Build Failed
    echo ========================================
    pause
    exit /b 1
)

pause
