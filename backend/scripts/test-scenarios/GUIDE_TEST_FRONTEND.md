# 🖥️ Guide de Test Frontend - Pointages et Heures Supplémentaires

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Connexion et Navigation](#connexion-et-navigation)
3. [Scénarios de Test - Pointages](#scénarios-de-test---pointages)
4. [Scénarios de Test - Heures Supplémentaires](#scénarios-de-test---heures-supplémentaires)
5. [Vérification des Résultats](#vérification-des-résultats)

---

## 🔧 Prérequis

### 1. Préparer les Données de Test

**Important** : Si c'est la première fois que vous utilisez le système RBAC, vous devez d'abord initialiser les permissions :

```bash
cd backend
npx ts-node scripts/init-rbac.ts
```

Ensuite, exécutez le script de préparation :

```bash
npx ts-node scripts/test-scenarios/prepare-test-data.ts
```

**Résultat attendu** :
- ✅ Tenant créé : Test Company
- ✅ 3 shifts créés (Matin, Soir, Nuit)
- ✅ 5 employés créés (EMP001 à EMP005)
- ✅ Rôles RBAC créés (ADMIN_RH, MANAGER, EMPLOYEE)
- ✅ Permissions assignées au rôle ADMIN_RH
- ✅ Utilisateur admin : `admin@test.com` / `Test123!`
- ✅ Rôle ADMIN_RH assigné automatiquement via RBAC
- ✅ Tenant ID affiché (à noter)

### 2. Démarrer le Frontend

```bash
cd frontend
npm run dev
```

Le frontend sera accessible sur : `http://localhost:3000`

---

## 🔐 Connexion et Navigation

### Étape 1 : Se Connecter

1. Ouvrir `http://localhost:3000`
2. Entrer les identifiants :
   - **Email** : `admin@test.com`
   - **Password** : `Test123!`
   - **Tenant ID** : (copier depuis le script de préparation)
3. Cliquer sur **"Se connecter"**

**Note** : Le script de préparation assigne automatiquement le rôle **ADMIN_RH** à l'utilisateur via le système RBAC. Si vous rencontrez des problèmes de permissions après la connexion, vérifiez que le rôle a bien été assigné (voir section Dépannage ci-dessous).

### Étape 2 : Naviguer vers les Pages de Test

**Pour les Pointages** :
- Menu latéral → **"Pointages"** ou `/attendance`

**Pour les Heures Supplémentaires** :
- Menu latéral → **"Heures Supplémentaires"** ou `/overtime`

---

## 📝 Scénarios de Test - Pointages

### Scénario 1 : Pointage Normal (IN/OUT avec Pause)

**Objectif** : Vérifier un pointage standard sans anomalies

**Prérequis** :
- Employé : EMP001 (Jean Normal)
- Shift : Matin (08:00-17:00)
- Date : Aujourd'hui

**Étapes dans le Frontend** :

1. **Aller sur la page Pointages** (`/attendance`)

2. **Créer le pointage IN** :
   - Cliquer sur le bouton **"Nouveau pointage"** (icône ➕)
   - Dans le modal :
     - **Employé** : Rechercher et sélectionner "Jean Normal (EMP001)"
     - **Type** : Sélectionner "Entrée"
     - **Date & Heure** : Aujourd'hui à `08:00` (ex: `2025-01-20T08:00`)
     - **Site** : (optionnel)
     - **Notes** : (optionnel)
   - Cliquer sur **"Créer"**

3. **Créer le pointage BREAK_START** :
   - Cliquer sur **"Nouveau pointage"**
   - **Employé** : "Jean Normal (EMP001)"
   - **Type** : "Début pause"
   - **Date & Heure** : Aujourd'hui à `12:00`
   - Cliquer sur **"Créer"**

4. **Créer le pointage BREAK_END** :
   - Cliquer sur **"Nouveau pointage"**
   - **Employé** : "Jean Normal (EMP001)"
   - **Type** : "Fin pause"
   - **Date & Heure** : Aujourd'hui à `13:00`
   - Cliquer sur **"Créer"**

5. **Créer le pointage OUT** :
   - Cliquer sur **"Nouveau pointage"**
   - **Employé** : "Jean Normal (EMP001)"
   - **Type** : "Sortie"
   - **Date & Heure** : Aujourd'hui à `17:00`
   - Cliquer sur **"Créer"**

**Vérifications** :
- ✅ Les 4 pointages apparaissent dans le tableau
- ✅ Aucun badge d'anomalie visible
- ✅ Statut "Valide" pour tous les pointages
- ✅ Dans les statistiques : Total = 4 pointages

---

### Scénario 2 : Retard à l'Entrée

**Objectif** : Vérifier la détection d'un retard

**Étapes dans le Frontend** :

1. **Créer un pointage IN en retard** :
   - **Nouveau pointage** → EMP001
   - **Type** : "Entrée"
   - **Date & Heure** : Aujourd'hui à `08:15` (15 min de retard)
   - **Créer**

2. **Créer le pointage OUT** :
   - **Nouveau pointage** → EMP001
   - **Type** : "Sortie"
   - **Date & Heure** : Aujourd'hui à `17:00`
   - **Créer**

**Vérifications** :
- ⚠️ Badge d'anomalie visible sur le pointage IN (icône ⚠️)
- ⚠️ Type d'anomalie : "LATE" ou "Retard"
- ✅ Dans le tableau, colonne "Anomalies" affiche le retard
- ✅ Filtrer par "Anomalies uniquement" pour voir le pointage

---

### Scénario 3 : Départ Anticipé

**Objectif** : Vérifier la détection d'un départ anticipé

**Étapes dans le Frontend** :

1. **Créer un pointage IN** :
   - EMP001, Type "Entrée", Heure `08:00`

2. **Créer un pointage OUT anticipé** :
   - EMP001, Type "Sortie", Heure `16:30` (30 min avant la fin)

**Vérifications** :
- ⚠️ Badge d'anomalie sur le pointage OUT
- ⚠️ Type d'anomalie : "EARLY_LEAVE" ou "Départ anticipé"
- ✅ Minutes de départ anticipé affichées : 30 min

---

### Scénario 4 : DOUBLE_IN (Double Entrée)

**Objectif** : Vérifier la détection d'un DOUBLE_IN

**Étapes dans le Frontend** :

1. **Créer le premier pointage IN** :
   - EMP001, Type "Entrée", Heure `08:00`

2. **Créer un deuxième pointage IN** (sans OUT entre les deux) :
   - EMP001, Type "Entrée", Heure `08:30`

**Vérifications** :
- ⚠️ Badge d'anomalie sur le deuxième pointage IN
- ⚠️ Type d'anomalie : "DOUBLE_IN" ou "Double entrée"
- ✅ Suggestion de correction proposée (si disponible dans l'interface)

---

### Scénario 5 : MISSING_IN (Sortie sans Entrée)

**Objectif** : Vérifier la détection d'un MISSING_IN

**Étapes dans le Frontend** :

1. **Créer un pointage OUT sans IN préalable** :
   - EMP001, Type "Sortie", Heure `17:00` (sans avoir créé d'IN aujourd'hui)

**Vérifications** :
- ⚠️ Badge d'anomalie sur le pointage OUT
- ⚠️ Type d'anomalie : "MISSING_IN" ou "Entrée manquante"
- ✅ Vérification des pointages précédents (hier) si applicable

---

### Scénario 6 : MISSING_OUT (Entrée sans Sortie)

**Objectif** : Vérifier la détection d'un MISSING_OUT

**Note** : Ce scénario est généralement détecté automatiquement par un job batch après la fin du shift. Pour tester manuellement :

**Étapes dans le Frontend** :

1. **Créer un pointage IN** :
   - EMP001, Type "Entrée", Heure `08:00`

2. **Attendre ou simuler la fin du shift** (17:00)
   - Le job batch détectera automatiquement le MISSING_OUT
   - Ou vérifier dans les anomalies après 17:00

**Vérifications** :
- ⚠️ Après 17:00, une anomalie MISSING_OUT devrait apparaître
- ⚠️ Filtrer par type d'anomalie "MISSING_OUT" pour voir

---

### Scénario 7 : Pointage avec Heures Supplémentaires

**Objectif** : Vérifier le calcul des heures sup

**Étapes dans le Frontend** :

1. **Créer un pointage IN** :
   - EMP001, Type "Entrée", Heure `08:00`

2. **Créer un pointage OUT avec heures sup** :
   - EMP001, Type "Sortie", Heure `19:00` (2h après la fin du shift à 17:00)

**Vérifications** :
- ✅ Pointage créé avec succès
- ✅ Heures travaillées : 11h (ou 10h selon calcul)
- ✅ Heures supplémentaires : 2h (affichées dans le pointage si disponible)
- ✅ Aller sur la page **Heures Supplémentaires** pour vérifier qu'un overtime a été créé automatiquement (après job batch)

---

### Scénario 8 : Pointage avec Pause Non Pointée

**Objectif** : Vérifier le calcul avec pause automatique

**Prérequis** : `requireBreakPunch = false` dans TenantSettings

**Étapes dans le Frontend** :

1. **Créer un pointage IN** :
   - EMP001, Type "Entrée", Heure `08:00`

2. **Créer un pointage OUT** :
   - EMP001, Type "Sortie", Heure `17:00`
   - **Ne pas créer de pointages BREAK_START/BREAK_END**

**Vérifications** :
- ✅ Pointages créés
- ✅ Pause de 60 min automatiquement déduite (selon TenantSettings)
- ✅ Heures travaillées : 8h (9h - 1h pause)

---

### Scénario 9 : Pointage avec Pause Pointée

**Objectif** : Vérifier le calcul avec pause pointée

**Prérequis** : `requireBreakPunch = true` dans TenantSettings

**Étapes dans le Frontend** :

1. **Créer les 4 pointages** :
   - IN : `08:00`
   - BREAK_START : `12:00`
   - BREAK_END : `13:30` (pause de 1h30)
   - OUT : `17:00`

**Vérifications** :
- ✅ Pause réelle : 1h30 (90 min)
- ✅ Heures travaillées : 7h30 (8h30 - 1h30 pause)

---

### Scénario 10 : Pointage Nuit avec Heures Sup

**Objectif** : Vérifier le calcul pour shift de nuit

**Étapes dans le Frontend** :

1. **Créer un pointage IN de nuit** :
   - **Employé** : EMP004 (Sophie Nuit)
   - **Type** : "Entrée"
   - **Date & Heure** : Aujourd'hui à `21:00`

2. **Créer un pointage OUT avec heures sup** :
   - EMP004, Type "Sortie"
   - **Date & Heure** : Demain à `07:00` (1h après la fin du shift à 06:00)

**Vérifications** :
- ✅ Pointage créé
- ✅ Heures supplémentaires : 1h
- ✅ Vérifier dans **Heures Supplémentaires** qu'un overtime de type "NIGHT" a été créé

---

## 💰 Scénarios de Test - Heures Supplémentaires

### Scénario 11 : Création Manuelle d'Overtime

**Objectif** : Vérifier la création manuelle d'heures sup

**Étapes dans le Frontend** :

1. **Aller sur la page Heures Supplémentaires** (`/overtime`)

2. **Créer une nouvelle demande** :
   - Cliquer sur **"Nouvelle demande"** (bouton ➕)
   - Dans le modal :
     - **Employé** : Rechercher et sélectionner "Jean Normal (EMP001)"
     - **Date** : Aujourd'hui (ex: `2025-01-20`)
     - **Heures** : `2.5`
     - **Type** : "Standard"
     - **Notes** : "Test manuel"
   - Cliquer sur **"Créer"**

**Vérifications** :
- ✅ Overtime créé avec statut "En attente" (PENDING)
- ✅ Apparaît dans le tableau avec badge "En attente"
- ✅ Heures : 2.5h
- ✅ Vérification des plafonds : OK (2.5h < 5h/semaine et < 20h/mois)

---

### Scénario 12 : Overtime avec Plafond Mensuel Atteint

**Objectif** : Vérifier le rejet si plafond mensuel atteint

**Prérequis** :
- EMP002 (Marie Limite, plafond 10h/mois)
- Créer d'abord 10h d'overtime approuvées ce mois pour EMP002

**Étapes dans le Frontend** :

1. **Créer plusieurs overtimes pour atteindre le plafond** :
   - EMP002, 5h, Date : début du mois
   - EMP002, 5h, Date : milieu du mois
   - (Les approuver si nécessaire)

2. **Tenter de créer un overtime supplémentaire** :
   - **Nouvelle demande**
   - **Employé** : "Marie Limite (EMP002)"
   - **Heures** : `1`
   - **Créer**

**Vérifications** :
- ❌ Message d'erreur : "Plafond mensuel atteint (10h/10h)"
- ❌ Overtime non créé
- ⚠️ Alerte affichée dans l'interface

---

### Scénario 13 : Overtime avec Plafond Hebdomadaire Atteint

**Objectif** : Vérifier le rejet si plafond hebdomadaire atteint

**Prérequis** :
- EMP002 (plafond 3h/semaine)
- Créer d'abord 3h d'overtime approuvées cette semaine

**Étapes dans le Frontend** :

1. **Créer 3h d'overtime cette semaine** :
   - EMP002, 3h, Date : cette semaine
   - (Les approuver)

2. **Tenter de créer un overtime supplémentaire** :
   - EMP002, 0.5h, Date : cette semaine

**Vérifications** :
- ❌ Message d'erreur : "Plafond hebdomadaire atteint (3h/3h)"
- ❌ Overtime non créé

---

### Scénario 14 : Overtime avec Ajustement Partiel

**Objectif** : Vérifier l'ajustement si plafond partiellement atteint

**Prérequis** :
- EMP002 (plafond 3h/semaine)
- 2.5h déjà approuvées cette semaine

**Étapes dans le Frontend** :

1. **Tenter de créer 1h d'overtime** :
   - EMP002, 1h, Date : cette semaine

**Vérifications** :
- ⚠️ Avertissement : "Plafond partiel atteint"
- ✅ Overtime créé avec 0.5h seulement (3h - 2.5h = 0.5h restant)
- ⚠️ Message d'information affiché

---

### Scénario 15 : Overtime pour Employé Non Éligible

**Objectif** : Vérifier le rejet si employé non éligible

**Étapes dans le Frontend** :

1. **Tenter de créer un overtime pour EMP003** :
   - **Nouvelle demande**
   - **Employé** : "Pierre NonEligible (EMP003)"
   - **Heures** : `1`
   - **Créer**

**Vérifications** :
- ❌ Message d'erreur : "L'employé n'est pas éligible aux heures supplémentaires"
- ❌ Overtime non créé
- ⚠️ Alerte affichée

---

### Scénario 16 : Création Automatique d'Overtime (Job Batch)

**Objectif** : Vérifier la création automatique depuis les pointages

**Note** : Ce scénario nécessite que le job batch soit actif. La création automatique se fait après un pointage avec heures sup.

**Étapes dans le Frontend** :

1. **Créer un pointage avec heures sup** (voir Scénario 7) :
   - EMP001, IN à `08:00`, OUT à `19:00` (2h sup)

2. **Attendre l'exécution du job batch** (ou déclencher manuellement côté backend)

3. **Vérifier dans Heures Supplémentaires** :
   - Aller sur `/overtime`
   - Filtrer par EMP001
   - Vérifier qu'un overtime a été créé automatiquement

**Vérifications** :
- ✅ Overtime créé automatiquement
- ✅ Statut : "Approuvé" (APPROVED) si créé automatiquement
- ✅ Heures : 2.0h (arrondi à 15 min si applicable)

---

### Scénario 17 : Overtime avec Seuil Minimum Non Atteint

**Objectif** : Vérifier que les heures sup < seuil minimum ne créent pas d'overtime

**Prérequis** : `overtimeMinimumThreshold = 30 min`

**Étapes dans le Frontend** :

1. **Créer un pointage avec 15 min d'heures sup** :
   - EMP001, IN à `08:00`, OUT à `17:15` (15 min sup)

2. **Vérifier dans Heures Supplémentaires** :
   - Aucun overtime ne devrait être créé automatiquement

**Vérifications** :
- ✅ Pointage créé avec heures sup = 15 min
- ⚠️ Aucun overtime créé (15 < 30 min seuil minimum)

---

### Scénario 18 : Overtime avec Arrondi

**Objectif** : Vérifier l'arrondi des heures sup

**Prérequis** : `overtimeRounding = 15 min`

**Étapes dans le Frontend** :

1. **Créer un pointage avec 47 min d'heures sup** :
   - EMP001, IN à `08:00`, OUT à `17:47` (47 min sup)

2. **Vérifier l'overtime créé automatiquement** :
   - Aller sur `/overtime`
   - Filtrer par EMP001

**Vérifications** :
- ✅ Overtime créé avec heures = 0.75h (45 min arrondi à 15 min)

---

### Scénario 19 : Cumul Mensuel et Hebdomadaire

**Objectif** : Vérifier le calcul des cumuls

**Étapes dans le Frontend** :

1. **Créer plusieurs overtimes pour EMP001** :
   - 2h, Date : début du mois
   - 1.5h, Date : milieu du mois
   - 1h, Date : cette semaine
   - (Les approuver si nécessaire)

2. **Vérifier les cumuls** :
   - Aller sur `/overtime`
   - Filtrer par EMP001
   - Vérifier les statistiques affichées (si disponibles)
   - Ou consulter le profil de l'employé (si disponible)

**Vérifications** :
- ✅ Cumul mensuel : 4.5h (2h + 1.5h + 1h)
- ✅ Cumul hebdomadaire : 1h (ou selon la semaine)
- ✅ Plafonds respectés : 4.5h < 20h/mois, 1h < 5h/semaine

---

### Scénario 20 : Overtime avec Type NIGHT

**Objectif** : Vérifier la création d'overtime de nuit

**Étapes dans le Frontend** :

1. **Créer un overtime de nuit** :
   - **Nouvelle demande**
   - **Employé** : "Sophie Nuit (EMP004)"
   - **Date** : Aujourd'hui
   - **Heures** : `2`
   - **Type** : "Nuit"
   - **Créer**

**Vérifications** :
- ✅ Overtime créé avec type "Nuit"
- ✅ Badge "Nuit" visible dans le tableau
- ✅ Taux appliqué : 1.5x (selon TenantSettings)

---

## ✅ Vérification des Résultats

### Page Pointages (`/attendance`)

**Filtres disponibles** :
- ✅ Recherche par nom/prénom/matricule
- ✅ Filtre par date (début/fin)
- ✅ Filtre par employé
- ✅ Filtre par site/département
- ✅ Filtre par type de pointage
- ✅ Filtre par type d'anomalie
- ✅ Filtre "Anomalies uniquement"

**Statistiques** :
- ✅ Total pointages
- ✅ Entrées / Sorties
- ✅ Nombre d'anomalies

**Actions** :
- ✅ Créer un pointage manuel
- ✅ Corriger un pointage (si anomalie)
- ✅ Exporter les données

### Page Heures Supplémentaires (`/overtime`)

**Filtres disponibles** :
- ✅ Recherche par nom/prénom/matricule
- ✅ Filtre par statut (En attente, Approuvé, Rejeté, etc.)
- ✅ Filtre par employé
- ✅ Filtre par type (Standard, Nuit, etc.)
- ✅ Filtre par date

**Actions** :
- ✅ Créer une nouvelle demande
- ✅ Approuver un overtime
- ✅ Rejeter un overtime
- ✅ Convertir en récupération
- ✅ Exporter les données

**Statistiques** :
- ✅ Total demandé
- ✅ Total approuvé
- ✅ En attente
- ✅ Cumuls mensuels/hebdomadaires (si disponibles)

---

## 🐛 Dépannage

### Problème : Les pointages ne s'affichent pas
**Solution** :
- Vérifier les filtres de date (par défaut : aujourd'hui)
- Actualiser la page (bouton 🔄)
- Vérifier la connexion au backend

### Problème : Les anomalies ne sont pas détectées
**Solution** :
- Vérifier que les pointages respectent les règles (retard > tolérance, etc.)
- Vérifier les paramètres du tenant (TenantSettings)
- Attendre quelques secondes pour le traitement

### Problème : Les overtimes ne sont pas créés automatiquement
**Solution** :
- Vérifier que le job batch est actif côté backend
- Vérifier que `overtimeMinutes` >= `overtimeMinimumThreshold`
- Vérifier que l'employé est éligible

### Problème : Erreur lors de la création
**Solution** :
- Vérifier que tous les champs obligatoires sont remplis
- Vérifier les plafonds (mensuel/hebdomadaire)
- Vérifier l'éligibilité de l'employé
- Consulter la console du navigateur pour les erreurs détaillées

### Problème : Permissions insuffisantes après connexion
**Solution** : Vérifier que les permissions RBAC sont initialisées et que le rôle a les permissions nécessaires.

**Option 1 : Initialiser le RBAC (si première fois)**
```bash
cd backend
npx ts-node scripts/init-rbac.ts
```
Ce script crée toutes les permissions et les assigne aux rôles par défaut.

**Option 2 : Relancer le script de préparation**
```bash
cd backend
npx ts-node scripts/test-scenarios/prepare-test-data.ts
```
Le script assigne automatiquement le rôle ADMIN_RH et ses permissions.

**Option 2 : Via Interface Frontend**
1. Se connecter avec un compte ayant les permissions d'administration
2. Aller dans **"Utilisateurs"** ou **"Gestion des Rôles"**
3. Trouver l'utilisateur `admin@test.com`
4. Assigner le rôle **ADMIN_RH** dans le tenant de test

**Option 3 : Via Script SQL Direct**
```sql
-- Trouver l'ID du rôle ADMIN_RH pour le tenant
SELECT id FROM "Role" WHERE "tenantId" = '{TENANT_ID}' AND code = 'ADMIN_RH';

-- Trouver l'ID de l'utilisateur
SELECT id FROM "User" WHERE email = 'admin@test.com' AND "tenantId" = '{TENANT_ID}';

-- Assigner le rôle (remplacer {USER_ID}, {TENANT_ID}, {ROLE_ID})
INSERT INTO "UserTenantRole" (id, "userId", "tenantId", "roleId", "isActive", "assignedAt")
VALUES (
  gen_random_uuid(),
  '{USER_ID}',
  '{TENANT_ID}',
  '{ROLE_ID}',
  true,
  NOW()
);
```

---

## 📚 Ressources

- [Guide d'Exécution HTTP](./GUIDE_EXECUTION_TESTS.md)
- [Scénarios Complets](./SCENARIOS_TEST_COMPLETS.md)
- [Script de Préparation](./prepare-test-data.ts)

---

## ✅ Checklist de Validation

### Pointages
- [ ] Scénario 1 : Pointage normal créé
- [ ] Scénario 2 : Retard détecté
- [ ] Scénario 3 : Départ anticipé détecté
- [ ] Scénario 4 : DOUBLE_IN détecté
- [ ] Scénario 5 : MISSING_IN détecté
- [ ] Scénario 6 : MISSING_OUT détecté
- [ ] Scénario 7 : Heures sup calculées
- [ ] Scénario 8 : Pause non pointée gérée
- [ ] Scénario 9 : Pause pointée gérée
- [ ] Scénario 10 : Pointage nuit avec heures sup

### Heures Supplémentaires
- [ ] Scénario 11 : Création manuelle réussie
- [ ] Scénario 12 : Plafond mensuel respecté
- [ ] Scénario 13 : Plafond hebdomadaire respecté
- [ ] Scénario 14 : Ajustement partiel fonctionne
- [ ] Scénario 15 : Employé non éligible rejeté
- [ ] Scénario 16 : Création automatique fonctionne
- [ ] Scénario 17 : Seuil minimum respecté
- [ ] Scénario 18 : Arrondi fonctionne
- [ ] Scénario 19 : Cumuls calculés correctement
- [ ] Scénario 20 : Type NIGHT créé

---

**🎉 Bon test !**

