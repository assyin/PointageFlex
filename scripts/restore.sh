#!/bin/bash

# =============================================================================
# SCRIPT DE RESTAURATION COMPLET - PointaFlex
# =============================================================================
# Ce script restaure une sauvegarde complète du projet incluant:
# - Base de données PostgreSQL (Supabase)
# - Fichiers du projet (code source)
# - Configuration (.env)
# - Schema Prisma et migrations
#
# Usage: ./scripts/restore.sh <nom_du_backup>
# Exemple: ./scripts/restore.sh backup_20250123_143022
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
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Backup directory
BACKUP_ROOT="$PROJECT_ROOT/backups"

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

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# =============================================================================
# VALIDATION DES ARGUMENTS
# =============================================================================

if [ -z "$1" ]; then
    print_error "Nom du backup requis!"
    echo ""
    echo "Usage: $0 <nom_du_backup>"
    echo ""
    echo "Backups disponibles:"
    ls -1 "$BACKUP_ROOT" 2>/dev/null | grep -E "^backup_|\.tar\.gz$" || echo "  Aucun backup trouvé"
    exit 1
fi

BACKUP_NAME="$1"
BACKUP_DIR="$BACKUP_ROOT/$BACKUP_NAME"

# Check if backup is compressed
if [ -f "$BACKUP_ROOT/$BACKUP_NAME.tar.gz" ]; then
    print_info "Backup compressé détecté, décompression en cours..."
    cd "$BACKUP_ROOT"
    tar -xzf "$BACKUP_NAME.tar.gz"
    print_success "Backup décompressé"
fi

# Verify backup exists
if [ ! -d "$BACKUP_DIR" ]; then
    print_error "Backup introuvable: $BACKUP_DIR"
    echo ""
    echo "Backups disponibles:"
    ls -1 "$BACKUP_ROOT" 2>/dev/null | grep "^backup_" || echo "  Aucun backup trouvé"
    exit 1
fi

# Verify backup integrity
if [ ! -f "$BACKUP_DIR/database.dump" ]; then
    print_error "Backup invalide: database.dump manquant"
    exit 1
fi

if [ ! -d "$BACKUP_DIR/backend" ] || [ ! -d "$BACKUP_DIR/frontend" ]; then
    print_error "Backup invalide: répertoires backend ou frontend manquants"
    exit 1
fi

# =============================================================================
# CONFIRMATION DE L'UTILISATEUR
# =============================================================================

print_header "AVERTISSEMENT - RESTAURATION"

echo ""
echo -e "${RED}⚠️  ATTENTION: Cette opération va:${NC}"
echo -e "   ${RED}1. ÉCRASER votre base de données actuelle${NC}"
echo -e "   ${RED}2. REMPLACER votre code source${NC}"
echo -e "   ${RED}3. REMPLACER vos fichiers de configuration${NC}"
echo ""
echo -e "${YELLOW}Assurez-vous d'avoir:${NC}"
echo "   - Arrêté les applications (backend/frontend)"
echo "   - Créé une sauvegarde de sécurité si nécessaire"
echo ""
echo -e "Backup à restaurer: ${GREEN}$BACKUP_NAME${NC}"
echo ""

# Display backup info if available
if [ -f "$BACKUP_DIR/backup_info.txt" ]; then
    echo -e "${BLUE}Informations du backup:${NC}"
    grep "Date de création:" "$BACKUP_DIR/backup_info.txt" || true
    grep "Taille du backup:" "$BACKUP_DIR/backup_info.txt" || true
    echo ""
fi

echo -n "Voulez-vous continuer? Tapez 'OUI' en majuscules pour confirmer: "
read CONFIRMATION

if [ "$CONFIRMATION" != "OUI" ]; then
    print_warning "Restauration annulée par l'utilisateur"
    exit 0
fi

# =============================================================================
# Database credentials
# =============================================================================

DB_HOST="aws-1-eu-north-1.pooler.supabase.com"
DB_PORT="6543"
DB_NAME="postgres"
DB_USER="postgres.apeyodpxnxxwdxwcnqmo"
DB_PASSWORD="MAMPAPOLino0102"

# =============================================================================
# MAIN RESTORATION PROCESS
# =============================================================================

print_header "DÉMARRAGE DE LA RESTAURATION"
echo ""

# =============================================================================
# 1. RESTAURATION DE LA BASE DE DONNÉES
# =============================================================================

print_header "1. RESTAURATION DE LA BASE DE DONNÉES"

export PGPASSWORD="$DB_PASSWORD"

print_info "Cette opération peut prendre plusieurs minutes..."
echo ""

# Try to restore using pg_restore (custom format)
if [ -f "$BACKUP_DIR/database.dump" ]; then
    echo "Restauration du dump PostgreSQL..."

    pg_restore -h "$DB_HOST" \
               -p "$DB_PORT" \
               -U "$DB_USER" \
               -d "$DB_NAME" \
               --clean \
               --if-exists \
               --no-owner \
               --no-privileges \
               "$BACKUP_DIR/database.dump" 2>&1 | grep -v "NOTICE\|WARNING" || true

    print_success "Base de données restaurée"
else
    print_error "Fichier database.dump introuvable"
    exit 1
fi

unset PGPASSWORD

