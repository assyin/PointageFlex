#!/bin/bash

# Script de diagnostic pour vérifier l'accessibilité du serveur
# Usage: ./check-server.sh

echo "🔍 Diagnostic du serveur backend PointaFlex..."
echo ""

PORT=${PORT:-3000}

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Vérifier si le serveur écoute sur le port
echo -e "${BLUE}=== 1. Vérification du port $PORT ===${NC}"
if command -v lsof &> /dev/null; then
    echo "Recherche des processus sur le port $PORT..."
    lsof -i:$PORT || echo -e "${YELLOW}Aucun processus trouvé sur le port $PORT${NC}"
elif command -v ss &> /dev/null; then
    echo "Recherche des connexions sur le port $PORT..."
    ss -lptn "sport = :$PORT" || echo -e "${YELLOW}Aucune connexion trouvée sur le port $PORT${NC}"
elif command -v netstat &> /dev/null; then
    echo "Recherche des connexions sur le port $PORT..."
    netstat -tuln | grep ":$PORT" || echo -e "${YELLOW}Aucune connexion trouvée sur le port $PORT${NC}"
else
    echo -e "${YELLOW}Impossible de vérifier le port (lsof, ss ou netstat non disponible)${NC}"
fi
echo ""

# 2. Tester la connexion locale
echo -e "${BLUE}=== 2. Test de connexion locale ===${NC}"
if command -v curl &> /dev/null; then
    echo "Test avec curl..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/api/v1/auth/login --max-time 5 | grep -q "40[0-9]\|200"; then
        echo -e "${GREEN}✓ Serveur accessible sur http://localhost:$PORT${NC}"
    else
        echo -e "${RED}✗ Serveur non accessible sur http://localhost:$PORT${NC}"
        echo "Tentative de connexion..."
        curl -v http://localhost:$PORT/api/v1/auth/login --max-time 5 2>&1 | head -20
    fi
elif command -v wget &> /dev/null; then
    echo "Test avec wget..."
    if wget -q --spider --timeout=5 http://localhost:$PORT/api/v1/auth/login 2>&1; then
        echo -e "${GREEN}✓ Serveur accessible sur http://localhost:$PORT${NC}"
    else
        echo -e "${RED}✗ Serveur non accessible sur http://localhost:$PORT${NC}"
    fi
else
    echo -e "${YELLOW}curl ou wget non disponible pour tester la connexion${NC}"
fi
echo ""

# 3. Vérifier les interfaces réseau
echo -e "${BLUE}=== 3. Interfaces réseau ===${NC}"
if command -v ip &> /dev/null; then
    echo "Adresses IP disponibles:"
    ip addr show | grep "inet " | awk '{print "  " $2}'
elif command -v ifconfig &> /dev/null; then
    echo "Adresses IP disponibles:"
    ifconfig | grep "inet " | awk '{print "  " $2}'
else
    echo -e "${YELLOW}ip ou ifconfig non disponible${NC}"
fi
echo ""

# 4. Vérifier les processus Node.js
echo -e "${BLUE}=== 4. Processus Node.js ===${NC}"
ps aux | grep -E "node|nest" | grep -v grep || echo -e "${YELLOW}Aucun processus Node.js trouvé${NC}"
echo ""

# 5. Vérifier les variables d'environnement
echo -e "${BLUE}=== 5. Variables d'environnement ===${NC}"
echo "PORT: ${PORT}"
echo "NODE_ENV: ${NODE_ENV:-non défini}"
if [ -f ".env" ]; then
    echo -e "${GREEN}Fichier .env trouvé${NC}"
    if grep -q "PORT" .env; then
        echo "PORT dans .env: $(grep PORT .env | head -1)"
    fi
else
    echo -e "${YELLOW}Fichier .env non trouvé${NC}"
fi
echo ""

# 6. Vérifier les logs récents
echo -e "${BLUE}=== 6. Vérification des logs ===${NC}"
echo "Vérifiez les logs du serveur pour voir s'il y a des erreurs"
echo ""

# 7. Instructions pour WSL
if [ -f /proc/version ] && grep -qi microsoft /proc/version; then
    echo -e "${BLUE}=== 7. Configuration WSL ===${NC}"
    echo -e "${YELLOW}Vous êtes sur WSL. Vérifiez:${NC}"
    echo "1. Port forwarding Windows -> WSL:"
    echo "   netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=$(hostname -I | awk '{print $1}')"
    echo ""
    echo "2. Règle de pare-feu Windows:"
    echo "   New-NetFirewallRule -DisplayName 'WSL Port 3000' -Direction Inbound -LocalPort 3000 -Action Allow -Protocol TCP"
    echo ""
    echo "3. Accès depuis Windows:"
    echo "   http://localhost:3000"
    echo "   http://$(hostname -I | awk '{print $1}'):3000"
    echo ""
fi

# 8. Suggestions
echo -e "${BLUE}=== 8. Suggestions ===${NC}"
echo "1. Vérifiez que le serveur écoute bien sur 0.0.0.0 et non seulement sur 127.0.0.1"
echo "2. Vérifiez les règles de pare-feu"
echo "3. Testez avec: curl http://localhost:$PORT/api/v1/auth/login"
echo "4. Vérifiez les logs du serveur pour des erreurs"
echo "5. Si vous êtes sur WSL, configurez le port forwarding Windows"
echo ""

