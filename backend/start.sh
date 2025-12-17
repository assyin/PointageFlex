#!/bin/bash
# Script ultra-simple pour démarrer/redémarrer le serveur

# Arrêter les processus existants
echo "🛑 Arrêt des processus..."
pkill -9 node 2>/dev/null || true
sleep 1

# Aller dans le répertoire backend
cd "$(dirname "$0")"

# Démarrer le serveur
echo "🚀 Démarrage du serveur..."
npm run start:dev

