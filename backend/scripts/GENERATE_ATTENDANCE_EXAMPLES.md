# Script de Génération d'Exemples de Pointages

Ce script génère des exemples de pointages pour **20 employés aléatoires** avec différents types de scénarios (normal, retard, absence, anomalie, etc.).

## 📋 Description

Le script génère des pointages pour les **7 derniers jours** (hors weekends) pour 20 employés sélectionnés aléatoirement parmi les employés actifs du tenant.

## 🎯 Scénarios générés

- **Normal** (60%) : Journée normale avec IN, BREAK_START, BREAK_END, OUT
- **Retard** (15%) : Arrivée en retard de 15-60 minutes
- **Départ anticipé** (5%) : Départ à 15h30
- **Oubli de sortie** (5%) : Pointage d'entrée sans sortie (anomalie)
- **Double entrée** (3%) : Double pointage d'entrée (anomalie)
- **Pause longue** (3%) : Pause déjeuner de 2h30 (anomalie)
- **Mission** (4%) : Mission externe avec MISSION_START et MISSION_END
- **Absence** (5%) : Aucun pointage pour la journée

## 🚀 Utilisation

### Prérequis

1. Assurez-vous que le backend est configuré et que la base de données est accessible
2. Vérifiez que vous avez des employés actifs dans votre tenant

### Exécution

```bash
cd backend
npx ts-node scripts/generate-attendance-examples.ts
```

Ou avec npm:

```bash
cd backend
npm run ts-node scripts/generate-attendance-examples.ts
```

## 📊 Résultat

Le script affichera :
- La liste des 20 employés sélectionnés
- La période de génération
- La distribution des scénarios
- Les pointages générés pour chaque employé et chaque jour
- Les statistiques finales avec le nombre de pointages générés par scénario

## ⚠️ Notes

- Les pointages générés sont marqués avec `isGenerated: true` et `generatedBy: 'SCRIPT_GENERATE_ATTENDANCE_EXAMPLES'`
- Les weekends (samedi et dimanche) sont automatiquement exclus
- Les pointages incluent une variance aléatoire de ±5 minutes pour plus de réalisme
- Le script utilise le premier tenant trouvé dans la base de données

## 🧹 Nettoyage

Pour supprimer les pointages générés, vous pouvez utiliser :

```sql
DELETE FROM "Attendance" 
WHERE "isGenerated" = true 
AND "generatedBy" = 'SCRIPT_GENERATE_ATTENDANCE_EXAMPLES';
```

Ou via l'API de nettoyage du data-generator si disponible.

