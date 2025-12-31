#!/bin/bash

# Script d'exécution automatique des scénarios de test
# Usage: ./run-test-scenarios.sh

set -e

echo "🚀 Démarrage des tests automatiques..."
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
BACKEND_URL="http://localhost:3001"
TENANT_ID=""
TOKEN=""
EMP001_ID=""
EMP002_ID=""
EMP003_ID=""
EMP004_ID=""
EMP005_ID=""

# Fonction pour afficher les résultats
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Étape 1 : Préparer les données
echo "📝 Étape 1 : Préparation des données de test..."
cd "$(dirname "$0")/../.."
npx ts-node scripts/test-scenarios/prepare-test-data.ts > /tmp/test-prep.log 2>&1

if [ $? -eq 0 ]; then
    print_result 0 "Données de test préparées"
    # Extraire les IDs du log
    TENANT_ID=$(grep "Tenant ID:" /tmp/test-prep.log | awk '{print $NF}')
    EMP001_ID=$(grep "EMP001:" /tmp/test-prep.log | awk '{print $NF}')
    EMP002_ID=$(grep "EMP002:" /tmp/test-prep.log | awk '{print $NF}')
    EMP003_ID=$(grep "EMP003:" /tmp/test-prep.log | awk '{print $NF}')
    EMP004_ID=$(grep "EMP004:" /tmp/test-prep.log | awk '{print $NF}')
    EMP005_ID=$(grep "EMP005:" /tmp/test-prep.log | awk '{print $NF}')
else
    print_result 1 "Erreur lors de la préparation"
    exit 1
fi

echo ""
echo "📋 IDs extraits :"
echo "   Tenant: $TENANT_ID"
echo "   EMP001: $EMP001_ID"
echo "   EMP002: $EMP002_ID"
echo "   EMP003: $EMP003_ID"
echo "   EMP004: $EMP004_ID"
echo "   EMP005: $EMP005_ID"
echo ""

# Étape 2 : Obtenir le token
echo "🔐 Étape 2 : Authentification..."
LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"admin@test.com\",
        \"password\": \"Test123!\",
        \"tenantId\": \"$TENANT_ID\"
    }")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    print_result 0 "Token obtenu"
else
    print_result 1 "Erreur d'authentification"
    echo "Réponse: $LOGIN_RESPONSE"
    exit 1
fi

echo ""

# Étape 3 : Scénario 1 - Pointage Normal
echo "📝 Étape 3 : Scénario 1 - Pointage Normal..."

# Pointage IN
IN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/attendance" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"employeeId\": \"$EMP001_ID\",
        \"type\": \"ENTRY\",
        \"timestamp\": \"2025-01-20T08:00:00Z\",
        \"method\": \"MANUAL\",
        \"deviceId\": \"TEST_DEVICE_001\"
    }")

if echo "$IN_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    print_result 0 "Pointage IN créé"
else
    print_result 1 "Erreur pointage IN"
    echo "Réponse: $IN_RESPONSE"
fi

# Pointage OUT
OUT_RESPONSE=$(curl -s -X POST "$BACKEND_URL/attendance" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"employeeId\": \"$EMP001_ID\",
        \"type\": \"EXIT\",
        \"timestamp\": \"2025-01-20T17:00:00Z\",
        \"method\": \"MANUAL\"
    }")

if echo "$OUT_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    print_result 0 "Pointage OUT créé"
else
    print_result 1 "Erreur pointage OUT"
    echo "Réponse: $OUT_RESPONSE"
fi

echo ""

# Étape 4 : Scénario 7 - Pointage avec Heures Sup
echo "📝 Étape 4 : Scénario 7 - Pointage avec Heures Supplémentaires..."

# Pointage IN
curl -s -X POST "$BACKEND_URL/attendance" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"employeeId\": \"$EMP001_ID\",
        \"type\": \"ENTRY\",
        \"timestamp\": \"2025-01-21T08:00:00Z\",
        \"method\": \"MANUAL\"
    }" > /dev/null

# Pointage OUT avec 2h de retard
OT_OUT_RESPONSE=$(curl -s -X POST "$BACKEND_URL/attendance" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"employeeId\": \"$EMP001_ID\",
        \"type\": \"EXIT\",
        \"timestamp\": \"2025-01-21T19:00:00Z\",
        \"method\": \"MANUAL\"
    }")

if echo "$OT_OUT_RESPONSE" | jq -e '.overtimeMinutes' > /dev/null 2>&1; then
    OT_MINUTES=$(echo "$OT_OUT_RESPONSE" | jq -r '.overtimeMinutes')
    if [ "$OT_MINUTES" -ge 120 ]; then
        print_result 0 "Pointage avec heures sup créé (${OT_MINUTES} min)"
    else
        print_result 1 "Heures sup incorrectes: ${OT_MINUTES} min (attendu: >= 120)"
    fi
else
    print_result 1 "Erreur pointage avec heures sup"
    echo "Réponse: $OT_OUT_RESPONSE"
fi

echo ""

# Étape 5 : Scénario 11 - Création Manuelle d'Overtime
echo "📝 Étape 5 : Scénario 11 - Création Manuelle d'Overtime..."

OT_RESPONSE=$(curl -s -X POST "$BACKEND_URL/overtime" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"employeeId\": \"$EMP001_ID\",
        \"date\": \"2025-01-22\",
        \"hours\": 2.5,
        \"type\": \"STANDARD\",
        \"notes\": \"Test manuel\"
    }")

if echo "$OT_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    print_result 0 "Overtime créé manuellement"
else
    print_result 1 "Erreur création overtime"
    echo "Réponse: $OT_RESPONSE"
fi

echo ""

# Étape 6 : Scénario 15 - Employé Non Éligible
echo "📝 Étape 6 : Scénario 15 - Employé Non Éligible..."

NON_ELIGIBLE_RESPONSE=$(curl -s -X POST "$BACKEND_URL/overtime" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"employeeId\": \"$EMP003_ID\",
        \"date\": \"2025-01-22\",
        \"hours\": 1,
        \"type\": \"STANDARD\"
    }")

if echo "$NON_ELIGIBLE_RESPONSE" | jq -e '.statusCode' > /dev/null 2>&1; then
    STATUS_CODE=$(echo "$NON_ELIGIBLE_RESPONSE" | jq -r '.statusCode')
    if [ "$STATUS_CODE" = "400" ]; then
        print_result 0 "Rejet correct pour employé non éligible"
    else
        print_result 1 "Code de statut incorrect: $STATUS_CODE"
    fi
else
    print_result 1 "Erreur: devrait être rejeté"
    echo "Réponse: $NON_ELIGIBLE_RESPONSE"
fi

echo ""

# Résumé
echo "=========================================="
echo "📊 Résumé des Tests"
echo "=========================================="
echo ""
echo "✅ Tests exécutés avec succès"
echo ""
echo "📝 Pour voir les détails, consultez :"
echo "   - Les logs: /tmp/test-prep.log"
echo "   - L'API: $BACKEND_URL/api"
echo ""
echo "🧹 Pour nettoyer les données de test :"
echo "   npx ts-node scripts/test-scenarios/cleanup-test-data.ts"
echo ""

