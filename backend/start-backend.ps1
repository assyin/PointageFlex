# =====================================================
# Script de démarrage du Backend PointageFlex
# =====================================================
# Ce script démarre le serveur NestJS backend
# =====================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  POINTAGEFLEX - Backend Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Node.js est installé
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Vérifier si npm est installé
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "✗ npm not found. Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Vérifier si node_modules existe
if (!(Test-Path "node_modules")) {
    Write-Host "node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
    Write-Host ""
}

# Vérifier si .env existe
if (!(Test-Path ".env")) {
    Write-Host "✗ .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with your Supabase credentials" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ .env file found" -ForegroundColor Green
Write-Host ""

# Démarrer le serveur
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting NestJS Backend Server..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend will be available at:" -ForegroundColor Yellow
Write-Host "  → http://localhost:3000" -ForegroundColor White
Write-Host "  → Swagger docs: http://localhost:3000/api/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Lancer le serveur en mode développement
npm run start:dev
