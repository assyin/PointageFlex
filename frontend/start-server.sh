#!/bin/bash

# Script de démarrage automatique du serveur frontend
# Usage: ./start-server.sh

echo "🛑 Arrêt des processus Node.js existants sur le port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
pkill -9 node 2>/dev/null || true

echo "⏳ Attente de 2 secondes..."
sleep 2

echo "🚀 Démarrage du serveur frontend..."
cd "$(dirname "$0")"
npm run dev

