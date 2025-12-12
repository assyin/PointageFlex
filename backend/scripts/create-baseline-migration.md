# Guide : Créer une migration baseline pour une base de données existante

## Problème
La base de données existe déjà avec des données, mais Prisma Migrate n'a pas d'historique de migrations.

## Solution recommandée

### Option 1 : Utiliser `prisma db push` (Recommandé pour le développement)

Cette commande synchronise le schéma sans créer de migration :

```bash
npx prisma db push
```

**Avantages :**
- Ne supprime pas les données
- Synchronise rapidement le schéma
- Idéal pour le développement

**Inconvénients :**
- Ne crée pas d'historique de migrations
- Pas recommandé pour la production

### Option 2 : Créer une migration baseline (Recommandé pour la production)

1. **Créer le dossier migrations :**
```bash
mkdir -p prisma/migrations
```

2. **Créer une migration baseline initiale :**
```bash
npx prisma migrate dev --name init --create-only
```

3. **Marquer la migration comme appliquée (sans l'exécuter) :**
```bash
npx prisma migrate resolve --applied init
```

4. **Créer la nouvelle migration RBAC :**
```bash
npx prisma migrate dev --name add_rbac_multi_tenant
```

### Option 3 : Reset complet (⚠️ SUPPRIME TOUTES LES DONNÉES)

**⚠️ ATTENTION : Cette option supprime toutes les données !**

```bash
npx prisma migrate reset
```

Puis :
```bash
npx prisma migrate dev --name add_rbac_multi_tenant
```

## Recommandation

Pour votre cas (base de données existante avec données) :
1. Utilisez `prisma db push` pour synchroniser le schéma RBAC
2. Ensuite, créez une migration baseline pour l'historique futur

