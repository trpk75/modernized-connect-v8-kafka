$ErrorActionPreference = "SilentlyContinue"

$repo = Split-Path -Parent $PSScriptRoot
$pidDir = Join-Path $repo "data\pids"

if (Test-Path $pidDir) {
  Get-ChildItem $pidDir -Filter "*.pid" | ForEach-Object {
    $pidValue = Get-Content $_.FullName -Raw
    if ($pidValue) {
      Stop-Process -Id ([int]$pidValue.Trim()) -Force
    }
    Remove-Item $_.FullName -Force
  }
}

Write-Output "Stopped tracked modernized microservices."
