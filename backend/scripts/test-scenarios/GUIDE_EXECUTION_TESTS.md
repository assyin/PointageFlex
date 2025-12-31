# 🚀 Guide d'Exécution des Tests - Step by Step

## 📋 Vue d'Ensemble

Ce guide vous accompagne étape par étape pour exécuter tous les scénarios de test des pointages et heures supplémentaires.

---

## 🔧 Étape 1 : Préparation de l'Environnement

### 1.1 Vérifier les Prérequis

- ✅ Node.js installé (v18+)
- ✅ Base de données PostgreSQL accessible
- ✅ Variables d'environnement configurées (`.env`)
- ✅ Backend compilé et prêt

### 1.2 Installer les Dépendances

```bash
cd backend
npm install
```

### 1.3 Générer le Client Prisma

```bash
npx prisma generate
```

### 1.4 Appliquer les Migrations

```bash
# Résoudre la migration échouée si nécessaire
npx prisma migrate resolve --applied 20250117000000_add_require_break_punch

# Appliquer les migrations
npx prisma migrate deploy
```

---

## 🎯 Étape 2 : Préparer les Données de Test

### 2.1 Exécuter le Script de Préparation

```bash
cd backend
npx ts-node scripts/test-scenarios/prepare-test-data.ts
```

**Résultat Attendu** :
```
🚀 Préparation des données de test...

📝 1. Configuration du tenant...
✅ Tenant créé: Test Company (xxx-xxx-xxx)

⚙️  2. Configuration des paramètres du tenant...
✅ Paramètres créés

🕐 3. Création des shifts...
✅ Shift créé: Matin (08:00 - 17:00)
✅ Shift créé: Soir (14:00 - 22:00)
✅ Shift créé: Nuit (21:00 - 06:00)

👤 4. Création de l'utilisateur admin de test...
✅ Utilisateur admin créé: admin@test.com

👥 5. Création des employés de test...
✅ Employé créé: EMP001 - Jean Normal (HS: Oui)
✅ Employé créé: EMP002 - Marie Limite (HS: Oui)
✅ Employé créé: EMP003 - Pierre NonEligible (HS: Non)
✅ Employé créé: EMP004 - Sophie Nuit (HS: Oui)
✅ Employé créé: EMP005 - Paul MultiShift (HS: Oui)

============================================================
✅ Préparation terminée avec succès !

📋 Résumé :
   - Tenant: Test Company (xxx-xxx-xxx)
   - Settings: Configurés
   - Shifts: 3 créés
   - Employés: 5 créés
   - Admin: admin@test.com / Test123!

📝 IDs des employés de test :
   - EMP001: xxx-xxx-xxx
   - EMP002: xxx-xxx-xxx
   - EMP003: xxx-xxx-xxx
   - EMP004: xxx-xxx-xxx
   - EMP005: xxx-xxx-xxx

🔑 Identifiants de connexion :
   Email: admin@test.com
   Password: Test123!
   Tenant ID: xxx-xxx-xxx
============================================================
```

### 2.2 Noter les IDs Importants

**⚠️ IMPORTANT** : Notez les IDs retournés, vous en aurez besoin pour les tests :

- Tenant ID : `xxx-xxx-xxx`
- Employee IDs :
  - EMP001 : `xxx-xxx-xxx`
  - EMP002 : `xxx-xxx-xxx`
  - EMP003 : `xxx-xxx-xxx`
  - EMP004 : `xxx-xxx-xxx`
  - EMP005 : `xxx-xxx-xxx`

---

## 🔐 Étape 3 : Obtenir un Token d'Authentification

### 3.1 Se Connecter

```bash
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "Test123!",
  "tenantId": "{TENANT_ID}"
}
```

**Réponse** :
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### 3.2 Sauvegarder le Token

Copiez le `access_token` pour l'utiliser dans les requêtes suivantes.

---

## 📝 Étape 4 : Exécuter les Scénarios de Test - Pointages

### Scénario 1 : Pointage Normal

**Objectif** : Pointage standard IN/OUT avec pause

**Requêtes** :

```bash
# 1. Pointage IN
POST http://localhost:3001/attendance
Authorization: Bearer {TOKEN}
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
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "employeeId": "{EMP001_ID}",
  "type": "BREAK_START",
  "timestamp": "2025-01-20T12:00:00Z",
  "method": "MANUAL"
}

# 3. Pointage BREAK_END
POST http://localhost:3001/attendance
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "employeeId": "{EMP001_ID}",
  "type": "BREAK_END",
  "timestamp": "2025-01-20T13:00:00Z",
  "method": "MANUAL"
}

# 4. Pointage OUT
POST http://localhost:3001/attendance
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "employeeId": "{EMP001_ID}",
  "type": "EXIT",
  "timestamp": "2025-01-20T17:00:00Z",
  "method": "MANUAL"
}
```

