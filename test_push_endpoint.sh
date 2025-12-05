#!/bin/bash
# Script de test pour simuler un push du terminal ZKTeco

echo "🧪 TEST DE L'ENDPOINT PUSH"
echo "================================"
echo ""

# URL de votre backend
BACKEND_URL="http://localhost:3000/api/v1/attendance/push"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📡 URL testée: $BACKEND_URL"
echo ""

# Test 1: Format ZKTeco standard
echo "Test 1: Format ZKTeco Standard"
echo "------------------------------"

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -H "Device-ID: Terminal_Caisse" \
  -d '{
    "pin": "1091",
    "time": "2025-11-27 10:30:00",
    "state": 1,
    "verifymode": 1
  }')

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Succès (Code: $HTTP_CODE)${NC}"
  echo "Réponse: $BODY"
else
  echo -e "${RED}❌ Échec (Code: $HTTP_CODE)${NC}"
  echo "Réponse: $BODY"
fi
echo ""

# Test 2: Format BioTime
echo "Test 2: Format BioTime"
echo "------------------------------"

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -H "Device-ID: Terminal_CIT_GAB" \
  -d '{
    "sn": "DGBA212760069",
    "table": "attendance",
    "stamp": "1732704600",
    "data": {
      "pin": "1091",
      "time": "2025-11-27 10:35:00",
      "status": "0",
      "verify": "1"
    }
  }')

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Succès (Code: $HTTP_CODE)${NC}"
  echo "Réponse: $BODY"
else
  echo -e "${RED}❌ Échec (Code: $HTTP_CODE)${NC}"
  echo "Réponse: $BODY"
fi
echo ""

# Test 3: Format ADMS
echo "Test 3: Format ADMS"
echo "------------------------------"

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -H "Device-ID: Terminal_Caisse" \
  -d '{
    "cardno": "1091",
    "checktime": "2025-11-27 10:40:00",
    "checktype": "I",
    "verifycode": "1"
  }')

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Succès (Code: $HTTP_CODE)${NC}"
  echo "Réponse: $BODY"
else
  echo -e "${RED}❌ Échec (Code: $HTTP_CODE)${NC}"
  echo "Réponse: $BODY"
fi
echo ""

# Résumé
echo "================================"
echo -e "${YELLOW}📊 RÉSUMÉ${NC}"
echo "Si tous les tests passent, votre endpoint est prêt!"
echo "Vous pouvez maintenant configurer vos terminaux pour pointer vers:"
echo "  $BACKEND_URL"
echo ""
echo "Pour voir les pointages en base de données:"
echo "  cd backend && npm run prisma:studio"
echo ""
