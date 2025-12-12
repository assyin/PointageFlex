# Guide de Migration - UserPreferences et UserSession

## Problème rencontré
Prisma demande de réinitialiser le schéma car il détecte des différences entre le schéma Prisma et la base de données.

## Solution recommandée

### Étape 1 : Vérifier votre fichier .env
Assurez-vous que votre fichier `.env` contient les bonnes variables :

```env
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
DIRECT_URL="postgresql://user:password@host:port/database?schema=public"
```

### Étape 2 : Synchroniser le schéma (Option A - Recommandée pour développement)

Si vous êtes en développement et pouvez accepter une perte de données mineure :

```bash
cd backend
npx prisma db push
```

Quand Prisma demande de réinitialiser, répondez **N** (Non) et utilisez plutôt :

```bash
npx prisma db push --accept-data-loss
```

### Étape 3 : Créer une migration propre (Option B - Pour production)

Si vous voulez créer une migration propre :

1. **Créer la migration sans l'appliquer :**
```bash
npx prisma migrate dev --create-only --name add_user_preferences_and_sessions
```

2. **Vérifier le fichier SQL généré** dans `prisma/migrations/.../migration.sql`

3. **Modifier si nécessaire** pour éviter les conflits avec les index existants

4. **Appliquer la migration :**
```bash
npx prisma migrate dev
```

### Étape 4 : Générer le client Prisma

Après la migration, générez le client Prisma :

```bash
npx prisma generate
```

## Tables ajoutées

1. **UserPreferences** : Stocke les préférences utilisateur (langue, timezone, notifications)
2. **UserSession** : Stocke les sessions actives des utilisateurs

## Vérification

Après la migration, vérifiez que tout fonctionne :

```bash
npx prisma studio
```

Ouvrez Prisma Studio et vérifiez que les tables `UserPreferences` et `UserSession` existent.

## En cas d'erreur

Si vous rencontrez toujours des erreurs :

1. Vérifiez que votre base de données est accessible
2. Vérifiez les permissions de votre utilisateur PostgreSQL
3. Vérifiez que le schéma "public" existe
4. Essayez de vous connecter directement avec `psql` ou un client PostgreSQL

## Notes importantes

- ⚠️ **Ne réinitialisez jamais le schéma en production** sans sauvegarde
- ✅ **Faites toujours une sauvegarde** avant de modifier le schéma en production
- 🔄 **Utilisez `prisma db push`** uniquement en développement

