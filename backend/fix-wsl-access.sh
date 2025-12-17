#!/bin/bash

# Script pour configurer l'accès WSL au serveur backend
# Usage: ./fix-wsl-access.sh

echo "🔧 Configuration de l'accès WSL pour le serveur backend..."
echo ""

PORT=${PORT:-3000}

# Obtenir l'IP WSL
WSL_IP=$(hostname -I | awk '{print $1}')

if [ -z "$WSL_IP" ]; then
    echo "❌ Impossible de déterminer l'IP WSL"
    exit 1
fi

echo "IP WSL détectée: $WSL_IP"
echo "Port: $PORT"
echo ""

# Instructions pour Windows
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Instructions pour configurer l'accès depuis Windows:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Ouvrez PowerShell en tant qu'administrateur sur Windows"
echo ""
echo "2. Configurez le port forwarding:"
echo "   netsh interface portproxy add v4tov4 listenport=$PORT listenaddress=0.0.0.0 connectport=$PORT connectaddress=$WSL_IP"
echo ""
echo "3. Ajoutez une règle de pare-feu:"
echo "   New-NetFirewallRule -DisplayName 'WSL Backend Port $PORT' -Direction Inbound -LocalPort $PORT -Action Allow -Protocol TCP"
echo ""
echo "4. Vérifiez la configuration:"
echo "   netsh interface portproxy show all"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 URLs d'accès:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   • Depuis WSL: http://localhost:$PORT"
echo "   • Depuis Windows: http://localhost:$PORT"
echo "   • Depuis le réseau local: http://$WSL_IP:$PORT"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier si le serveur écoute
echo "Vérification si le serveur écoute sur le port $PORT..."
if lsof -i:$PORT > /dev/null 2>&1; then
    echo "✓ Serveur détecté sur le port $PORT"
    echo ""
    echo "Test de connexion locale..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/api/v1/auth/login --max-time 2 | grep -q "40[0-9]\|200"; then
        echo "✓ Serveur accessible localement"
    else
        echo "⚠️  Serveur en cours d'exécution mais peut ne pas répondre correctement"
    fi
else
    echo "⚠️  Aucun serveur détecté sur le port $PORT"
    echo "   Démarrez le serveur avec: npm run start:dev"
fi

