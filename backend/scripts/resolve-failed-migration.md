# Résolution de la Migration Échouée

## Problème
La migration `20250117000000_add_require_break_punch` a échoué et bloque l'application de nouvelles migrations.

## Solution

### Étape 1 : Vérifier l'état de la base de données

Exécutez cette requête SQL pour vérifier si la colonne `requireBreakPunch` existe déjà :

```sql
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'TenantSettings' 
  AND column_name = 'requireBreakPunch';
```

### Étape 2A : Si la colonne EXISTE déjà

La migration a partiellement réussi. Marquez-la comme résolue :

```bash
cd backend
npx prisma migrate resolve --applied 20250117000000_add_require_break_punch
```

### Étape 2B : Si la colonne N'EXISTE PAS

Appliquez manuellement la migration :

```sql
-- Ajouter la colonne manuellement
ALTER TABLE "TenantSettings" 
ADD COLUMN IF NOT EXISTS "requireBreakPunch" BOOLEAN NOT NULL DEFAULT false;
```

Puis marquez la migration comme résolue :

```bash
cd backend
npx prisma migrate resolve --applied 20250117000000_add_require_break_punch
```

### Étape 3 : Appliquer les nouvelles migrations

Une fois la migration résolue, appliquez les nouvelles migrations :

```bash
cd backend
npx prisma migrate deploy
```

## Alternative : Utiliser Prisma Studio

Vous pouvez aussi vérifier l'état via Prisma Studio :

```bash
cd backend
npx prisma studio
```

Ouvrez la table `TenantSettings` et vérifiez si la colonne `requireBreakPunch` existe.

