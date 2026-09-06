#!/usr/bin/env pwsh
param(
    [int]$Port = 5000
)

$existing = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($existing) {
    $pid = $existing.OwningProcess | Select-Object -First 1
    if ($pid) {
        Write-Host "Stopping existing server on port $Port (PID $pid)..."
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

Write-Host "Starting server on port $Port..."
Set-Location "$PSScriptRoot"
node server.js
