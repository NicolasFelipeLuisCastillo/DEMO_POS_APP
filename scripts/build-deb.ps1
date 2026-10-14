# Compila el .deb usando Docker (PowerShell).
# Deja el .deb en .\release\

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "▶ Construyendo imagen (solo la primera vez tarda)…" -ForegroundColor Cyan
docker compose build

Write-Host "▶ Compilando .deb…" -ForegroundColor Cyan
docker compose run --rm build

Write-Host ""
Write-Host "✅ El .deb quedó en .\release\" -ForegroundColor Green
Get-ChildItem release\*.deb | Format-Table Name, Length