**Vérifications** :

```bash
# Vérifier les pointages créés
GET http://localhost:3001/attendance?employeeId={EMP001_ID}&startDate=2025-01-20&endDate=2025-01-20
Authorization: Bearer {TOKEN}

# Vérifier les anomalies (devrait être vide)
GET http://localhost:3001/attendance/anomalies?employeeId={EMP001_ID}
Authorization: Bearer {TOKEN}
```

**Résultats Attendus** :
- ✅ 4 pointages créés
- ✅ Aucune anomalie
- ✅ `workedMinutes` = 480 (8h)
- ✅ `overtimeMinutes` = 0

---

### Scénario 2 : Retard à l'Entrée

```bash
# Pointage IN avec retard
POST http://localhost:3001/attendance
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "employeeId": "{EMP001_ID}",
  "type": "ENTRY",
  "timestamp": "2025-01-20T08:15:00Z",
  "method": "MANUAL"
}

# Pointage OUT
POST http://localhost:3001/attendance
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "employeeId": "{EMP001_ID}",
  "type": "EXIT",
  "timestamp": "2025-01-20T17:00:00Z",
  "method": "MANUAL"
}
```

**Vérifications** :

```bash
# Vérifier les anomalies
GET http://localhost:3001/attendance/anomalies?employeeId={EMP001_ID}&type=LATE
Authorization: Bearer {TOKEN}
```

**Résultats Attendus** :
- ⚠️ Anomalie `LATE` détectée
- ✅ `lateMinutes` = 15

---

### Scénario 3 : Départ Anticipé

```bash
# Pointage IN
POST http://localhost:3001/attendance
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "employeeId": "{EMP001_ID}",
  "type": "ENTRY",
  "timestamp": "2025-01-20T08:00:00Z",
  "method": "MANUAL"
}

# Pointage OUT anticipé
POST http://localhost:3001/attendance
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "employeeId": "{EMP001_ID}",
  "type": "EXIT",
  "timestamp": "2025-01-20T16:30:00Z",
  "method": "MANUAL"
}
```

**Résultats Attendus** :
- ⚠️ Anomalie `EARLY_LEAVE` détectée
- ✅ `earlyLeaveMinutes` = 30

---

### Scénario 4 : DOUBLE_IN

```bash
# Premier IN
POST http://localhost:3001/attendance
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "employeeId": "{EMP001_ID}",
  "type": "ENTRY",
  "timestamp": "2025-01-20T08:00:00Z",
  "method": "MANUAL"
}

# Deuxième IN (sans OUT)
POST http://localhost:3001/attendance
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "employeeId": "{EMP001_ID}",
  "type": "ENTRY",
  "timestamp": "2025-01-20T08:30:00Z",
  "method": "MANUAL"
}
```

**Résultats Attendus** :
- ⚠️ Anomalie `DOUBLE_IN` détectée
- ✅ Suggestion de correction proposée

---

### Scénario 5 : MISSING_IN

```bash
# Pointage OUT sans IN
POST http://localhost:3001/attendance
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "employeeId": "{EMP001_ID}",
  "type": "EXIT",
  "timestamp": "2025-01-20T17:00:00Z",
  "method": "MANUAL"
}
```

**Résultats Attendus** :
- ⚠️ Anomalie `MISSING_IN` détectée
- ✅ Vérification des pointages précédents

---

### Scénario 6 : MISSING_OUT

```bash
# Pointage IN
POST http://localhost:3001/attendance
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "employeeId": "{EMP001_ID}",
  "type": "ENTRY",
  "timestamp": "2025-01-20T08:00:00Z",
  "method": "MANUAL"
}

# Attendre la fin du shift (17:00)
# Le job batch détectera automatiquement le MISSING_OUT
```

**Vérifications** (après 17:00) :

```bash
GET http://localhost:3001/attendance/anomalies?employeeId={EMP001_ID}&type=MISSING_OUT
Authorization: Bearer {TOKEN}
```

**Résultats Attendus** :
- ⚠️ Anomalie `MISSING_OUT` détectée après 17:00

---

### Scénario 7 : Pointage avec Heures Supplémentaires

```bash
# Pointage IN
POST http://localhost:3001/attendance
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "employeeId": "{EMP001_ID}",
  "type": "ENTRY",
  "timestamp": "2025-01-20T08:00:00Z",
  "method": "MANUAL"
}

# Pointage OUT avec 2h de retard
POST http://localhost:3001/attendance
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "employeeId": "{EMP001_ID}",
  "type": "EXIT",
  "timestamp": "2025-01-20T19:00:00Z",
  "method": "MANUAL"
}
```

**Vérifications** :

