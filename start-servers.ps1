# Script pour démarrer les deux serveurs PointageFlex

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Démarrage des serveurs PointageFlex" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Démarrer le backend
Write-Host "Démarrage du Backend (port 3000)..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:rootPath\backend
    npm run start:dev
}

# Démarrer le frontend
Write-Host "Démarrage du Frontend (port 3001)..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:rootPath\frontend
    npm run dev
}

Write-Host ""
Write-Host "Les serveurs sont en cours de démarrage..." -ForegroundColor Green
Write-Host "Backend: http://localhost:3000" -ForegroundColor White
Write-Host "Frontend: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arrêter les serveurs" -ForegroundColor Gray
Write-Host ""

# Afficher les logs
while ($true) {
    $backendOutput = Receive-Job -Job $backendJob -ErrorAction SilentlyContinue
    $frontendOutput = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue
    
    if ($backendOutput) {
        Write-Host "[BACKEND] $backendOutput" -ForegroundColor Cyan
    }
    if ($frontendOutput) {
        Write-Host "[FRONTEND] $frontendOutput" -ForegroundColor Magenta
    }
    
    Start-Sleep -Milliseconds 500
}

