#!/bin/bash

# =============================================================================
# SCRIPT DE BACKUP COMPLET - PointaFlex
# =============================================================================
# Ce script crée une sauvegarde complète du projet incluant:
# - Base de données PostgreSQL (Supabase)
# - Fichiers du projet (code source)
# - Configuration (.env)
# - Schema Prisma et migrations
#
# Usage: ./scripts/backup.sh [nom_optionnel]
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="/home/assyin/PointaFlex"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Backup directory
BACKUP_ROOT="$PROJECT_ROOT/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Custom backup name (optional)
BACKUP_NAME=${1:-"backup_$TIMESTAMP"}
BACKUP_DIR="$BACKUP_ROOT/$BACKUP_NAME"

# Database credentials from .env
DB_HOST="aws-1-eu-north-1.pooler.supabase.com"
DB_PORT="6543"
DB_NAME="postgres"
DB_USER="postgres.apeyodpxnxxwdxwcnqmo"
DB_PASSWORD="MAMPAPOLino0102"

# =============================================================================
# FUNCTIONS
# =============================================================================

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# =============================================================================
# MAIN BACKUP PROCESS
# =============================================================================

print_header "DÉMARRAGE DU BACKUP COMPLET"
echo -e "Nom du backup: ${GREEN}$BACKUP_NAME${NC}"
echo -e "Répertoire: ${GREEN}$BACKUP_DIR${NC}"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"
print_success "Répertoire de backup créé"

# =============================================================================
# 1. BACKUP DE LA BASE DE DONNÉES
# =============================================================================

print_header "1. BACKUP DE LA BASE DE DONNÉES"

export PGPASSWORD="$DB_PASSWORD"

echo "Connexion à Supabase PostgreSQL..."
pg_dump -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --format=custom \
        --file="$BACKUP_DIR/database.dump" \
        --verbose 2>&1 | grep -v "NOTICE" || true

if [ $? -eq 0 ] && [ -f "$BACKUP_DIR/database.dump" ]; then
    DB_SIZE=$(du -h "$BACKUP_DIR/database.dump" | cut -f1)
    print_success "Base de données sauvegardée ($DB_SIZE)"
else
    print_error "Échec de la sauvegarde de la base de données"
    exit 1
fi

# Also create SQL format for easier viewing
pg_dump -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --format=plain \
        --file="$BACKUP_DIR/database.sql" 2>&1 | grep -v "NOTICE" || true

if [ -f "$BACKUP_DIR/database.sql" ]; then
    SQL_SIZE=$(du -h "$BACKUP_DIR/database.sql" | cut -f1)
    print_success "Backup SQL créé ($SQL_SIZE)"
fi

unset PGPASSWORD

# =============================================================================
# 2. BACKUP DU CODE SOURCE
# =============================================================================

print_header "2. BACKUP DU CODE SOURCE"

# Backend
echo "Sauvegarde du backend..."
rsync -av --progress \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.env.local' \
    --exclude='*.log' \
    "$BACKEND_DIR/" \
    "$BACKUP_DIR/backend/" > /dev/null

print_success "Backend sauvegardé"

# Frontend
echo "Sauvegarde du frontend..."
rsync -av --progress \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.env.local' \
    --exclude='*.log' \
    "$PROJECT_ROOT/frontend/" \
    "$BACKUP_DIR/frontend/" > /dev/null

print_success "Frontend sauvegardé"

# =============================================================================
# 3. BACKUP DE LA CONFIGURATION
# =============================================================================

print_header "3. BACKUP DE LA CONFIGURATION"

# Copy .env files
cp "$BACKEND_DIR/.env" "$BACKUP_DIR/backend/.env" 2>/dev/null || print_info ".env backend non trouvé"
cp "$PROJECT_ROOT/frontend/.env" "$BACKUP_DIR/frontend/.env" 2>/dev/null || print_info ".env frontend non trouvé"

# Copy package.json files
cp "$BACKEND_DIR/package.json" "$BACKUP_DIR/backend/package.json"
cp "$PROJECT_ROOT/frontend/package.json" "$BACKUP_DIR/frontend/package.json"

print_success "Configuration sauvegardée"

# =============================================================================
# 4. BACKUP DU SCHEMA PRISMA
# =============================================================================

print_header "4. BACKUP DU SCHEMA PRISMA"

cp -r "$BACKEND_DIR/prisma" "$BACKUP_DIR/backend/prisma"
print_success "Schema Prisma et migrations sauvegardés"

# =============================================================================
# 5. CRÉATION DU FICHIER DE MÉTADONNÉES
# =============================================================================

print_header "5. CRÉATION DES MÉTADONNÉES"

cat > "$BACKUP_DIR/backup_info.txt" << EOF
========================================
BACKUP POINTAFLEX
========================================
Date de création: $(date "+%Y-%m-%d %H:%M:%S")
Nom du backup: $BACKUP_NAME
Créé par: $(whoami)
Système: $(uname -s)

========================================
CONTENU DU BACKUP
========================================
✅ Base de données PostgreSQL (Supabase)
   - Format personnalisé: database.dump
   - Format SQL: database.sql

✅ Code source
   - Backend (NestJS)
   - Frontend (Next.js)

✅ Configuration
   - Fichiers .env
   - package.json

✅ Schema Prisma
   - schema.prisma
   - Migrations

========================================
INFORMATIONS TECHNIQUES
========================================
Base de données:
  - Hôte: $DB_HOST
  - Port: $DB_PORT
  - Base: $DB_NAME
  - Utilisateur: $DB_USER

