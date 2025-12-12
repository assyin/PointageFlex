#!/bin/bash

# Script de démarrage automatique du serveur backend
# Usage: ./start-server.sh

echo "🛑 Arrêt des processus Node.js existants..."
pkill -9 node 2>/dev/null || true

echo "⏳ Attente de 2 secondes..."
sleep 2

echo "🚀 Démarrage du serveur backend..."
cd "$(dirname "$0")"
npm run start:dev

