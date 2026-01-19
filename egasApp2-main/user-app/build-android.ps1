# Android Build Setup Script
# This script sets up the environment and builds the Android app

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Egas User App - Android Build Setup  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set JAVA_HOME to Android Studio's JDK
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
Write-Host "[OK] JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Green

# Add Java to PATH
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
Write-Host "[OK] Java added to PATH" -ForegroundColor Green

# Set ANDROID_HOME
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
Write-Host "[OK] ANDROID_HOME set to: $env:ANDROID_HOME" -ForegroundColor Green

# Add Android SDK tools to PATH
$env:Path = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools;$env:Path"
Write-Host "[OK] Android SDK tools added to PATH" -ForegroundColor Green

Write-Host ""
Write-Host "Verifying Java installation..." -ForegroundColor Yellow
java -version

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Java not found!" -ForegroundColor Red
    Write-Host "Please make sure Android Studio is installed at:" -ForegroundColor Red
    Write-Host "  C:\Program Files\Android\Android Studio\" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Android Build...             " -ForegroundColor Cyan
Write-Host "  This will take 5-10 minutes            " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Run the Android build
npx expo run:android

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  [SUCCESS] Build Complete!            " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  [ERROR] Build Failed                 " -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    exit 1
}