# =============================================================================
# 2. RESTAURATION DU CODE SOURCE
# =============================================================================

print_header "2. RESTAURATION DU CODE SOURCE"

# Backend
echo "Restauration du backend..."

# Backup current backend (safety)
if [ -d "$BACKEND_DIR" ]; then
    SAFETY_BACKUP="$BACKEND_DIR.before_restore_$(date +%Y%m%d_%H%M%S)"
    print_info "Sauvegarde de sécurité: $SAFETY_BACKUP"
    mv "$BACKEND_DIR" "$SAFETY_BACKUP"
fi

mkdir -p "$BACKEND_DIR"
rsync -av --progress \
    "$BACKUP_DIR/backend/" \
    "$BACKEND_DIR/" > /dev/null

print_success "Backend restauré"

# Frontend
echo "Restauration du frontend..."

# Backup current frontend (safety)
if [ -d "$FRONTEND_DIR" ]; then
    SAFETY_BACKUP="$FRONTEND_DIR.before_restore_$(date +%Y%m%d_%H%M%S)"
    print_info "Sauvegarde de sécurité: $SAFETY_BACKUP"
    mv "$FRONTEND_DIR" "$SAFETY_BACKUP"
fi

mkdir -p "$FRONTEND_DIR"
rsync -av --progress \
    "$BACKUP_DIR/frontend/" \
    "$FRONTEND_DIR/" > /dev/null

print_success "Frontend restauré"

# =============================================================================
# 3. INSTALLATION DES DÉPENDANCES
# =============================================================================

print_header "3. INSTALLATION DES DÉPENDANCES"

# Backend dependencies
echo "Installation des dépendances backend..."
cd "$BACKEND_DIR"
npm install --legacy-peer-deps > /dev/null 2>&1 || npm install > /dev/null 2>&1
print_success "Dépendances backend installées"

# Frontend dependencies
echo "Installation des dépendances frontend..."
cd "$FRONTEND_DIR"
npm install --legacy-peer-deps > /dev/null 2>&1 || npm install > /dev/null 2>&1
print_success "Dépendances frontend installées"

# =============================================================================
# 4. RÉGÉNÉRATION PRISMA
# =============================================================================

print_header "4. RÉGÉNÉRATION PRISMA"

cd "$BACKEND_DIR"
npx prisma generate > /dev/null 2>&1
print_success "Client Prisma régénéré"

# =============================================================================
# 5. NETTOYAGE DES FICHIERS TEMPORAIRES
# =============================================================================

print_header "5. NETTOYAGE"

# Clean backend
rm -rf "$BACKEND_DIR/dist"
rm -rf "$BACKEND_DIR/.next"
print_success "Répertoire dist nettoyé"

# Clean frontend
rm -rf "$FRONTEND_DIR/.next"
print_success "Répertoire .next nettoyé"

# =============================================================================
# 6. VÉRIFICATION DE LA RESTAURATION
# =============================================================================

print_header "6. VÉRIFICATION"

ERRORS=0

# Check backend files
if [ ! -f "$BACKEND_DIR/package.json" ]; then
    print_error "package.json backend manquant"
    ERRORS=$((ERRORS + 1))
else
    print_success "Backend: package.json OK"
fi

if [ ! -f "$BACKEND_DIR/prisma/schema.prisma" ]; then
    print_error "schema.prisma manquant"
    ERRORS=$((ERRORS + 1))
else
    print_success "Backend: schema.prisma OK"
fi

if [ ! -f "$BACKEND_DIR/.env" ]; then
    print_warning ".env backend manquant"
else
    print_success "Backend: .env OK"
fi

# Check frontend files
if [ ! -f "$FRONTEND_DIR/package.json" ]; then
    print_error "package.json frontend manquant"
    ERRORS=$((ERRORS + 1))
else
    print_success "Frontend: package.json OK"
fi

if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    print_error "node_modules backend manquant"
    ERRORS=$((ERRORS + 1))
else
    print_success "Backend: node_modules OK"
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    print_error "node_modules frontend manquant"
    ERRORS=$((ERRORS + 1))
else
    print_success "Frontend: node_modules OK"
fi

# =============================================================================
# SUMMARY
# =============================================================================

print_header "RESTAURATION TERMINÉE"

echo ""
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✨ Restauration réussie!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Prochaines étapes:${NC}"
    echo ""
    echo "1️⃣  Démarrer le backend:"
    echo -e "   ${BLUE}cd $BACKEND_DIR${NC}"
    echo -e "   ${BLUE}npm run start:dev${NC}"
    echo ""
    echo "2️⃣  Démarrer le frontend (dans un nouveau terminal):"
    echo -e "   ${BLUE}cd $FRONTEND_DIR${NC}"
    echo -e "   ${BLUE}npm run dev${NC}"
    echo ""
    echo "3️⃣  Accéder à l'application:"
    echo -e "   ${BLUE}http://localhost:3001${NC}"
    echo ""
    echo -e "${GREEN}✅ Tout est prêt!${NC}"
else
    echo -e "${RED}⚠️  Restauration terminée avec $ERRORS erreur(s)${NC}"
    echo ""
    echo "Veuillez vérifier les erreurs ci-dessus avant de démarrer les applications."
    exit 1
fi

echo ""
print_success "Backup restauré: $BACKUP_NAME"
echo ""
