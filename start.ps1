$ErrorActionPreference = 'Stop'
$python = Join-Path (Split-Path $PSScriptRoot -Parent) '项目大全-本地前端\runtime\python.exe'
try {
    $response = Invoke-WebRequest 'http://127.0.0.1:8849/' -UseBasicParsing -TimeoutSec 2
    if ($response.Content -match 'RAYVYN') {
        Write-Output 'RAYVYN is running: http://127.0.0.1:8849/'
        exit
    }
} catch {}
$server = Join-Path $PSScriptRoot 'frontend\serve.py'
Start-Process -FilePath $python -ArgumentList ('"' + $server + '"'), '8849' -WorkingDirectory $PSScriptRoot -WindowStyle Hidden
Write-Output 'RAYVYN: http://127.0.0.1:8849/'