Taille du backup:
$(du -sh "$BACKUP_DIR" | cut -f1)

========================================
RESTAURATION
========================================
Pour restaurer ce backup, utilisez:
  ./scripts/restore.sh $BACKUP_NAME

Pour plus d'informations:
  cat backups/$BACKUP_NAME/RESTORE_INSTRUCTIONS.md
EOF

print_success "Métadonnées créées"

# =============================================================================
# 6. CRÉATION DES INSTRUCTIONS DE RESTAURATION
# =============================================================================

cat > "$BACKUP_DIR/RESTORE_INSTRUCTIONS.md" << 'EOF'
# 📦 Instructions de Restauration - PointaFlex

## ⚠️ Important

Avant de restaurer, assurez-vous que:
- Vous avez les droits d'accès nécessaires
- Les applications (backend/frontend) sont arrêtées
- Vous avez une sauvegarde récente si vous écrasez des données existantes

## 🔄 Restauration Automatique

La méthode la plus simple est d'utiliser le script de restauration:

```bash
cd /home/assyin/PointaFlex
./scripts/restore.sh NOM_DU_BACKUP
```

## 🔧 Restauration Manuelle

### 1. Restauration de la Base de Données

```bash
# Option A: Format personnalisé (recommandé)
PGPASSWORD='MAMPAPOLino0102' pg_restore \
  -h aws-1-eu-north-1.pooler.supabase.com \
  -p 6543 \
  -U postgres.apeyodpxnxxwdxwcnqmo \
  -d postgres \
  --clean \
  --if-exists \
  database.dump

# Option B: Format SQL
PGPASSWORD='MAMPAPOLino0102' psql \
  -h aws-1-eu-north-1.pooler.supabase.com \
  -p 6543 \
  -U postgres.apeyodpxnxxwdxwcnqmo \
  -d postgres \
  -f database.sql
```

### 2. Restauration du Code Source

```bash
# Backend
cp -r backend/* /home/assyin/PointaFlex/backend/
cd /home/assyin/PointaFlex/backend
npm install

# Frontend
cp -r frontend/* /home/assyin/PointaFlex/frontend/
cd /home/assyin/PointaFlex/frontend
npm install
```

### 3. Restauration de la Configuration

```bash
# Copier les fichiers .env
cp backend/.env /home/assyin/PointaFlex/backend/.env
cp frontend/.env /home/assyin/PointaFlex/frontend/.env
```

### 4. Régénération Prisma

```bash
cd /home/assyin/PointaFlex/backend
npx prisma generate
```

### 5. Redémarrage des Applications

```bash
# Backend
cd /home/assyin/PointaFlex/backend
npm run start:dev

# Frontend (dans un nouveau terminal)
cd /home/assyin/PointaFlex/frontend
npm run dev
```

## 📝 Notes

- Les `node_modules` ne sont PAS inclus dans le backup (ils seront réinstallés)
- Les fichiers `.next` et `dist` ne sont PAS inclus (ils seront regénérés)
- Les logs ne sont PAS inclus dans le backup
EOF

print_success "Instructions de restauration créées"

# =============================================================================
# 7. COMPRESSION DU BACKUP (Optionnel)
# =============================================================================

print_header "7. COMPRESSION DU BACKUP (Optionnel)"

echo "Voulez-vous compresser le backup en .tar.gz? (Cela économise de l'espace)"
echo -n "Tapez 'oui' pour compresser, ou Entrée pour ignorer: "
read -t 10 COMPRESS_CHOICE || COMPRESS_CHOICE=""

if [ "$COMPRESS_CHOICE" = "oui" ]; then
    echo "Compression en cours..."
    cd "$BACKUP_ROOT"
    tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"

    if [ -f "$BACKUP_NAME.tar.gz" ]; then
        ARCHIVE_SIZE=$(du -h "$BACKUP_NAME.tar.gz" | cut -f1)
        print_success "Archive créée: $BACKUP_NAME.tar.gz ($ARCHIVE_SIZE)"

        echo -n "Supprimer le répertoire non compressé? (oui/non): "
        read -t 10 DELETE_CHOICE || DELETE_CHOICE="non"

        if [ "$DELETE_CHOICE" = "oui" ]; then
            rm -rf "$BACKUP_NAME"
            print_success "Répertoire non compressé supprimé"
        fi
    fi
else
    print_info "Compression ignorée"
fi

# =============================================================================
# SUMMARY
# =============================================================================

print_header "BACKUP TERMINÉ AVEC SUCCÈS"

echo ""
echo -e "${GREEN}📦 Emplacement du backup:${NC}"
echo -e "   $BACKUP_DIR"
echo ""
echo -e "${GREEN}📊 Taille totale:${NC}"
du -sh "$BACKUP_DIR" 2>/dev/null || du -sh "$BACKUP_ROOT/$BACKUP_NAME.tar.gz" 2>/dev/null
echo ""
echo -e "${GREEN}📋 Contenu:${NC}"
echo "   ✅ Base de données (database.dump + database.sql)"
echo "   ✅ Code source (backend + frontend)"
echo "   ✅ Configuration (.env)"
echo "   ✅ Schema Prisma + migrations"
echo "   ✅ Instructions de restauration"
echo ""
echo -e "${YELLOW}🔄 Pour restaurer ce backup:${NC}"
echo -e "   ${BLUE}./scripts/restore.sh $BACKUP_NAME${NC}"
echo ""
echo -e "${GREEN}✨ Backup terminé avec succès!${NC}"
echo ""
