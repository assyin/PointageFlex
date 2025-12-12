# Analyse des risques : `prisma db push`

## ⚠️ Risques identifiés par Prisma

Prisma a détecté **2 risques potentiels** :

### 1. Colonne `role` : Recréation (⚠️ RISQUE MINEUR)

**Ce qui va se passer :**
- La colonne `role` sera supprimée puis recréée avec le nouveau type `LegacyRole`
- Les valeurs seront converties : `Role` → `LegacyRole`

**Risque réel :**
- ✅ **FAIBLE** : Les valeurs de l'enum sont identiques (`SUPER_ADMIN`, `ADMIN_RH`, `MANAGER`, `EMPLOYEE`)
- ✅ Les données seront préservées lors de la conversion
- ⚠️ Si une valeur invalide existe (non présente dans LegacyRole), elle sera perdue

**Vérification avant :**
```sql
-- Vérifier les valeurs de rôle
SELECT role, COUNT(*) as count
FROM "User"
WHERE role IS NOT NULL
GROUP BY role;
```

Toutes les valeurs doivent être : `SUPER_ADMIN`, `ADMIN_RH`, `MANAGER`, ou `EMPLOYEE`.

### 2. Contrainte unique sur `email` (⚠️ RISQUE MOYEN)

**Ce qui va se passer :**
- Suppression de la contrainte unique `(tenantId, email)`
- Ajout d'une contrainte unique globale sur `email`

**Risque réel :**
- ⚠️ **MOYEN** : Si des emails en double existent, la migration **ÉCHOUERA**
- ❌ Les données ne seront **PAS perdues**, mais la migration ne se terminera pas
- ✅ Si pas de doublons, aucun problème

**Vérification obligatoire avant :**
```sql
-- Vérifier les emails en double
SELECT email, COUNT(*) as count
FROM "User"
GROUP BY email
HAVING COUNT(*) > 1;
```

Si des résultats apparaissent, **corrigez-les AVANT** de continuer.

## 📊 Évaluation globale du risque

| Aspect | Risque | Impact | Probabilité |
|--------|--------|--------|-------------|
| Perte de données utilisateurs | **FAIBLE** | Élevé | Faible |
| Perte de données rôles | **FAIBLE** | Moyen | Faible |
| Échec de migration | **MOYEN** | Faible | Moyen (si doublons) |
| Corruption de données | **TRÈS FAIBLE** | Élevé | Très faible |

## ✅ Recommandations

### AVANT d'exécuter `prisma db push` :

1. **✅ Faire un backup de la base de données**
   ```bash
   # Exemple avec pg_dump
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **✅ Vérifier les emails en double**
   ```sql
   SELECT email, COUNT(*) as count
   FROM "User"
   GROUP BY email
   HAVING COUNT(*) > 1;
   ```

3. **✅ Vérifier les valeurs de rôle**
   ```sql
   SELECT role, COUNT(*) as count
   FROM "User"
   WHERE role IS NOT NULL
   GROUP BY role;
   ```

4. **✅ Vérifier les données critiques**
   - Nombre d'utilisateurs
   - Nombre de tenants
   - Données importantes

### PENDANT l'exécution :

- Surveiller les messages d'erreur
- Si erreur, **NE PAS** continuer
- Restaurer depuis le backup si nécessaire

### APRÈS l'exécution :

1. **Vérifier l'intégrité des données**
   ```sql
   -- Vérifier le nombre d'utilisateurs
   SELECT COUNT(*) FROM "User";
   
   -- Vérifier les rôles
   SELECT role, COUNT(*) FROM "User" GROUP BY role;
   
   -- Vérifier les nouvelles tables
   SELECT COUNT(*) FROM "Role";
   SELECT COUNT(*) FROM "Permission";
   ```

2. **Tester l'application**
   - Connexion utilisateurs
   - Fonctionnalités critiques

## 🎯 Conclusion

### Risque de perte de données : **FAIBLE à MOYEN**

**Conditions pour un risque minimal :**
- ✅ Pas d'emails en double
- ✅ Toutes les valeurs de rôle sont valides
- ✅ Backup effectué

**Si ces conditions sont remplies :**
- ✅ Vous pouvez exécuter `prisma db push` en toute sécurité
- ✅ Les données seront préservées
- ✅ La migration devrait réussir

**Si des problèmes sont détectés :**
- ❌ Corrigez-les d'abord
- ❌ Ou utilisez la migration SQL manuelle pour plus de contrôle

## 🔄 Alternative plus sûre : Migration SQL manuelle

Si vous préférez plus de contrôle :

1. Utilisez `scripts/migration-rbac-manual-fixed.sql`
2. Exécutez étape par étape
3. Vérifiez après chaque étape
4. Plus de contrôle, moins de risques

