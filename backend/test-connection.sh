#!/bin/bash
# Script pour tester la connexion au serveur

PORT=3000
echo "🔍 Test de connexion au serveur sur le port $PORT..."
echo ""

# Test 1: Vérifier si le port est ouvert
echo "1. Vérification du port $PORT..."
if lsof -i:$PORT > /dev/null 2>&1; then
    echo "   ✓ Port $PORT est ouvert"
    lsof -i:$PORT
else
    echo "   ✗ Port $PORT n'est pas ouvert"
fi
echo ""

# Test 2: Test avec curl
echo "2. Test avec curl..."
if command -v curl &> /dev/null; then
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/api/v1/auth/login --max-time 5 2>&1)
    if [ "$response" = "400" ] || [ "$response" = "401" ] || [ "$response" = "200" ]; then
        echo "   ✓ Serveur répond (HTTP $response)"
    else
        echo "   ✗ Serveur ne répond pas correctement (HTTP $response)"
        echo "   Détails:"
        curl -v http://localhost:$PORT/api/v1/auth/login --max-time 5 2>&1 | head -10
    fi
else
    echo "   ⚠️  curl n'est pas installé"
fi
echo ""

# Test 3: Afficher l'IP WSL
echo "3. Adresse IP WSL:"
WSL_IP=$(hostname -I | awk '{print $1}')
echo "   IP: $WSL_IP"
echo "   URL depuis WSL: http://localhost:$PORT"
echo "   URL depuis Windows: http://localhost:$PORT (si port forwarding configuré)"
echo "   URL directe: http://$WSL_IP:$PORT"
echo ""

# Test 4: Vérifier les processus Node
echo "4. Processus Node.js en cours:"
ps aux | grep -E "node|nest" | grep -v grep || echo "   Aucun processus Node.js trouvé"
echo ""

