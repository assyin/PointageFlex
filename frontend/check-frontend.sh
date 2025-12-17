#!/bin/bash
# Script de diagnostic pour le frontend

PORT=3001
echo "🔍 Diagnostic du frontend sur le port $PORT..."
echo ""

# 1. Vérifier si le port est ouvert
echo "1. Vérification du port $PORT..."
if lsof -i:$PORT > /dev/null 2>&1; then
    echo "   ✓ Port $PORT est ouvert"
    echo "   Processus:"
    lsof -i:$PORT
else
    echo "   ✗ Port $PORT n'est pas ouvert"
    echo "   Le frontend n'est pas en cours d'exécution"
fi
echo ""

# 2. Vérifier les processus Next.js
echo "2. Processus Next.js:"
ps aux | grep -E "next|node.*3001" | grep -v grep || echo "   Aucun processus Next.js trouvé"
echo ""

# 3. Test de connexion
echo "3. Test de connexion..."
if command -v curl &> /dev/null; then
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT --max-time 5 2>&1)
    if [ "$response" = "200" ] || [ "$response" = "404" ] || [ "$response" = "307" ]; then
        echo "   ✓ Serveur répond (HTTP $response)"
    else
        echo "   ✗ Serveur ne répond pas (HTTP $response)"
    fi
else
    echo "   ⚠️  curl n'est pas installé"
fi
echo ""

# 4. Vérifier node_modules
echo "4. Vérification des dépendances..."
if [ -d "node_modules" ]; then
    echo "   ✓ node_modules existe"
else
    echo "   ✗ node_modules n'existe pas"
    echo "   Exécutez: npm install"
fi
echo ""

# 5. Vérifier .env.local
echo "5. Vérification de la configuration..."
if [ -f ".env.local" ]; then
    echo "   ✓ .env.local existe"
    echo "   Contenu:"
    cat .env.local | grep -v "^#" | grep -v "^$"
else
    echo "   ⚠️  .env.local n'existe pas"
    echo "   Le frontend utilisera l'URL par défaut"
fi
echo ""

# 6. Afficher l'IP WSL
echo "6. Adresse IP WSL:"
WSL_IP=$(hostname -I | awk '{print $1}')
echo "   IP: $WSL_IP"
echo "   URL depuis WSL: http://localhost:$PORT"
echo "   URL depuis Windows: http://localhost:$PORT (si port forwarding configuré)"
echo "   URL directe: http://$WSL_IP:$PORT"
echo ""

