# Script PowerShell de redémarrage du serveur backend PointaFlex
# Usage: .\restart-server.ps1

Write-Host "🔄 Redémarrage du serveur backend PointaFlex..." -ForegroundColor Yellow

# Port par défaut
$PORT = if ($env:PORT) { [int]$env:PORT } else { 3000 }

# Fonction pour tuer les processus sur le port
function Stop-PortProcess {
    param([int]$Port)
    
    Write-Host "Recherche des processus sur le port $Port..." -ForegroundColor Yellow
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        
        if ($connections) {
            $processes = $connections | Select-Object -ExpandProperty OwningProcess -Unique
            
            foreach ($pid in $processes) {
                $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($proc) {
                    Write-Host "Arrêt du processus $pid ($($proc.ProcessName))..." -ForegroundColor Yellow
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    Write-Host "✓ Processus $pid arrêté" -ForegroundColor Green
                }
            }
            Start-Sleep -Seconds 2
        } else {
            Write-Host "✓ Aucun processus trouvé sur le port $Port" -ForegroundColor Green
        }
    } catch {
        Write-Host "✓ Aucun processus trouvé sur le port $Port" -ForegroundColor Green
    }
}

# Fonction pour tuer les processus NestJS/Node
function Stop-NestProcesses {
    Write-Host "Recherche des processus NestJS/Node..." -ForegroundColor Yellow
    
    try {
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        
        if ($nodeProcesses) {
            # Filtrer les processus qui semblent être liés au backend
            $backendProcesses = $nodeProcesses | Where-Object {
                $_.Path -like "*PointaFlex*" -or
                $_.CommandLine -like "*nest start*" -or
                $_.CommandLine -like "*main.js*" -or
                $_.CommandLine -like "*dist/main*"
            }
            
            if ($backendProcesses) {
                foreach ($proc in $backendProcesses) {
                    Write-Host "Arrêt du processus $($proc.Id) ($($proc.ProcessName))..." -ForegroundColor Yellow
                    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                    Write-Host "✓ Processus $($proc.Id) arrêté" -ForegroundColor Green
                }
                Start-Sleep -Seconds 2
            } else {
                Write-Host "✓ Aucun processus NestJS trouvé" -ForegroundColor Green
            }
        } else {
            Write-Host "✓ Aucun processus Node.js trouvé" -ForegroundColor Green
        }
    } catch {
        Write-Host "✓ Aucun processus NestJS trouvé" -ForegroundColor Green
    }
}

# Vérifier qu'on est dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: Ce script doit être exécuté depuis le répertoire backend" -ForegroundColor Red
    exit 1
}

# Étape 1: Arrêter les processus existants
Write-Host "`n=== Étape 1: Arrêt des processus existants ===" -ForegroundColor Cyan
Stop-PortProcess -Port $PORT
Stop-NestProcesses

# Étape 2: Vérifier que le port est libre
Write-Host "`n=== Étape 2: Vérification du port ===" -ForegroundColor Cyan
$stillRunning = Get-NetTCPConnection -LocalPort $PORT -ErrorAction SilentlyContinue
if ($stillRunning) {
    Write-Host "⚠️  Le port $PORT est toujours occupé. Tentative de libération..." -ForegroundColor Red
    Stop-PortProcess -Port $PORT
    Start-Sleep -Seconds 3
    
    # Vérifier à nouveau
    $stillRunning = Get-NetTCPConnection -LocalPort $PORT -ErrorAction SilentlyContinue
    if ($stillRunning) {
        Write-Host "❌ Impossible de libérer le port $PORT" -ForegroundColor Red
        Write-Host "Veuillez arrêter manuellement les processus sur ce port" -ForegroundColor Yellow
        exit 1
    }
}
Write-Host "✓ Port $PORT disponible" -ForegroundColor Green

# Étape 3: Vérifier les dépendances
Write-Host "`n=== Étape 3: Vérification des dépendances ===" -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des dépendances..." -ForegroundColor Yellow
    npm install
    Write-Host "✓ Dépendances installées" -ForegroundColor Green
} else {
    Write-Host "✓ Dépendances présentes" -ForegroundColor Green
}

# Étape 4: Générer Prisma Client si nécessaire
Write-Host "`n=== Étape 4: Génération Prisma Client ===" -ForegroundColor Cyan
if (Test-Path "prisma/schema.prisma") {
    Write-Host "Génération du client Prisma..." -ForegroundColor Yellow
    npx prisma generate
    Write-Host "✓ Prisma Client généré" -ForegroundColor Green
}

# Étape 5: Vérifier les variables d'environnement
Write-Host "`n=== Étape 5: Vérification de la configuration ===" -ForegroundColor Cyan
if (-not (Test-Path ".env") -and -not (Test-Path ".env.local")) {
    Write-Host "⚠️  Aucun fichier .env trouvé" -ForegroundColor Yellow
    Write-Host "Assurez-vous que DATABASE_URL est configuré" -ForegroundColor Yellow
}

# Étape 6: Démarrer le serveur
Write-Host "`n=== Étape 6: Démarrage du serveur ===" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "🚀 Démarrage du serveur en mode développement..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "📍 Le serveur sera accessible sur:" -ForegroundColor Cyan
Write-Host "   • http://localhost:$PORT" -ForegroundColor White
Write-Host "   • http://127.0.0.1:$PORT" -ForegroundColor White
Write-Host "   • http://0.0.0.0:$PORT" -ForegroundColor White
Write-Host "📚 Documentation Swagger:" -ForegroundColor Cyan
Write-Host "   • http://localhost:$PORT/api/docs" -ForegroundColor White
Write-Host "⚠️  Appuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""

# Démarrer le serveur
npm run start:dev
