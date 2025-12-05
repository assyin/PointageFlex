# Script de configuration automatique du Port Forwarding WSL -> Windows
# A executer en tant qu'ADMINISTRATEUR a chaque demarrage Windows
# Ou configurer comme Tache Planifiee Windows

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Configuration Port Forwarding WSL" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Recuperer l'IP actuelle de WSL
Write-Host "[1/4] Recuperation de l'IP WSL..." -ForegroundColor Yellow
$wslIP = (wsl hostname -I).Trim()

if ([string]::IsNullOrWhiteSpace($wslIP)) {
    Write-Host "ERREUR: Impossible de recuperer l'IP WSL" -ForegroundColor Red
    Write-Host "   Verifiez que WSL est bien demarre" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "   IP WSL detectee: $wslIP" -ForegroundColor Green
Write-Host ""

# 2. Recuperer l'IP Windows sur le reseau local
Write-Host "[2/4] Recuperation de l'IP Windows..." -ForegroundColor Yellow
$windowsIP = "192.168.16.40"  # Votre IP Windows
Write-Host "   IP Windows: $windowsIP" -ForegroundColor Green
Write-Host ""

# 3. Supprimer les anciennes regles de port forwarding
Write-Host "[3/4] Suppression des anciennes regles..." -ForegroundColor Yellow
try {
    netsh interface portproxy delete v4tov4 listenport=3000 listenaddress=$windowsIP 2>$null
    netsh interface portproxy delete v4tov4 listenport=8081 listenaddress=$windowsIP 2>$null
    Write-Host "   Anciennes regles supprimees" -ForegroundColor Green
} catch {
    Write-Host "   Pas d'anciennes regles a supprimer" -ForegroundColor Gray
}
Write-Host ""

# 4. Creer les nouvelles regles de port forwarding
Write-Host "[4/4] Creation des nouvelles regles..." -ForegroundColor Yellow

# Port 3000 - Backend PointaFlex
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=$windowsIP connectport=3000 connectaddress=$wslIP
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Port 3000 (Backend) configure" -ForegroundColor Green
} else {
    Write-Host "   Erreur configuration port 3000" -ForegroundColor Red
}

# Port 8081 - ADMS Listener
netsh interface portproxy add v4tov4 listenport=8081 listenaddress=$windowsIP connectport=8081 connectaddress=$wslIP
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Port 8081 (ADMS Listener) configure" -ForegroundColor Green
} else {
    Write-Host "   Erreur configuration port 8081" -ForegroundColor Red
}

Write-Host ""

# 5. Configurer le Firewall Windows (si pas deja fait)
Write-Host "[5/5] Configuration du Firewall..." -ForegroundColor Yellow

# Verifier si les regles existent deja
$ruleBackend = Get-NetFirewallRule -DisplayName "PointaFlex Backend" -ErrorAction SilentlyContinue
$ruleADMS = Get-NetFirewallRule -DisplayName "ADMS Listener" -ErrorAction SilentlyContinue

if (-not $ruleBackend) {
    New-NetFirewallRule -DisplayName "PointaFlex Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow | Out-Null
    Write-Host "   Regle Firewall Backend creee" -ForegroundColor Green
} else {
    Write-Host "   Regle Firewall Backend existe deja" -ForegroundColor Gray
}

if (-not $ruleADMS) {
    New-NetFirewallRule -DisplayName "ADMS Listener" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow | Out-Null
    Write-Host "   Regle Firewall ADMS creee" -ForegroundColor Green
} else {
    Write-Host "   Regle Firewall ADMS existe deja" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  CONFIGURATION TERMINEE" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Afficher la configuration actuelle
Write-Host "Configuration actuelle du Port Forwarding:" -ForegroundColor Yellow
Write-Host ""
netsh interface portproxy show v4tov4
Write-Host ""

Write-Host "Votre backend est maintenant accessible a:" -ForegroundColor Cyan
Write-Host "   Depuis le reseau local: http://$windowsIP:3000" -ForegroundColor White
Write-Host "   ADMS Listener: $windowsIP:8081" -ForegroundColor White
Write-Host ""

Write-Host "Prochaines etapes:" -ForegroundColor Yellow
Write-Host "   1. Dans WSL, demarrer le backend (si pas deja fait)" -ForegroundColor White
Write-Host "   2. Dans WSL, lancer: python3 adms_listener.py" -ForegroundColor White
Write-Host "   3. Sur le terminal IN01, configurer:" -ForegroundColor White
Write-Host "      - Adresse: $windowsIP" -ForegroundColor White
Write-Host "      - Port: 8081" -ForegroundColor White
Write-Host "      - Mode: ADMS" -ForegroundColor White
Write-Host ""

pause
