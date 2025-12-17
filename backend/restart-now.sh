#!/bin/bash
# Script simple pour redémarrer le serveur immédiatement

echo "🛑 Arrêt des processus existants..."
pkill -9 -f "nest start" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

echo "🔍 Vérification du port..."
if lsof -i:3000 > /dev/null 2>&1; then
    echo "⚠️  Le port 3000 est encore occupé, tentative de libération..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo "🚀 Démarrage du serveur..."
cd "$(dirname "$0")"
npm run start:dev

