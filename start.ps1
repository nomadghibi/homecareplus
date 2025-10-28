#!/usr/bin/env pwsh

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  Care Connect Pro - Quick Start" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "[1/2] Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "[1/2] Dependencies already installed (skipping)" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/2] Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "The app will be available at: " -NoNewline
Write-Host "http://localhost:5173" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

npm run dev
