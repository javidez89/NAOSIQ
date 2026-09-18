$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
if (-not (Get-Process -Name 'com.docker.backend' -ErrorAction SilentlyContinue)) {
    Start-Process -FilePath 'C:\Program Files\Docker\Docker\Docker Desktop.exe' -WindowStyle Hidden
    Write-Host 'Docker Desktop se está iniciando. Espera a que esté listo y ejecuta de nuevo este archivo.'
    exit 0
}
npm.cmd run local