```bash
# Vérifier le pointage
GET http://localhost:3001/attendance?employeeId={EMP001_ID}&startDate=2025-01-20&endDate=2025-01-20
Authorization: Bearer {TOKEN}

# Vérifier l'overtime créé (après job batch)
GET http://localhost:3001/overtime?employeeId={EMP001_ID}&startDate=2025-01-20&endDate=2025-01-20
Authorization: Bearer {TOKEN}
```

**Résultats Attendus** :
- ✅ `overtimeMinutes` = 120 (2h)
- ✅ Overtime créé automatiquement (après job batch)

---

## 💰 Étape 5 : Exécuter les Scénarios de Test - Heures Supplémentaires

### Scénario 11 : Création Manuelle d'Overtime

```bash
POST http://localhost:3001/overtime
Authorization: Bearer {TOKEN}
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
- ✅ Vérification des plafonds : OK

---

### Scénario 12 : Plafond Mensuel Atteint

**Prérequis** : Créer d'abord 10h d'overtime pour EMP002 ce mois

```bash
# Tenter de créer un overtime supplémentaire
POST http://localhost:3001/overtime
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "employeeId": "{EMP002_ID}",
  "date": "2025-01-20",
  "hours": 1,
  "type": "STANDARD"
}
```

**Résultats Attendus** :
- ❌ Erreur : "Plafond mensuel atteint"

---

### Scénario 13 : Plafond Hebdomadaire Atteint

**Prérequis** : Créer d'abord 3h d'overtime pour EMP002 cette semaine

```bash
POST http://localhost:3001/overtime
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "employeeId": "{EMP002_ID}",
  "date": "2025-01-20",
  "hours": 0.5,
  "type": "STANDARD"
}
```

**Résultats Attendus** :
- ❌ Erreur : "Plafond hebdomadaire atteint"

---

### Scénario 15 : Employé Non Éligible

```bash
POST http://localhost:3001/overtime
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "employeeId": "{EMP003_ID}",
  "date": "2025-01-20",
  "hours": 1,
  "type": "STANDARD"
}
```

**Résultats Attendus** :
- ❌ Erreur : "L'employé n'est pas éligible aux heures supplémentaires"

---

### Scénario 19 : Cumul Mensuel et Hebdomadaire

```bash
GET http://localhost:3001/overtime/balance/{EMP001_ID}
Authorization: Bearer {TOKEN}
```

**Résultats Attendus** :
```json
{
  "employeeId": "...",
  "totalRequested": 5.5,
  "totalApproved": 5.0,
  "totalPending": 0.5,
  "monthlyTotal": 3.0,
  "weeklyTotal": 2.0,
  ...
}
```

---

## 🧹 Étape 6 : Nettoyage (Optionnel)

Si vous voulez réinitialiser les données de test :

```bash
# Supprimer les pointages de test
DELETE http://localhost:3001/attendance?employeeId={EMP001_ID}&startDate=2025-01-20&endDate=2025-01-20
Authorization: Bearer {TOKEN}

# Supprimer les overtimes de test
DELETE http://localhost:3001/overtime?employeeId={EMP001_ID}
Authorization: Bearer {TOKEN}
```

---

## 📊 Étape 7 : Vérification des Résultats

### 7.1 Vérifier les Statistiques

```bash
GET http://localhost:3001/attendance/stats?employeeId={EMP001_ID}&startDate=2025-01-20&endDate=2025-01-20
Authorization: Bearer {TOKEN}
```

### 7.2 Vérifier les Anomalies

```bash
GET http://localhost:3001/attendance/anomalies?employeeId={EMP001_ID}
Authorization: Bearer {TOKEN}
```

### 7.3 Vérifier les Analytics

```bash
GET http://localhost:3001/attendance/analytics/anomalies?startDate=2025-01-20&endDate=2025-01-20
Authorization: Bearer {TOKEN}
```

---

## ✅ Checklist de Validation

- [ ] Tous les scénarios de pointage exécutés
- [ ] Tous les scénarios d'heures sup exécutés
- [ ] Anomalies détectées correctement
- [ ] Heures sup calculées correctement
- [ ] Plafonds respectés
- [ ] Job batch fonctionne
- [ ] Analytics disponibles

---

## 🐛 Dépannage

### Problème : Token expiré
**Solution** : Se reconnecter et obtenir un nouveau token

### Problème : Employé non trouvé
**Solution** : Vérifier que le script de préparation a bien créé les employés

### Problème : Overtime non créé automatiquement
**Solution** : Vérifier que le job batch est actif et que `overtimeMinutes` >= `overtimeMinimumThreshold`

### Problème : Erreurs de migration
**Solution** : Voir `backend/scripts/resolve-failed-migration.md`

---

## 📚 Ressources

- [Scénarios de Test Complets](./SCENARIOS_TEST_COMPLETS.md)
- [Script de Préparation](./prepare-test-data.ts)
- [Documentation API](http://localhost:3001/api)

