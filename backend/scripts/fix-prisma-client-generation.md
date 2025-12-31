# Résolution des Erreurs TypeScript - Client Prisma

## Problème
Les erreurs TypeScript indiquent que le client Prisma n'a pas été régénéré après l'ajout des nouveaux champs dans le schéma.

## Solution

### Étape 1 : Régénérer le client Prisma

Exécutez cette commande depuis le répertoire `backend/` :

```bash
cd backend
npx prisma generate
```

Cette commande va :
- Lire le schéma Prisma (`prisma/schema.prisma`)
- Générer les types TypeScript avec les nouveaux champs
- Mettre à jour le client Prisma dans `node_modules/.prisma/client/`

### Étape 2 : Vérifier que les erreurs sont résolues

Après la génération, les erreurs TypeScript devraient disparaître. Les types suivants seront disponibles :

- `Employee.isEligibleForOvertime`
- `Employee.maxOvertimeHoursPerMonth`
- `Employee.maxOvertimeHoursPerWeek`
- `Employee.overtimeEligibilityNotes`
- `TenantSettings.overtimeMinimumThreshold`

### Étape 3 : Résoudre la migration échouée (si nécessaire)

Si vous avez toujours le problème de migration échouée, résolvez-le d'abord :

```bash
# Marquer la migration comme résolue
npx prisma migrate resolve --applied 20250117000000_add_require_break_punch

# Puis appliquer les nouvelles migrations
npx prisma migrate deploy
```

## Ordre recommandé

1. **Régénérer le client Prisma** (pour résoudre les erreurs TypeScript)
2. **Résoudre la migration échouée** (pour synchroniser la base de données)
3. **Appliquer les nouvelles migrations** (pour ajouter les nouveaux champs en base)

## Vérification

Après avoir exécuté `npx prisma generate`, vérifiez que le fichier suivant contient les nouveaux types :

```
node_modules/.prisma/client/index.d.ts
```

Recherchez les propriétés :
- `isEligibleForOvertime`
- `maxOvertimeHoursPerMonth`
- `maxOvertimeHoursPerWeek`
- `overtimeMinimumThreshold`

