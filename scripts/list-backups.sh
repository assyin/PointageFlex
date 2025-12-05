#!/bin/bash

# =============================================================================
# SCRIPT DE LISTE DES BACKUPS - PointaFlex
# =============================================================================
# Ce script affiche tous les backups disponibles avec leurs informations
#
# Usage: ./scripts/list-backups.sh
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="/home/assyin/PointaFlex"
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

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# =============================================================================
# MAIN
# =============================================================================

print_header "LISTE DES BACKUPS DISPONIBLES"

echo ""

# Check if backup directory exists
if [ ! -d "$BACKUP_ROOT" ]; then
    echo -e "${YELLOW}Aucun répertoire de backup trouvé${NC}"
    echo "Le répertoire sera créé lors du premier backup"
    exit 0
fi

# Count backups
BACKUP_FOLDERS=$(ls -1d "$BACKUP_ROOT"/backup_* 2>/dev/null | wc -l)
BACKUP_ARCHIVES=$(ls -1 "$BACKUP_ROOT"/*.tar.gz 2>/dev/null | wc -l)
TOTAL_BACKUPS=$((BACKUP_FOLDERS + BACKUP_ARCHIVES))

if [ $TOTAL_BACKUPS -eq 0 ]; then
    echo -e "${YELLOW}Aucun backup trouvé${NC}"
    echo ""
    echo "Pour créer un backup:"
    echo -e "  ${BLUE}./scripts/backup.sh${NC}"
    echo ""
    exit 0
fi

echo -e "${GREEN}Total: $TOTAL_BACKUPS backup(s) trouvé(s)${NC}"
echo ""

# =============================================================================
# List folder backups
# =============================================================================

if [ $BACKUP_FOLDERS -gt 0 ]; then
    echo -e "${CYAN}📁 Backups décompressés:${NC}"
    echo ""

    for backup_dir in "$BACKUP_ROOT"/backup_*; do
        if [ -d "$backup_dir" ]; then
            BACKUP_NAME=$(basename "$backup_dir")
            BACKUP_SIZE=$(du -sh "$backup_dir" 2>/dev/null | cut -f1)

            echo -e "  ${GREEN}●${NC} $BACKUP_NAME"
            echo -e "    Taille: $BACKUP_SIZE"

            # Extract date from backup_info.txt if available
            if [ -f "$backup_dir/backup_info.txt" ]; then
                BACKUP_DATE=$(grep "Date de création:" "$backup_dir/backup_info.txt" 2>/dev/null | cut -d: -f2- | xargs)
                if [ -n "$BACKUP_DATE" ]; then
                    echo -e "    Date: $BACKUP_DATE"
                fi
            fi

            # Check for database dump
            if [ -f "$backup_dir/database.dump" ]; then
                DB_SIZE=$(du -h "$backup_dir/database.dump" 2>/dev/null | cut -f1)
                echo -e "    BDD: $DB_SIZE"
            fi

            echo ""
        fi
    done
fi

# =============================================================================
# List compressed backups
# =============================================================================

if [ $BACKUP_ARCHIVES -gt 0 ]; then
    echo -e "${CYAN}📦 Backups compressés (.tar.gz):${NC}"
    echo ""

    for backup_file in "$BACKUP_ROOT"/*.tar.gz; do
        if [ -f "$backup_file" ]; then
            BACKUP_NAME=$(basename "$backup_file" .tar.gz)
            BACKUP_SIZE=$(du -sh "$backup_file" 2>/dev/null | cut -f1)
            BACKUP_DATE=$(stat -c %y "$backup_file" 2>/dev/null | cut -d'.' -f1)

            echo -e "  ${GREEN}●${NC} $BACKUP_NAME"
            echo -e "    Taille: $BACKUP_SIZE"
            echo -e "    Date: $BACKUP_DATE"
            echo ""
        fi
    done
fi

# =============================================================================
# Summary and usage instructions
# =============================================================================

echo -e "${BLUE}────────────────────────────────────────${NC}"
echo ""
echo -e "${YELLOW}📋 Commandes disponibles:${NC}"
echo ""
echo -e "  ${CYAN}Créer un backup:${NC}"
echo -e "    ${BLUE}./scripts/backup.sh${NC}"
echo -e "    ${BLUE}./scripts/backup.sh mon_backup_personnalise${NC}"
echo ""
echo -e "  ${CYAN}Restaurer un backup:${NC}"
echo -e "    ${BLUE}./scripts/restore.sh <nom_du_backup>${NC}"
echo ""
echo -e "  ${CYAN}Supprimer un backup:${NC}"
echo -e "    ${BLUE}rm -rf backups/<nom_du_backup>${NC}"
echo -e "    ${BLUE}rm backups/<nom_du_backup>.tar.gz${NC}"
echo ""

# =============================================================================
# Disk space info
# =============================================================================

echo -e "${YELLOW}💾 Espace disque utilisé par les backups:${NC}"
TOTAL_SIZE=$(du -sh "$BACKUP_ROOT" 2>/dev/null | cut -f1)
echo -e "  ${GREEN}$TOTAL_SIZE${NC}"
echo ""
