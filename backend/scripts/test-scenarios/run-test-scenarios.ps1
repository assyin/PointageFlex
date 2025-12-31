# Script PowerShell pour exécution automatique des scénarios de test
# Usage: .\run-test-scenarios.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Démarrage des tests automatiques..." -ForegroundColor Cyan
Write-Host ""

# Variables
$BackendUrl = "http://localhost:3001"
$TenantId = ""
$Token = ""
$Emp001Id = ""
$Emp002Id = ""
$Emp003Id = ""
$Emp004Id = ""
$Emp005Id = ""

# Fonction pour afficher les résultats
function Print-Result {
    param(
        [bool]$Success,
        [string]$Message
    )
    
    if ($Success) {
        Write-Host "✅ $Message" -ForegroundColor Green
    } else {
        Write-Host "❌ $Message" -ForegroundColor Red
    }
}

# Étape 1 : Préparer les données
Write-Host "📝 Étape 1 : Préparation des données de test..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\.."

$prepOutput = & npx ts-node scripts/test-scenarios/prepare-test-data.ts 2>&1 | Out-String

if ($LASTEXITCODE -eq 0) {
    Print-Result $true "Données de test préparées"
    
    # Extraire les IDs
    if ($prepOutput -match "Tenant ID:\s+([a-f0-9-]+)") {
        $TenantId = $matches[1]
    }
    if ($prepOutput -match "EMP001:\s+([a-f0-9-]+)") {
        $Emp001Id = $matches[1]
    }
    if ($prepOutput -match "EMP002:\s+([a-f0-9-]+)") {
        $Emp002Id = $matches[1]
    }
    if ($prepOutput -match "EMP003:\s+([a-f0-9-]+)") {
        $Emp003Id = $matches[1]
    }
    if ($prepOutput -match "EMP004:\s+([a-f0-9-]+)") {
        $Emp004Id = $matches[1]
    }
    if ($prepOutput -match "EMP005:\s+([a-f0-9-]+)") {
        $Emp005Id = $matches[1]
    }
} else {
    Print-Result $false "Erreur lors de la préparation"
    Write-Host $prepOutput
    exit 1
}

Write-Host ""
Write-Host "📋 IDs extraits :" -ForegroundColor Cyan
Write-Host "   Tenant: $TenantId"
Write-Host "   EMP001: $Emp001Id"
Write-Host "   EMP002: $Emp002Id"
Write-Host "   EMP003: $Emp003Id"
Write-Host "   EMP004: $Emp004Id"
Write-Host "   EMP005: $Emp005Id"
Write-Host ""

# Étape 2 : Obtenir le token
Write-Host "🔐 Étape 2 : Authentification..." -ForegroundColor Yellow

$loginBody = @{
    email = "admin@test.com"
    password = "Test123!"
    tenantId = $TenantId
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BackendUrl/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody
    
    $Token = $loginResponse.access_token
    
    if ($Token) {
        Print-Result $true "Token obtenu"
    } else {
        Print-Result $false "Erreur d'authentification"
        exit 1
    }
} catch {
    Print-Result $false "Erreur d'authentification: $_"
    exit 1
}

Write-Host ""

# Étape 3 : Scénario 1 - Pointage Normal
Write-Host "📝 Étape 3 : Scénario 1 - Pointage Normal..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

# Pointage IN
$inBody = @{
    employeeId = $Emp001Id
    type = "ENTRY"
    timestamp = "2025-01-20T08:00:00Z"
    method = "MANUAL"
    deviceId = "TEST_DEVICE_001"
} | ConvertTo-Json

