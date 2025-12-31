# 🧪 Guide Complet de Tests - Pointages et Heures Supplémentaires

## 📚 Documentation

Ce dossier contient tous les fichiers nécessaires pour tester complètement le système de pointages et d'heures supplémentaires.

### 📄 Fichiers Disponibles

1. **SCENARIOS_TEST_COMPLETS.md** : Tous les scénarios de test détaillés
2. **GUIDE_EXECUTION_TESTS.md** : Guide step-by-step pour exécuter les tests via HTTP
3. **GUIDE_TEST_FRONTEND.md** : Guide complet pour tester via l'interface frontend
4. **prepare-test-data.ts** : Script pour préparer les données de test
5. **cleanup-test-data.ts** : Script pour nettoyer les données de test
6. **run-test-scenarios.sh** : Script bash pour exécution automatique (Linux/Mac)
7. **run-test-scenarios.ps1** : Script PowerShell pour exécution automatique (Windows)

---

## 🚀 Démarrage Rapide

### Étape 1 : Préparer les Données

```bash
cd backend
npx ts-node scripts/test-scenarios/prepare-test-data.ts
```

**Résultat** : Crée automatiquement :
- ✅ Tenant de test
- ✅ Paramètres du tenant (TenantSettings)
- ✅ 3 shifts (Matin, Soir, Nuit)
- ✅ 5 employés de test avec différentes configurations
- ✅ Utilisateur admin de test

**Identifiants** :
- Email : `admin@test.com`
- Password : `Test123!`
- Tenant ID : (affiché dans la console)

---

### Étape 2 : Obtenir un Token

```bash
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "Test123!",
  "tenantId": "{TENANT_ID}"
}
```

---

### Étape 3 : Exécuter les Tests

#### Option A : Tests via Interface Frontend (Recommandé pour tests visuels)

Suivez le guide complet : **[GUIDE_TEST_FRONTEND.md](./GUIDE_TEST_FRONTEND.md)**

**Avantages** :
- ✅ Interface visuelle intuitive
- ✅ Vérification immédiate des résultats
- ✅ Pas besoin de connaître les APIs HTTP
- ✅ Tests plus réalistes (comme un utilisateur réel)

#### Option B : Tests via Requêtes HTTP

Suivez le guide détaillé : **[GUIDE_EXECUTION_TESTS.md](./GUIDE_EXECUTION_TESTS.md)**

**Avantages** :
- ✅ Tests automatisables
- ✅ Intégration CI/CD possible
- ✅ Tests de performance

#### Option C : Tests Automatiques (Scripts)

**Linux/Mac** :
```bash
cd backend/scripts/test-scenarios
chmod +x run-test-scenarios.sh
./run-test-scenarios.sh
```

**Windows** :
```powershell
cd backend/scripts/test-scenarios
.\run-test-scenarios.ps1
```

---

## 📋 Scénarios de Test Disponibles

### Pointages (10 scénarios)

1. ✅ Pointage Normal (IN/OUT avec pause)
2. ⏰ Retard à l'Entrée
3. 🏃 Départ Anticipé
4. 🔄 DOUBLE_IN (Double Entrée)
5. ❌ MISSING_IN (Sortie sans Entrée)
6. ⚠️ MISSING_OUT (Entrée sans Sortie)
7. 💰 Pointage avec Heures Supplémentaires
8. 🍽️ Pointage avec Pause Non Pointée
9. 🍽️ Pointage avec Pause Pointée
10. 🌙 Pointage Nuit avec Heures Sup

### Heures Supplémentaires (10 scénarios)

11. ✅ Création Manuelle d'Overtime
12. 🚫 Overtime avec Plafond Mensuel Atteint
13. 🚫 Overtime avec Plafond Hebdomadaire Atteint
14. ⚠️ Overtime avec Ajustement Partiel
15. ❌ Overtime pour Employé Non Éligible
16. 🤖 Création Automatique d'Overtime (Job Batch)
17. 📊 Overtime avec Seuil Minimum Non Atteint
18. 🔢 Overtime avec Arrondi
19. 📈 Cumul Mensuel et Hebdomadaire
20. 🌙 Overtime avec Type NIGHT

---

## 👥 Employés de Test

| Matricule | Nom | Éligible HS | Plafond Mensuel | Plafond Hebdo | Shift |
|-----------|-----|-------------|-----------------|---------------|-------|
| EMP001 | Jean Normal | ✅ Oui | 20h | 5h | Matin |
| EMP002 | Marie Limite | ✅ Oui | 10h | 3h | Matin |
| EMP003 | Pierre NonEligible | ❌ Non | - | - | Matin |
| EMP004 | Sophie Nuit | ✅ Oui | 30h | 8h | Nuit |
| EMP005 | Paul MultiShift | ✅ Oui | 25h | 6h | Matin |

---

## ⚙️ Configuration TenantSettings

Les paramètres suivants sont configurés automatiquement :

```typescript
{
  breakDuration: 60,                    // 60 minutes
  requireBreakPunch: false,            // Pointage pause optionnel
  overtimeMinimumThreshold: 30,         // 30 minutes
  overtimeRounding: 15,                // Arrondi à 15 min
  lateToleranceEntry: 10,              // 10 minutes
  earlyToleranceExit: 5,               // 5 minutes
  dailyWorkingHours: 8,                // 8 heures
  workDaysPerWeek: 6,                   // 6 jours
  maxWeeklyHours: 48,                   // 48 heures
}
```

---

## 🧹 Nettoyage

Pour supprimer les données de test :

```bash
cd backend
npx ts-node scripts/test-scenarios/cleanup-test-data.ts
```

---

## 📖 Documentation Complète

- **[Scénarios Détaillés](./SCENARIOS_TEST_COMPLETS.md)** : Tous les scénarios avec requêtes HTTP
- **[Guide d'Exécution HTTP](./GUIDE_EXECUTION_TESTS.md)** : Instructions step-by-step pour tests HTTP
- **[Guide Test Frontend](./GUIDE_TEST_FRONTEND.md)** : Instructions complètes pour tester via l'interface utilisateur

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

## ✅ Checklist de Validation

Après avoir exécuté tous les tests, vérifiez :

- [ ] Tous les scénarios de pointage exécutés
- [ ] Tous les scénarios d'heures sup exécutés
- [ ] Anomalies détectées correctement
- [ ] Heures sup calculées correctement
- [ ] Plafonds respectés
- [ ] Job batch fonctionne
- [ ] Analytics disponibles

---

## 📞 Support

Pour toute question ou problème, consultez :
- La documentation API : `http://localhost:3001/api`
- Les logs du backend
- Les fichiers de documentation dans ce dossier

