# Étapes après la migration RBAC

## ✅ Migration terminée avec succès !

Votre base de données est maintenant synchronisée avec le nouveau schéma RBAC multi-tenant.

## 📋 Prochaines étapes

### 1. Initialiser le système RBAC (OBLIGATOIRE)

Cette étape crée toutes les permissions et les rôles par défaut :

```bash
npx ts-node scripts/init-rbac.ts
```

**Ce que fait ce script :**
- ✅ Crée toutes les permissions métier (60+ permissions)
- ✅ Crée le rôle SUPER_ADMIN (système)
- ✅ Crée les rôles par défaut pour chaque tenant (ADMIN_RH, MANAGER, EMPLOYEE)
- ✅ Assigne les permissions aux rôles

**Durée estimée :** 1-2 minutes

### 2. Migrer les utilisateurs existants (RECOMMANDÉ)

Si vous avez des utilisateurs existants avec des rôles legacy, migrez-les vers le nouveau système :

```bash
npx ts-node scripts/migrate-users-to-rbac.ts
```

**Note :** Ce script doit être créé si vous avez des utilisateurs existants.

### 3. Vérifier que tout fonctionne

#### 3.1. Générer le client Prisma (déjà fait automatiquement)
```bash
npx prisma generate
```

#### 3.2. Démarrer l'application
```bash
npm run start:dev
```

#### 3.3. Tester les endpoints RBAC
- `GET /api/v1/permissions` - Liste des permissions
- `GET /api/v1/roles` - Liste des rôles
- `GET /api/v1/users/:id/roles` - Rôles d'un utilisateur

### 4. Mettre à jour votre code (si nécessaire)

Si vous utilisez encore l'ancien système de rôles (`user.role`), migrez progressivement vers le nouveau système :

- Utilisez `@RequirePermissions()` au lieu de `@Roles()`
- Utilisez `PermissionsGuard` pour vérifier les permissions
- Utilisez `UserTenantRolesService` pour gérer les rôles

## 🔍 Vérifications

### Vérifier que les tables sont créées

```sql
-- Vérifier les nouvelles tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('Role', 'Permission', 'RolePermission', 'UserTenantRole');

-- Vérifier les permissions
SELECT COUNT(*) FROM "Permission";

-- Vérifier les rôles
SELECT COUNT(*) FROM "Role";
```

### Vérifier les données utilisateurs

```sql
-- Vérifier que les utilisateurs existent toujours
SELECT COUNT(*) FROM "User";

-- Vérifier les rôles legacy
SELECT role, COUNT(*) FROM "User" WHERE role IS NOT NULL GROUP BY role;
```

## ⚠️ Points importants

1. **Les utilisateurs existants conservent leur rôle legacy** (`User.role`)
   - Le nouveau système utilise `UserTenantRole`
   - Les deux systèmes coexistent pour la compatibilité

2. **Pour utiliser le nouveau système RBAC :**
   - Assignez des rôles via `UserTenantRole`
   - Utilisez `@RequirePermissions()` dans vos controllers

3. **Migration progressive recommandée :**
   - Gardez l'ancien système fonctionnel
   - Migrez progressivement vers le nouveau système
   - Testez bien avant de supprimer l'ancien code

## 🎯 Checklist

- [ ] Exécuter `init-rbac.ts` pour créer permissions et rôles
- [ ] Vérifier que les tables sont créées
- [ ] Vérifier que les permissions sont créées
- [ ] Vérifier que les rôles sont créés
- [ ] Tester l'application
- [ ] Tester les endpoints RBAC
- [ ] (Optionnel) Migrer les utilisateurs existants

## 📚 Documentation

Consultez `docs/RBAC_MULTI_TENANT.md` pour :
- Liste complète des permissions
- Guide d'utilisation
- Exemples de code

