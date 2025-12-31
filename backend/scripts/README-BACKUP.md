# Scripts de Backup et Restauration

## ⚠️ Note Importante

Les scripts de backup nécessitent une version de `pg_dump` compatible avec PostgreSQL 17.6.

Pour installer la bonne version:
```bash
# Ubuntu/Debian
sudo apt install postgresql-client-17
```

## Utilisation

### Créer un Backup

```bash
cd backend/scripts
./create-backup.sh [nom_optionnel]
```

Le backup sera créé dans le dossier `backups/` au format compressé `.sql.gz`.

### Restaurer un Backup

```bash
cd backend/scripts
./restore-backup.sh <nom_backup>
```

**⚠️ ATTENTION**: La restauration écrase complètement la base de données actuelle!

## Backup Supabase (Alternative Recommandée)

Vous pouvez également utiliser les outils de backup intégrés de Supabase:

1. Connectez-vous au dashboard Supabase
2. Allez dans Database → Backups
3. Créez un backup manuel ou configurez des backups automatiques

## Structure des Backups

Chaque backup contient:
- `<nom>.sql.gz` : Dump SQL compressé de la base de données
- `<nom>.meta.json` : Métadonnées (date, commit git, etc.)
