#!/usr/bin/env bash

# Script de création de backup de la base de données PointaFlex
# Usage: ./create-backup.sh [nom_backup_optionnel]

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="${1:-backup_${TIMESTAMP}}"

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Création du backup de la base de données...${NC}"

# Créer le dossier de backup s'il n'existe pas
mkdir -p "$BACKUP_DIR"

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

BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.sql"
BACKUP_METADATA="${BACKUP_DIR}/${BACKUP_NAME}.meta.json"

# Créer le backup avec pg_dump
echo -e "${YELLOW}📦 Export de la base de données...${NC}"
PGPASSWORD="$PGPASSWORD" pg_dump \
  -h "$PGHOST" \
  -p "$PGPORT" \
  -U "$PGUSER" \
  -d "$PGDATABASE" \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    # Créer le fichier de métadonnées
    cat > "$BACKUP_METADATA" <<EOF
{
  "backup_name": "$BACKUP_NAME",
  "created_at": "$(date -Iseconds)",
  "database": "$PGDATABASE",
  "host": "$PGHOST",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'N/A')",
  "git_branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'N/A')"
}
EOF

    # Compresser le backup
    echo -e "${YELLOW}🗜️  Compression du backup...${NC}"
    gzip -f "$BACKUP_FILE"

    BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)

    echo -e "${GREEN}✅ Backup créé avec succès!${NC}"
    echo -e "${GREEN}📁 Fichier: ${BACKUP_FILE}.gz${NC}"
    echo -e "${GREEN}📊 Taille: ${BACKUP_SIZE}${NC}"
    echo -e "${GREEN}ℹ️  Métadonnées: ${BACKUP_METADATA}${NC}"
    echo ""
    echo -e "${YELLOW}Pour restaurer ce backup:${NC}"
    echo -e "  ./restore-backup.sh ${BACKUP_NAME}"

    exit 0
else
    echo -e "${RED}❌ Erreur lors de la création du backup${NC}"
    exit 1
fi
