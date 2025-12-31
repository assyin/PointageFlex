# Guide : Créer des types de congé par défaut

Ce script permet de créer des types de congé par défaut pour un tenant existant.

## 📋 Types de congé créés

Le script crée les types de congé suivants :

1. **Congé Payé** (CP)
   - Payé : Oui
   - Document requis : Non
   - Max jours/an : 18

2. **Congé Maladie** (CM)
   - Payé : Oui
   - Document requis : Oui
   - Max jours/an : Illimité

3. **Congé Maternité** (CMAT)
   - Payé : Oui
   - Document requis : Oui
   - Max jours/an : 98

4. **Congé sans Solde** (CSS)
   - Payé : Non
   - Document requis : Non
   - Max jours/an : Illimité

5. **Congé Paternité** (CPAT)
   - Payé : Oui
   - Document requis : Oui
   - Max jours/an : 3

6. **Congé Exceptionnel** (CE)
   - Payé : Non
   - Document requis : Non
   - Max jours/an : Illimité

## 🚀 Exécution

### Option 1 : Utiliser le premier tenant trouvé

```bash
cd backend
npx ts-node scripts/create-default-leave-types.ts
```

### Option 2 : Spécifier un tenant ID

```bash
cd backend
npx ts-node scripts/create-default-leave-types.ts <TENANT_ID>
```

**Exemple :**
```bash
npx ts-node scripts/create-default-leave-types.ts 52ca4182-5679-4298-8313-a8853f40d4a1
```

## 📝 Notes importantes

- Le script vérifie si les types de congé existent déjà (par code) et ne crée que ceux qui manquent
- Si tous les types existent déjà, le script affiche un message et s'arrête
- Les types existants ne sont pas modifiés

## ✅ Résultat attendu

Après l'exécution, vous devriez voir :

```
📋 Utilisation du tenant: Test Company (52ca4182-5679-4298-8313-a8853f40d4a1)

📊 Types de congé existants: 0

📝 Création de 6 type(s) de congé...

   ✅ Congé Payé (CP)
   ✅ Congé Maladie (CM)
   ✅ Congé Maternité (CMAT)
   ✅ Congé sans Solde (CSS)
   ✅ Congé Paternité (CPAT)
   ✅ Congé Exceptionnel (CE)

═══════════════════════════════════════════════════════
✅ Types de congé créés avec succès !
═══════════════════════════════════════════════════════

📊 Total des types de congé pour ce tenant: 6

Types de congé disponibles:
   - Congé Exceptionnel (CE) - Non payé
   - Congé Maladie (CM) - Payé
   - Congé Maternité (CMAT) - Payé
   - Congé Paternité (CPAT) - Payé
   - Congé Payé (CP) - Payé
   - Congé sans Solde (CSS) - Non payé
```

## 🔍 Vérification

Après l'exécution, vous pouvez vérifier dans l'interface :

1. Aller sur `http://localhost:3001/leaves`
2. Cliquer sur l'icône "Settings" (⚙️) pour ouvrir "Gestion des types de congé"
3. Vous devriez voir les types de congé créés

## ⚠️ Dépannage

Si vous obtenez une erreur de connexion à la base de données :

1. Vérifiez que le fichier `.env` dans `backend/` contient la variable `DATABASE_URL`
2. Vérifiez que la base de données est accessible
3. Vérifiez que Prisma Client est généré : `npx prisma generate`

