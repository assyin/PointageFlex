# 🧪 Scénarios de Test Complets - Pointages et Heures Supplémentaires

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Scénarios de Test - Pointages](#scénarios-de-test---pointages)
3. [Scénarios de Test - Heures Supplémentaires](#scénarios-de-test---heures-supplémentaires)
4. [Guide d'Exécution](#guide-dexécution)

---

## 🔧 Prérequis

### 1. Configuration Tenant Settings

Les paramètres suivants doivent être configurés dans `TenantSettings` :

```typescript
{
  breakDuration: 60,                    // 60 minutes de pause
  requireBreakPunch: false,            // Pointage pause optionnel
  overtimeMinimumThreshold: 30,         // 30 minutes minimum pour créer overtime
  overtimeRounding: 15,                // Arrondi à 15 minutes
  lateToleranceEntry: 10,              // Tolérance retard entrée: 10 min
  earlyToleranceExit: 5,               // Tolérance départ anticipé: 5 min
  dailyWorkingHours: 8,                // 8 heures par jour
  workDaysPerWeek: 6,                   // 6 jours par semaine
  maxWeeklyHours: 48,                   // 48 heures max par semaine
}
```

### 2. Employés de Test

Créer au moins 5 employés avec différentes configurations :

| Matricule | Nom | Éligible HS | Plafond Mensuel | Plafond Hebdo | Shift |
|-----------|-----|-------------|-----------------|---------------|-------|
| EMP001 | Jean Normal | ✅ Oui | 20h | 5h | Matin (08:00-17:00) |
| EMP002 | Marie Limite | ✅ Oui | 10h | 3h | Matin (08:00-17:00) |
| EMP003 | Pierre NonEligible | ❌ Non | - | - | Matin (08:00-17:00) |
| EMP004 | Sophie Nuit | ✅ Oui | 30h | 8h | Nuit (21:00-06:00) |
| EMP005 | Paul MultiShift | ✅ Oui | 25h | 6h | Matin + Soir |

### 3. Shifts de Test

Créer 3 shifts :

- **Matin** : 08:00 - 17:00 (9h, pause 1h = 8h net)
- **Soir** : 14:00 - 22:00 (8h, pause 1h = 7h net)
- **Nuit** : 21:00 - 06:00 (9h, pause 1h = 8h net)

---

## 📝 Scénarios de Test - Pointages

### Scénario 1 : Pointage Normal (IN/OUT)

**Objectif** : Vérifier un pointage standard sans anomalies

**Prérequis** :
- Employé : EMP001 (Jean Normal)
- Shift : Matin (08:00-17:00)
- Date : Aujourd'hui

**Étapes** :
1. Pointage IN à 08:00
2. Pointage BREAK_START à 12:00
3. Pointage BREAK_END à 13:00
4. Pointage OUT à 17:00

**Requêtes HTTP** :

```bash
# 1. Pointage IN
POST http://localhost:3001/attendance
Authorization: Bearer {token}
Content-Type: application/json

{
  "employeeId": "{EMP001_ID}",
  "type": "ENTRY",
  "timestamp": "2025-01-20T08:00:00Z",
  "method": "MANUAL",
  "deviceId": "TEST_DEVICE_001"
}

# 2. Pointage BREAK_START
POST http://localhost:3001/attendance
{
  "employeeId": "{EMP001_ID}",
  "type": "BREAK_START",
  "timestamp": "2025-01-20T12:00:00Z",
  "method": "MANUAL"
}

# 3. Pointage BREAK_END
POST http://localhost:3001/attendance
{
  "employeeId": "{EMP001_ID}",
  "type": "BREAK_END",
  "timestamp": "2025-01-20T13:00:00Z",
  "method": "MANUAL"
}

# 4. Pointage OUT
POST http://localhost:3001/attendance
{
  "employeeId": "{EMP001_ID}",
  "type": "EXIT",
  "timestamp": "2025-01-20T17:00:00Z",
  "method": "MANUAL"
}
```

**Résultats Attendus** :
- ✅ 4 pointages créés avec succès
- ✅ Aucune anomalie détectée
- ✅ `workedMinutes` = 480 (8 heures)
- ✅ `overtimeMinutes` = 0 (pas d'heures sup)
- ✅ `actualBreakMinutes` = 60 (1 heure de pause)

---

### Scénario 2 : Retard à l'Entrée

**Objectif** : Vérifier la détection d'un retard

**Prérequis** :
- Employé : EMP001
- Shift : Matin (08:00-17:00)
- Tolérance : 10 minutes

**Étapes** :
1. Pointage IN à 08:15 (15 min de retard)
2. Pointage OUT à 17:00

**Résultats Attendus** :
- ✅ Pointage IN créé
- ⚠️ Anomalie `LATE` détectée
- ✅ `lateMinutes` = 15
- ✅ `workedMinutes` = 465 (8h - 15min de retard)

---

### Scénario 3 : Départ Anticipé

**Objectif** : Vérifier la détection d'un départ anticipé

**Prérequis** :
- Employé : EMP001
- Shift : Matin (08:00-17:00)

**Étapes** :
1. Pointage IN à 08:00
2. Pointage OUT à 16:30 (30 min avant la fin)

**Résultats Attendus** :
- ✅ Pointage OUT créé
- ⚠️ Anomalie `EARLY_LEAVE` détectée
- ✅ `earlyLeaveMinutes` = 30
- ✅ `workedMinutes` = 510 (8h30 - 30min = 8h)

---

### Scénario 4 : DOUBLE_IN (Double Entrée)

**Objectif** : Vérifier la détection d'un DOUBLE_IN

**Prérequis** :
- Employé : EMP001
- Shift : Matin (08:00-17:00)

**Étapes** :
1. Pointage IN à 08:00
2. Pointage IN à 08:30 (sans OUT entre les deux)

**Résultats Attendus** :
- ✅ Premier IN créé
- ⚠️ Deuxième IN créé mais anomalie `DOUBLE_IN` détectée
- ✅ Suggestion de correction proposée (supprimer le deuxième IN ou ajouter un OUT)

---

### Scénario 5 : MISSING_IN (Sortie sans Entrée)

**Objectif** : Vérifier la détection d'un MISSING_IN

**Prérequis** :
- Employé : EMP001

**Étapes** :
1. Pointage OUT à 17:00 (sans IN préalable aujourd'hui)

**Résultats Attendus** :
- ✅ Pointage OUT créé
- ⚠️ Anomalie `MISSING_IN` détectée
- ✅ Vérification des pointages précédents (hier)
- ✅ Suggestion d'heure d'entrée proposée

---

### Scénario 6 : MISSING_OUT (Entrée sans Sortie)

**Objectif** : Vérifier la détection d'un MISSING_OUT

**Prérequis** :
- Employé : EMP001
- Shift : Matin (08:00-17:00)

**Étapes** :
1. Pointage IN à 08:00
2. Attendre la fin du shift (17:00)
3. Le job batch détecte le MISSING_OUT

**Résultats Attendus** :
- ✅ Pointage IN créé
- ⚠️ Anomalie `MISSING_OUT` détectée après 17:00
- ✅ Suggestion d'heure de sortie proposée

---

### Scénario 7 : Pointage avec Heures Supplémentaires

**Objectif** : Vérifier le calcul des heures sup

**Prérequis** :
- Employé : EMP001 (éligible, plafond 20h/mois)
- Shift : Matin (08:00-17:00)

**Étapes** :
1. Pointage IN à 08:00
2. Pointage OUT à 19:00 (2h après la fin du shift)

**Résultats Attendus** :
- ✅ Pointage OUT créé
- ✅ `workedMinutes` = 600 (10 heures)
- ✅ `overtimeMinutes` = 120 (2 heures sup)
- ✅ `overtimeMinutes` >= `overtimeMinimumThreshold` (30 min)
- ✅ Overtime créé automatiquement par le job batch

---

### Scénario 8 : Pointage avec Pause Non Pointée

**Objectif** : Vérifier le calcul avec `requireBreakPunch = false`

**Prérequis** :
- TenantSettings : `requireBreakPunch = false`
- TenantSettings : `breakDuration = 60`

**Étapes** :
1. Pointage IN à 08:00
2. Pointage OUT à 17:00
3. Pas de pointage BREAK_START/BREAK_END

**Résultats Attendus** :
- ✅ Pointages IN/OUT créés
- ✅ `actualBreakMinutes` = 60 (depuis TenantSettings)
- ✅ `workedMinutes` = 480 (8h - 1h pause)

---

### Scénario 9 : Pointage avec Pause Pointée

**Objectif** : Vérifier le calcul avec `requireBreakPunch = true`

**Prérequis** :
- TenantSettings : `requireBreakPunch = true`

**Étapes** :
1. Pointage IN à 08:00
2. Pointage BREAK_START à 12:00
3. Pointage BREAK_END à 13:30 (pause de 1h30)
4. Pointage OUT à 17:00

**Résultats Attendus** :
- ✅ Pointages créés
- ✅ `actualBreakMinutes` = 90 (1h30 réelle)
- ✅ `workedMinutes` = 450 (8h30 - 1h30 pause)

---

### Scénario 10 : Pointage Nuit avec Heures Sup

**Objectif** : Vérifier le calcul pour shift de nuit

**Prérequis** :
- Employé : EMP004 (Sophie Nuit)
- Shift : Nuit (21:00-06:00)

**Étapes** :
1. Pointage IN à 21:00 (jour J)
2. Pointage OUT à 07:00 (jour J+1, 1h après la fin)

**Résultats Attendus** :
- ✅ Pointage créé
- ✅ `overtimeMinutes` = 60 (1 heure sup)
- ✅ Overtime créé avec type `NIGHT` (si applicable)

---

## 💰 Scénarios de Test - Heures Supplémentaires

### Scénario 11 : Création Manuelle d'Overtime

**Objectif** : Vérifier la création manuelle d'heures sup

**Prérequis** :
- Employé : EMP001 (éligible, plafond 20h/mois, 5h/semaine)

**Étapes** :
1. Créer un overtime manuel

**Requête HTTP** :

```bash
POST http://localhost:3001/overtime
Authorization: Bearer {token}
Content-Type: application/json

{
  "employeeId": "{EMP001_ID}",
  "date": "2025-01-20",
  "hours": 2.5,
  "type": "STANDARD",
  "notes": "Test manuel"
}
```

**Résultats Attendus** :
- ✅ Overtime créé avec statut `PENDING`
- ✅ Vérification de l'éligibilité : OK
- ✅ Vérification des plafonds : OK (2.5h < 5h/semaine et < 20h/mois)

---

### Scénario 12 : Overtime avec Plafond Mensuel Atteint

**Objectif** : Vérifier le rejet si plafond mensuel atteint

**Prérequis** :
- Employé : EMP002 (Marie Limite, plafond 10h/mois)
- Overtime existant : 10h déjà approuvées ce mois

**Étapes** :
1. Tenter de créer un overtime de 1h

**Résultats Attendus** :
- ❌ Erreur : "Plafond mensuel atteint (10h/10h)"
- ❌ Overtime non créé

---

### Scénario 13 : Overtime avec Plafond Hebdomadaire Atteint

**Objectif** : Vérifier le rejet si plafond hebdomadaire atteint

**Prérequis** :
- Employé : EMP002 (plafond 3h/semaine)
- Overtime existant : 3h déjà approuvées cette semaine

**Étapes** :
1. Tenter de créer un overtime de 0.5h

**Résultats Attendus** :
- ❌ Erreur : "Plafond hebdomadaire atteint (3h/3h)"
- ❌ Overtime non créé

---

### Scénario 14 : Overtime avec Ajustement Partiel

**Objectif** : Vérifier l'ajustement si plafond partiellement atteint

**Prérequis** :
- Employé : EMP002 (plafond 3h/semaine)
- Overtime existant : 2.5h déjà approuvées cette semaine

**Étapes** :
1. Tenter de créer un overtime de 1h

**Résultats Attendus** :
- ⚠️ Avertissement : "Plafond partiel atteint"
- ✅ Overtime créé avec 0.5h seulement (3h - 2.5h = 0.5h restant)

---

### Scénario 15 : Overtime pour Employé Non Éligible

**Objectif** : Vérifier le rejet si employé non éligible

**Prérequis** :
- Employé : EMP003 (Pierre NonEligible, `isEligibleForOvertime = false`)

**Étapes** :
1. Tenter de créer un overtime

**Résultats Attendus** :
- ❌ Erreur : "L'employé n'est pas éligible aux heures supplémentaires"
- ❌ Overtime non créé

---

### Scénario 16 : Création Automatique d'Overtime (Job Batch)

**Objectif** : Vérifier la création automatique depuis les pointages

**Prérequis** :
- Employé : EMP001 (éligible)
- Pointage avec `overtimeMinutes` = 120 (2h)
- `overtimeMinimumThreshold` = 30 min

**Étapes** :
1. Créer un pointage avec heures sup
2. Attendre l'exécution du job batch (ou déclencher manuellement)

**Résultats Attendus** :
- ✅ Job batch détecte le pointage avec heures sup
- ✅ Overtime créé automatiquement avec statut `APPROVED`
- ✅ `hours` = 2.0 (arrondi à 15 min : 120 min = 2h)

---

### Scénario 17 : Overtime avec Seuil Minimum Non Atteint

**Objectif** : Vérifier que les heures sup < seuil minimum ne créent pas d'overtime

**Prérequis** :
- `overtimeMinimumThreshold` = 30 min
- Pointage avec `overtimeMinutes` = 15 min

**Étapes** :
1. Créer un pointage avec 15 min d'heures sup

**Résultats Attendus** :
- ✅ Pointage créé avec `overtimeMinutes` = 15
- ⚠️ Overtime non créé (15 < 30 min)
- ✅ Message log : "Heures sup inférieures au seuil minimum"

---

### Scénario 18 : Overtime avec Arrondi

**Objectif** : Vérifier l'arrondi des heures sup

**Prérequis** :
- `overtimeRounding` = 15 min
- Pointage avec `overtimeMinutes` = 47 min

**Étapes** :
1. Créer un pointage avec 47 min d'heures sup

**Résultats Attendus** :
- ✅ Overtime créé avec `hours` = 0.75 (45 min arrondi)

---

### Scénario 19 : Cumul Mensuel et Hebdomadaire

**Objectif** : Vérifier le calcul des cumuls

**Prérequis** :
- Employé : EMP001 (plafond 20h/mois, 5h/semaine)

**Étapes** :
1. Créer plusieurs overtimes sur le mois et la semaine
2. Vérifier les cumuls

**Requête HTTP** :

```bash
GET http://localhost:3001/overtime/balance/{EMP001_ID}
Authorization: Bearer {token}
```

**Résultats Attendus** :
- ✅ Retourne les cumuls mensuels et hebdomadaires
- ✅ Calcul correct des heures approuvées

---

### Scénario 20 : Overtime avec Type NIGHT

**Objectif** : Vérifier la création d'overtime de nuit

**Prérequis** :
- Employé : EMP004 (shift nuit)

**Étapes** :
1. Créer un overtime avec type `NIGHT`

**Résultats Attendus** :
- ✅ Overtime créé avec `type = NIGHT`
- ✅ `rate` = `nightShiftRate` (1.5 par défaut)

---

## 🚀 Guide d'Exécution

Voir le fichier `GUIDE_EXECUTION_TESTS.md` pour les instructions détaillées.

