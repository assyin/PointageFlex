# Guide de correction du RBAC

## Problème
Les utilisateurs ont été migrés avec le mauvais rôle (tous ont EMPLOYEE au lieu de leurs rôles originaux).

## Solution

### Option 1 : Exécuter le script TypeScript (Recommandé)

```bash
cd backend
npx ts-node scripts/fix-all-rbac.ts
```

Ce script va :
1. Créer tous les rôles manquants pour chaque tenant
2. Supprimer tous les UserTenantRole existants
3. Réassigner les bons rôles basés sur le rôle legacy de chaque utilisateur

### Option 2 : Exécuter via Node directement

Si `npx ts-node` ne fonctionne pas, essayez :

```bash
cd backend
node -r ts-node/register scripts/fix-all-rbac.ts
```

### Option 3 : Utiliser Prisma Studio pour vérifier/corriger manuellement

1. Ouvrez Prisma Studio :
```bash
npx prisma studio
```

2. Vérifiez les rôles dans la table `Role` pour votre tenant
3. Vérifiez les `UserTenantRole` et supprimez les mauvais
4. Créez les bons `UserTenantRole` manuellement

### Après la correction

**IMPORTANT** : Vous devez vous reconnecter pour obtenir un nouveau JWT avec les bons rôles.

1. Déconnectez-vous de l'application
2. Reconnectez-vous avec `admin@demo.com`
3. Le nouveau JWT contiendra les bons rôles

## Vérification

Pour vérifier que les rôles sont corrects :

```sql
SELECT 
  u.email,
  u.role as legacy_role,
  r.code as rbac_role,
  r.name as role_name,
  utr."isActive"
FROM "User" u
LEFT JOIN "UserTenantRole" utr ON utr."userId" = u.id
LEFT JOIN "Role" r ON r.id = utr."roleId"
WHERE u.email = 'admin@demo.com';
```

L'utilisateur `admin@demo.com` devrait avoir :
- `legacy_role`: `SUPER_ADMIN` ou `ADMIN_RH`
- `rbac_role`: `SUPER_ADMIN` ou `ADMIN_RH`
- `isActive`: `true`

