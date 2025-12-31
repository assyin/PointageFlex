# Script de Re-vérification des Anomalies de Pointage

## Description

Ce script (`recheck-attendance-anomalies.ts`) re-vérifie tous les pointages existants avec les nouvelles règles de validation, notamment :

- **Détection des anomalies pour les weekends** si `requireScheduleForAttendance` est activé
- **Vérification de l'absence de planning/shift** même pour les weekends
- **Mise à jour des anomalies** selon les nouvelles règles

## Utilisation

```bash
cd backend
npx ts-node scripts/recheck-attendance-anomalies.ts
```

## Fonctionnalités

### ✅ Ce que fait le script :

1. **Parcourt tous les tenants** de la base de données
2. **Récupère les paramètres** de chaque tenant (`requireScheduleForAttendance`, `workingDays`)
3. **Re-vérifie chaque pointage** existant (sauf ceux déjà corrigés)
4. **Détecte les nouvelles anomalies** selon les règles mises à jour :
   - Weekends sans planning/shift si `requireScheduleForAttendance = true`
   - Jours ouvrables sans planning/shift
   - Retards, départs anticipés, absences partielles
   - Doubles entrées/sorties
   - Sorties sans entrées
5. **Met à jour les pointages** avec les nouvelles anomalies détectées
6. **Supprime les anomalies** qui ne sont plus valides

### ⚠️ Ce que le script NE fait PAS :

- Ne modifie **pas** les pointages déjà corrigés (`isCorrected = true`)
- Ne crée **pas** de nouveaux pointages
- Ne supprime **pas** les pointages existants

## Exemple de sortie

```
🔍 Re-vérification des anomalies de pointage avec les nouvelles règles...

📋 Traitement du tenant: Test Company (52ca4182-5679-4298-8313-a8853f40d4a1)

⚙️  Paramètres du tenant:
   - requireScheduleForAttendance: true
   - Jours ouvrables: 1, 2, 3, 4, 5, 6

✅ 5 employés trouvés

   👤 Jean Normal (EMP001): 42 pointages à vérifier
      ⚠️  Anomalie détectée/mise à jour: ABSENCE - Absence détectée pour Jean Normal (EMP001) le 03/01/2026 (weekend) : aucun planning publié...
      ⚠️  Anomalie détectée/mise à jour: ABSENCE - Absence détectée pour Jean Normal (EMP001) le 04/01/2026 (weekend) : aucun planning publié...

✅ Tenant Test Company traité

============================================================
📊 RÉSUMÉ:
   - Pointages traités: 210
   - Anomalies détectées: 15
   - Anomalies mises à jour: 12
============================================================

✅ Re-vérification terminée avec succès!
```

## Cas d'usage

### 1. Après activation de `requireScheduleForAttendance`

Si vous venez d'activer le paramètre `requireScheduleForAttendance` dans les settings, ce script détectera les pointages des weekends qui n'ont pas de planning/shift.

### 2. Après correction de bugs de détection

Si des bugs dans la détection d'anomalies ont été corrigés, ce script appliquera les corrections aux pointages existants.

### 3. Migration de données

Lors d'une migration ou d'une mise à jour des règles de validation, ce script permet de mettre à jour tous les pointages existants.

## Notes importantes

- ⏱️ **Temps d'exécution** : Le script peut prendre plusieurs minutes selon le nombre de pointages
- 🔒 **Sécurité** : Le script ne modifie que les champs `hasAnomaly`, `anomalyType`, et `anomalyNote`
- 📊 **Performance** : Le script traite les pointages un par un pour éviter les problèmes de mémoire
- ✅ **Idempotent** : Vous pouvez exécuter le script plusieurs fois sans problème

## Dépannage

### Erreur de connexion à la base de données

Vérifiez que votre fichier `.env` contient les bonnes variables d'environnement :
```env
DATABASE_URL="postgresql://..."
```

### Script trop lent

Le script traite les pointages un par un. Pour améliorer les performances, vous pouvez :
- Filtrer par tenant spécifique (modifier le script)
- Filtrer par date (modifier le script)
- Exécuter le script en dehors des heures de pointe

## Support

Pour toute question ou problème, consultez la documentation principale ou contactez l'équipe de développement.

