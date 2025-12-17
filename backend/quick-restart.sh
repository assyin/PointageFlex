#!/bin/bash
# Script rapide de redémarrage
# Usage: ./quick-restart.sh

# Tuer les processus sur le port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
pkill -f "nest start" 2>/dev/null || true

# Attendre 2 secondes
sleep 2

# Redémarrer
npm run start:dev

