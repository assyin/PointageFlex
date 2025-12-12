# Guide de migration RBAC sécurisée

## ⚠️ AVANT DE CONTINUER

### Vérifications obligatoires

1. **Vérifier les emails en double :**
```sql
SELECT email, COUNT(*) as count
FROM "User"
GROUP BY email
HAVING COUNT(*) > 1;
```

Si des résultats apparaissent, vous devez corriger les doublons avant de continuer.

2. **Vérifier les valeurs de rôle :**
```sql
SELECT role, COUNT(*) as count
FROM "User"
WHERE role IS NOT NULL
GROUP BY role;
```

Toutes les valeurs doivent être : `SUPER_ADMIN`, `ADMIN_RH`, `MANAGER`, ou `EMPLOYEE`.

## Option 1 : Utiliser `prisma db push` (Recommandé)

### Si PAS d'emails en double :

1. Répondez **"y"** à la question de Prisma
2. Les changements seront appliqués
3. Les données seront préservées

### Si des emails en double existent :

1. Corrigez d'abord les doublons :
```sql
-- Exemple : mettre à jour les emails en double
UPDATE "User" 
SET email = email || '_' || id 
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY "createdAt") as rn
        FROM "User"
    ) t WHERE rn > 1
);
```

2. Puis réessayez `prisma db push`

## Option 2 : Migration SQL manuelle (Plus de contrôle)

1. Exécutez le script SQL : `scripts/migration-rbac-manual.sql`
2. Vérifiez que tout s'est bien passé
3. Marquez la migration comme appliquée :
```bash
npx prisma migrate resolve --applied add_rbac_multi_tenant
```

## Après la migration

1. **Initialiser le système RBAC :**
```bash
npx ts-node scripts/init-rbac.ts
```

2. **Générer le client Prisma :**
```bash
npx prisma generate
```

3. **Vérifier que tout fonctionne :**
```bash
npm run start:dev
```

## En cas de problème

Si quelque chose ne va pas :

1. **Restaurer depuis un backup** (si disponible)
2. **Ou annuler les changements manuellement** en exécutant les commandes inverses

