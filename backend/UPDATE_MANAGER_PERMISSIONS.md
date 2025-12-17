# Mise à jour des permissions MANAGER pour la gestion des plannings

## Problème
Les Managers Régionaux ne peuvent pas créer, modifier ou supprimer des plannings car ils n'ont pas les permissions nécessaires (`schedule.create`, `schedule.update`, `schedule.delete`, `schedule.view_all`).

## Solution

### Option 1 : Via l'API (Recommandé)

Si le serveur backend est démarré, appelez l'endpoint suivant en tant qu'ADMIN_RH ou SUPER_ADMIN :

```bash
POST http://localhost:3000/api/v1/roles/update-all-managers
Authorization: Bearer <votre_token>
```

Cet endpoint mettra à jour automatiquement tous les rôles MANAGER avec les nouvelles permissions par défaut.

### Option 2 : Via le script TypeScript

Exécutez le script TypeScript dans le dossier `backend` :

```bash
cd backend
npx ts-node scripts/update-manager-schedule-permissions.ts
```

### Option 3 : Via SQL direct

Exécutez le script SQL dans votre base de données PostgreSQL :

```bash
psql -U votre_utilisateur -d votre_base_de_donnees -f scripts/update-manager-permissions-schedule.sql
```

Ou via Prisma Studio :
1. Ouvrez Prisma Studio : `npx prisma studio`
2. Allez dans l'onglet "SQL"
3. Copiez-collez le contenu de `scripts/update-manager-permissions-schedule.sql`
4. Exécutez la requête

### Option 4 : Via l'endpoint de réinitialisation (pour un rôle spécifique)

Pour réinitialiser les permissions d'un rôle MANAGER spécifique :

```bash
POST http://localhost:3000/api/v1/roles/{roleId}/reset-permissions
Authorization: Bearer <votre_token>
```

Remplacez `{roleId}` par l'ID du rôle MANAGER que vous souhaitez mettre à jour.

## Permissions ajoutées

Les permissions suivantes seront ajoutées au rôle MANAGER :

- `schedule.view_all` : Voir tous les plannings des employés gérés
- `schedule.create` : Créer des plannings
- `schedule.update` : Modifier des plannings
- `schedule.delete` : Supprimer des plannings

## Important

⚠️ **Après la mise à jour des permissions, les utilisateurs MANAGER doivent se reconnecter** pour obtenir un nouveau JWT avec les nouvelles permissions. Les permissions seront actives uniquement après la reconnexion.

## Vérification

Pour vérifier que les permissions ont été ajoutées, vous pouvez :

1. Vérifier via l'API :
```bash
GET http://localhost:3000/api/v1/roles/{roleId}
Authorization: Bearer <votre_token>
```

2. Vérifier directement dans la base de données :
```sql
SELECT r.name, r.code, p.code as permission_code
FROM "Role" r
JOIN "RolePermission" rp ON r.id = rp."roleId"
JOIN "Permission" p ON rp."permissionId" = p.id
WHERE r.code = 'MANAGER'
  AND p.code IN ('schedule.view_all', 'schedule.create', 'schedule.update', 'schedule.delete')
ORDER BY r."tenantId", p.code;
```

