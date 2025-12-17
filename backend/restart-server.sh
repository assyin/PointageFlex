#!/bin/bash

# Script de redémarrage du serveur backend PointaFlex
# Usage: ./restart-server.sh

set -e

echo "🔄 Redémarrage du serveur backend PointaFlex..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Port par défaut (peut être modifié selon votre configuration)
PORT=${PORT:-3000}

# Fonction pour tuer les processus sur le port
kill_port_process() {
    local port=$1
    echo -e "${YELLOW}Recherche des processus sur le port $port...${NC}"
    
    # Méthode 1: Utiliser lsof si disponible
    if command -v lsof &> /dev/null; then
        local pids=$(lsof -ti:$port 2>/dev/null || true)
        if [ -n "$pids" ]; then
            echo -e "${YELLOW}Arrêt des processus trouvés: $pids${NC}"
            for pid in $pids; do
                kill -9 $pid 2>/dev/null || true
                echo -e "${GREEN}✓ Processus $pid arrêté${NC}"
            done
            sleep 2
            return 0
        fi
    fi
    
    # Méthode 2: Utiliser fuser si disponible
    if command -v fuser &> /dev/null; then
        local pids=$(fuser $port/tcp 2>/dev/null | awk '{print $1}' || true)
        if [ -n "$pids" ]; then
            echo -e "${YELLOW}Arrêt des processus trouvés: $pids${NC}"
            for pid in $pids; do
                kill -9 $pid 2>/dev/null || true
                echo -e "${GREEN}✓ Processus $pid arrêté${NC}"
            done
            sleep 2
            return 0
        fi
    fi
    
    # Méthode 3: Utiliser netstat/ss et kill
    if command -v ss &> /dev/null; then
        local pids=$(ss -lptn "sport = :$port" 2>/dev/null | grep -oP 'pid=\K[0-9]+' || true)
        if [ -n "$pids" ]; then
            echo -e "${YELLOW}Arrêt des processus trouvés: $pids${NC}"
            for pid in $pids; do
                kill -9 $pid 2>/dev/null || true
                echo -e "${GREEN}✓ Processus $pid arrêté${NC}"
            done
            sleep 2
            return 0
        fi
    fi
    
    echo -e "${GREEN}✓ Aucun processus trouvé sur le port $port${NC}"
}

# Fonction pour tuer les processus nest/node
kill_nest_processes() {
    echo -e "${YELLOW}Recherche des processus NestJS/Node...${NC}"
    
    # Trouver les processus node liés au backend
    local pids=$(ps aux | grep -E "nest start|node.*main\.js|node.*dist/main|node.*start:dev" | grep -v grep | awk '{print $2}' || true)
    
    if [ -z "$pids" ]; then
        echo -e "${GREEN}✓ Aucun processus NestJS trouvé${NC}"
        return 0
    fi
    
    echo -e "${YELLOW}Arrêt des processus NestJS trouvés: $pids${NC}"
    for pid in $pids; do
        kill -9 $pid 2>/dev/null || true
        echo -e "${GREEN}✓ Processus $pid arrêté${NC}"
    done
    
    sleep 2
}

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis le répertoire backend${NC}"
    exit 1
fi

# Étape 1: Arrêter les processus existants
echo -e "\n${BLUE}=== Étape 1: Arrêt des processus existants ===${NC}"
kill_port_process $PORT
kill_nest_processes

# Étape 2: Vérifier que le port est libre
echo -e "\n${BLUE}=== Étape 2: Vérification du port ===${NC}"
if command -v lsof &> /dev/null; then
    if lsof -ti:$PORT > /dev/null 2>&1; then
        echo -e "${RED}⚠️  Le port $PORT est toujours occupé. Tentative de libération...${NC}"
        kill_port_process $PORT
        sleep 3
        
        # Vérifier à nouveau
        if lsof -ti:$PORT > /dev/null 2>&1; then
            echo -e "${RED}❌ Impossible de libérer le port $PORT${NC}"
            echo -e "${YELLOW}Veuillez arrêter manuellement les processus sur ce port${NC}"
            exit 1
        fi
    fi
fi
echo -e "${GREEN}✓ Port $PORT disponible${NC}"

# Étape 3: Vérifier les dépendances
echo -e "\n${BLUE}=== Étape 3: Vérification des dépendances ===${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installation des dépendances...${NC}"
    npm install
    echo -e "${GREEN}✓ Dépendances installées${NC}"
else
    echo -e "${GREEN}✓ Dépendances présentes${NC}"
fi

# Étape 4: Générer Prisma Client si nécessaire
echo -e "\n${BLUE}=== Étape 4: Génération Prisma Client ===${NC}"
if [ -f "prisma/schema.prisma" ]; then
    echo -e "${YELLOW}Génération du client Prisma...${NC}"
    npx prisma generate || echo -e "${YELLOW}⚠️  Prisma generate a échoué, mais on continue...${NC}"
    echo -e "${GREEN}✓ Prisma Client généré${NC}"
fi

# Étape 5: Vérifier les variables d'environnement
echo -e "\n${BLUE}=== Étape 5: Vérification de la configuration ===${NC}"
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  Aucun fichier .env trouvé${NC}"
    echo -e "${YELLOW}Assurez-vous que DATABASE_URL est configuré${NC}"
fi

# Étape 6: Démarrer le serveur
echo -e "\n${BLUE}=== Étape 6: Démarrage du serveur ===${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 Démarrage du serveur en mode développement...${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📍 Le serveur sera accessible sur:${NC}"
echo -e "   • http://localhost:$PORT"
echo -e "   • http://127.0.0.1:$PORT"
echo -e "   • http://0.0.0.0:$PORT"
echo -e "${BLUE}📚 Documentation Swagger:${NC}"
echo -e "   • http://localhost:$PORT/api/docs"
echo -e "${YELLOW}⚠️  Appuyez sur Ctrl+C pour arrêter le serveur${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Démarrer le serveur
npm run start:dev
