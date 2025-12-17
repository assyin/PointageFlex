#!/bin/bash

# Script de test pour la création de planning
# Usage: ./test-schedule-creation.sh

set -e

echo "🧪 Tests de la fonctionnalité de création de planning"
echo "=================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
API_URL="${API_URL:-http://localhost:3000/api/v1}"
TOKEN="${TOKEN:-your_token_here}"

# Fonction pour tester une requête
test_request() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5
    
    echo -n "Test: $name... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d "$data" \
            "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X GET \
            -H "Authorization: Bearer $TOKEN" \
            "$API_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓${NC} (HTTP $http_code)"
        return 0
    else
        echo -e "${RED}✗${NC} (HTTP $http_code, attendu $expected_status)"
        echo "Réponse: $body"
        return 1
    fi
}

# Test 1: Création planning simple
echo "1. Test création planning simple (jour unique)"
test_request \
    "Création planning simple" \
    "POST" \
    "/schedules" \
    '{
        "employeeId": "test-employee-id",
        "shiftId": "test-shift-id",
        "dateDebut": "2025-01-15"
    }' \
    "201"

echo ""
echo "2. Test validation heures personnalisées invalides"
test_request \
    "Heures invalides (fin < début)" \
    "POST" \
    "/schedules" \
    '{
        "employeeId": "test-employee-id",
        "shiftId": "test-shift-id",
        "dateDebut": "2025-01-15",
        "customStartTime": "18:00",
        "customEndTime": "08:00"
    }' \
    "400"

echo ""
echo "3. Test validation intervalle trop grand"
test_request \
    "Intervalle > 365 jours" \
    "POST" \
    "/schedules" \
    '{
        "employeeId": "test-employee-id",
        "shiftId": "test-shift-id",
        "dateDebut": "2025-01-01",
        "dateFin": "2026-01-01"
    }' \
    "400"

echo ""
echo "✅ Tests terminés"
echo ""
echo "⚠️  Note: Remplacez TOKEN et les IDs de test par des valeurs réelles avant d'exécuter"

