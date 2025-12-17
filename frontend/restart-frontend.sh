#!/bin/bash
# Script pour redémarrer le frontend

echo "🛑 Arrêt des processus sur le port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
pkill -9 -f "next dev" 2>/dev/null || true
sleep 2

echo "🔍 Vérification du port 3001..."
if lsof -i:3001 > /dev/null 2>&1; then
    echo "⚠️  Le port 3001 est encore occupé"
    lsof -i:3001
else
    echo "✓ Port 3001 est libre"
fi

echo ""
echo "🚀 Démarrage du frontend..."
cd "$(dirname "$0")"

# Vérifier que node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Démarrer le serveur
npm run dev

