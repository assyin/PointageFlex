# Guide : Appliquer le champ `requireScheduleForAttendance`

## Problème rencontré

L'erreur `P3006` indique que Prisma ne peut pas utiliser la base de données shadow pour valider la migration car la table `Employee` n'existe pas dans cette base.

## Solutions

### ✅ Solution 1 : Utiliser `prisma db push` (Recommandé pour développement)

Cette commande synchronise directement le schéma avec la base de données sans passer par la base de données shadow.

**Sous Linux/Mac/WSL :**
```bash
cd backend
npx prisma db push
npx prisma generate
```

**Sous Windows PowerShell :**
```powershell
cd backend
npx prisma db push
npx prisma generate
```

**Ou utiliser le script :**
```bash
# Linux/Mac/WSL
bash apply-new-field.sh

# Windows
powershell -ExecutionPolicy Bypass -File apply-new-field.ps1
```

**Avantages :**
- ✅ Simple et rapide
- ✅ Ne nécessite pas de base de données shadow
- ✅ Ne supprime pas les données existantes
- ✅ Idéal pour le développement

**Inconvénients :**
- ⚠️ Ne crée pas d'historique de migration
- ⚠️ À éviter en production

---

### Solution 2 : Créer la migration sans validation (Alternative)

Si vous voulez absolument créer une migration :

```bash
cd backend
npx prisma migrate dev --create-only --name add_require_schedule_for_attendance
```

Puis appliquer manuellement :
```bash
npx prisma migrate deploy
```

---

### Solution 3 : Désactiver la base de données shadow (Avancé)

Si vous voulez continuer à utiliser `prisma migrate dev`, vous pouvez désactiver la base de données shadow en modifiant `prisma/schema.prisma` :

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
  shadowDatabaseUrl = env("DATABASE_URL") // Utiliser la même DB (non recommandé)
}
```

⚠️ **Attention :** Cette approche n'est pas recommandée car elle peut causer des problèmes de validation.

---

## Vérification après application

Après avoir appliqué la modification, vérifiez que le champ existe :

```bash
# Ouvrir Prisma Studio
npx prisma studio
```

Dans Prisma Studio, allez dans la table `TenantSettings` et vérifiez que le champ `requireScheduleForAttendance` existe avec la valeur `true` par défaut.

---

## Recommandation

Pour votre cas (développement avec base de données existante), utilisez **Solution 1** (`prisma db push`).

C'est la méthode la plus simple et la plus sûre pour ajouter un nouveau champ à une table existante.