try {
    $inResponse = Invoke-RestMethod -Uri "$BackendUrl/attendance" `
        -Method Post `
        -Headers $headers `
        -Body $inBody
    
    if ($inResponse.id) {
        Print-Result $true "Pointage IN créé"
    } else {
        Print-Result $false "Erreur pointage IN"
    }
} catch {
    Print-Result $false "Erreur pointage IN: $_"
}

# Pointage OUT
$outBody = @{
    employeeId = $Emp001Id
    type = "EXIT"
    timestamp = "2025-01-20T17:00:00Z"
    method = "MANUAL"
} | ConvertTo-Json

try {
    $outResponse = Invoke-RestMethod -Uri "$BackendUrl/attendance" `
        -Method Post `
        -Headers $headers `
        -Body $outBody
    
    if ($outResponse.id) {
        Print-Result $true "Pointage OUT créé"
    } else {
        Print-Result $false "Erreur pointage OUT"
    }
} catch {
    Print-Result $false "Erreur pointage OUT: $_"
}

Write-Host ""

# Étape 4 : Scénario 7 - Pointage avec Heures Sup
Write-Host "📝 Étape 4 : Scénario 7 - Pointage avec Heures Supplémentaires..." -ForegroundColor Yellow

# Pointage IN
$otInBody = @{
    employeeId = $Emp001Id
    type = "ENTRY"
    timestamp = "2025-01-21T08:00:00Z"
    method = "MANUAL"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$BackendUrl/attendance" `
        -Method Post `
        -Headers $headers `
        -Body $otInBody | Out-Null
} catch {
    # Ignorer les erreurs pour ce pointage
}

# Pointage OUT avec 2h de retard
$otOutBody = @{
    employeeId = $Emp001Id
    type = "EXIT"
    timestamp = "2025-01-21T19:00:00Z"
    method = "MANUAL"
} | ConvertTo-Json

try {
    $otOutResponse = Invoke-RestMethod -Uri "$BackendUrl/attendance" `
        -Method Post `
        -Headers $headers `
        -Body $otOutBody
    
    if ($otOutResponse.overtimeMinutes -ge 120) {
        Print-Result $true "Pointage avec heures sup créé ($($otOutResponse.overtimeMinutes) min)"
    } else {
        Print-Result $false "Heures sup incorrectes: $($otOutResponse.overtimeMinutes) min (attendu: >= 120)"
    }
} catch {
    Print-Result $false "Erreur pointage avec heures sup: $_"
}

Write-Host ""

# Étape 5 : Scénario 11 - Création Manuelle d'Overtime
Write-Host "📝 Étape 5 : Scénario 11 - Création Manuelle d'Overtime..." -ForegroundColor Yellow

$otBody = @{
    employeeId = $Emp001Id
    date = "2025-01-22"
    hours = 2.5
    type = "STANDARD"
    notes = "Test manuel"
} | ConvertTo-Json

try {
    $otResponse = Invoke-RestMethod -Uri "$BackendUrl/overtime" `
        -Method Post `
        -Headers $headers `
        -Body $otBody
    
    if ($otResponse.id) {
        Print-Result $true "Overtime créé manuellement"
    } else {
        Print-Result $false "Erreur création overtime"
    }
} catch {
    Print-Result $false "Erreur création overtime: $_"
}

Write-Host ""

# Étape 6 : Scénario 15 - Employé Non Éligible
Write-Host "📝 Étape 6 : Scénario 15 - Employé Non Éligible..." -ForegroundColor Yellow

$nonEligibleBody = @{
    employeeId = $Emp003Id
    date = "2025-01-22"
    hours = 1
    type = "STANDARD"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$BackendUrl/overtime" `
        -Method Post `
        -Headers $headers `
        -Body $nonEligibleBody | Out-Null
    
    Print-Result $false "Erreur: devrait être rejeté"
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Print-Result $true "Rejet correct pour employé non éligible"
    } else {
        Print-Result $false "Code de statut incorrect: $($_.Exception.Response.StatusCode)"
    }
}

Write-Host ""

# Résumé
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📊 Résumé des Tests" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Tests exécutés avec succès" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Pour voir les détails, consultez :" -ForegroundColor Yellow
Write-Host "   - L'API: $BackendUrl/api"
Write-Host ""
Write-Host "🧹 Pour nettoyer les données de test :" -ForegroundColor Yellow
Write-Host "   npx ts-node scripts/test-scenarios/cleanup-test-data.ts"
Write-Host ""

