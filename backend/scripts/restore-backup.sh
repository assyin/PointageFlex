#!/usr/bin/env bash

# Script de restauration de backup de la base de données PointaFlex
# Usage: ./restore-backup.sh <nom_backup>

BACKUP_DIR="./backups"
BACKUP_NAME="$1"

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ -z "$BACKUP_NAME" ]; then
    echo -e "${RED}❌ Usage: ./restore-backup.sh <nom_backup>${NC}"
    echo ""
    echo -e "${YELLOW}Backups disponibles:${NC}"
    ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null | awk '{print "  " $9}' | sed 's/.sql.gz//' | sed "s|$BACKUP_DIR/||"
    exit 1
fi

BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.sql.gz"
BACKUP_METADATA="${BACKUP_DIR}/${BACKUP_NAME}.meta.json"

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Backup non trouvé: ${BACKUP_FILE}${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  ATTENTION: Cette opération va ÉCRASER la base de données actuelle!${NC}"
echo -e "${YELLOW}Backup à restaurer: ${BACKUP_NAME}${NC}"

if [ -f "$BACKUP_METADATA" ]; then
    echo -e "${YELLOW}Informations du backup:${NC}"
    cat "$BACKUP_METADATA"
    echo ""
fi

read -p "Êtes-vous sûr de vouloir continuer? (tapez 'oui' pour confirmer): " CONFIRMATION

if [ "$CONFIRMATION" != "oui" ]; then
    echo -e "${YELLOW}❌ Restauration annulée${NC}"
    exit 0
fi

# Exporter les variables d'environnement depuis .env si disponible
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Connexion Supabase par défaut
PGPASSWORD=${DATABASE_PASSWORD:-'MAMPAPOLino0102'}
PGHOST=${DATABASE_HOST:-'aws-1-eu-north-1.pooler.supabase.com'}
PGPORT=${DATABASE_PORT:-'6543'}
PGUSER=${DATABASE_USER:-'postgres.apeyodpxnxxwdxwcnqmo'}
PGDATABASE=${DATABASE_NAME:-'postgres'}

# Décompresser temporairement
echo -e "${YELLOW}🗜️  Décompression du backup...${NC}"
TEMP_SQL="/tmp/${BACKUP_NAME}_temp.sql"
gunzip -c "$BACKUP_FILE" > "$TEMP_SQL"

# Restaurer la base de données
echo -e "${YELLOW}🔄 Restauration en cours...${NC}"
PGPASSWORD="$PGPASSWORD" psql \
  -h "$PGHOST" \
  -p "$PGPORT" \
  -U "$PGUSER" \
  -d "$PGDATABASE" \
  -f "$TEMP_SQL" \
  --single-transaction \
  --set ON_ERROR_STOP=on

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup restauré avec succès!${NC}"
    echo -e "${GREEN}📁 Source: ${BACKUP_FILE}${NC}"

    # Nettoyer le fichier temporaire
    rm -f "$TEMP_SQL"

    echo ""
    echo -e "${YELLOW}⚠️  N'oubliez pas de:${NC}"
    echo -e "  1. Redémarrer l'application backend"
    echo -e "  2. Vérifier que tout fonctionne correctement"

    exit 0
else
    echo -e "${RED}❌ Erreur lors de la restauration${NC}"
    rm -f "$TEMP_SQL"
    exit 1
fi
