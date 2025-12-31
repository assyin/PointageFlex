# Script de Suspension Rétroactive des Plannings

## Problème Résolu

Ce script résout un problème où les plannings ne sont pas automatiquement suspendus lorsqu'ils sont créés APRÈS l'approbation d'un congé.

### Scénario du problème :
1. Un congé est approuvé pour la période du 07/01 au 21/01
2. Plus tard, un planning est créé pour le 15/01 (dans la période du congé)
3. Le planning reste en statut `PUBLISHED` au lieu d'être `SUSPENDED_BY_LEAVE`
4. L'icône 🏖️ ne s'affiche pas dans l'interface de planification

### Comportement normal du système :
- Les plannings sont suspendus **uniquement** lors de l'approbation d'un congé
- Si un planning est créé après l'approbation, il n'est pas automatiquement suspendu

## Utilisation

```bash
npx ts-node scripts/suspend-schedules-in-approved-leaves.ts
```

## Ce que fait le script

1. **Recherche** tous les congés avec statut `APPROVED`
2. Pour chaque congé, **trouve** tous les plannings avec :
   - Statut `PUBLISHED`
   - Date dans la période du congé
   - Même employé que le congé
3. **Suspend** ces plannings en :
   - Changeant le statut vers `SUSPENDED_BY_LEAVE`
   - Ajoutant le lien vers le congé (`suspendedByLeaveId`)
   - Enregistrant la date de suspension (`suspendedAt`)

## Résultat

Après l'exécution :
- Les plannings suspendus affichent l'icône 🏖️ dans l'interface
- Le tooltip montre "Planning suspendu par un congé approuvé"
- Les plannings suspendus ne génèrent pas d'anomalies d'absence

## Quand l'exécuter ?

- **Après avoir créé des plannings** pour des périodes où des congés sont déjà approuvés
- **Après une migration de données** où plannings et congés sont importés séparément
- **En cas de correction** si des plannings n'ont pas été correctement suspendus

## Vérification

Pour vérifier les plannings suspendus :
```bash
npx ts-node scripts/check-suspended-schedules.ts
```

## Notes Techniques

- Le script est **idempotent** : il peut être exécuté plusieurs fois sans problème
- Seuls les plannings `PUBLISHED` sont suspendus (pas les brouillons ou annulés)
- Les plannings déjà suspendus ne sont pas modifiés
