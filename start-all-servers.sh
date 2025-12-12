#!/bin/bash

# Script pour démarrer tous les serveurs (backend + frontend)
# Usage: ./start-all-servers.sh

echo "🛑 Arrêt de tous les processus Node.js existants..."
pkill -9 node 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

echo "⏳ Attente de 3 secondes pour libérer les ports..."
sleep 3

# Obtenir l'IP WSL
WSL_IP=$(hostname -I | awk '{print $1}')

echo ""
echo "=========================================="
echo "🚀 DÉMARRAGE DES SERVEURS"
echo "=========================================="
echo ""

# Démarrer le backend
echo "📊 Démarrage du BACKEND sur le port 3000..."
cd "$(dirname "$0")/backend"
npm run start:dev &
BACKEND_PID=$!
echo "✅ Backend démarré (PID: $BACKEND_PID)"
echo ""

# Attendre que le backend soit prêt
echo "⏳ Attente du démarrage du backend (15 secondes)..."
sleep 15

# Démarrer le frontend
echo "🌐 Démarrage du FRONTEND sur le port 3001..."
cd "../frontend"
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend démarré (PID: $FRONTEND_PID)"
echo ""

# Attendre que le frontend soit prêt
echo "⏳ Attente du démarrage du frontend (10 secondes)..."
sleep 10

echo ""
echo "=========================================="
echo "✅ SERVEURS DÉMARRÉS AVEC SUCCÈS !"
echo "=========================================="
echo ""
echo "📍 ADRESSES D'ACCÈS :"
echo ""
echo "Depuis WSL :"
echo "  📊 Backend:  http://localhost:3000"
echo "  🌐 Frontend: http://localhost:3001"
echo "  📚 API Docs: http://localhost:3000/api/docs"
echo ""
echo "Depuis Windows :"
echo "  📊 Backend:  http://$WSL_IP:3000"
echo "  🌐 Frontend: http://$WSL_IP:3001"
echo "  📚 API Docs: http://$WSL_IP:3000/api/docs"
echo ""
echo "🎯 Page Profile :"
echo "  http://$WSL_IP:3001/profile"
echo ""
echo "=========================================="
echo ""
echo "📝 Pour arrêter les serveurs :"
echo "  pkill -9 node"
echo "  ou: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "📊 Pour voir les logs en temps réel,"
echo "   ouvrez les terminaux où tournent les serveurs"
echo ""
echo "=========================================="
echo ""
echo "⏳ Les serveurs continuent de tourner..."
echo "   Appuyez sur Ctrl+C pour arrêter ce script"
echo "   (les serveurs continueront de tourner en arrière-plan)"
echo ""

# Garder le script actif pour voir les sorties
wait

