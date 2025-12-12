# Prochaines étapes après la migration

## ✅ Étape 1 : Vérifier que les tables sont créées

Ouvrez Prisma Studio pour vérifier que les nouvelles tables existent :

```bash
npx prisma studio
```

Vérifiez que les tables suivantes existent :
- ✅ `UserPreferences`
- ✅ `UserSession`

## ✅ Étape 2 : Redémarrer le serveur backend

Si le serveur backend est en cours d'exécution, redémarrez-le pour charger le nouveau client Prisma :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis redémarrez-le
npm run start:dev
```

## ✅ Étape 3 : Tester l'interface Profile

1. **Démarrez le frontend** (si ce n'est pas déjà fait) :
```bash
cd ../frontend
npm run dev
```

2. **Connectez-vous** à l'application avec un compte utilisateur

3. **Accédez à la page Profile** : `http://localhost:3001/profile`

4. **Testez les fonctionnalités** :
   - ✅ Voir les informations personnelles
   - ✅ Modifier le téléphone (tous les rôles)
   - ✅ Vérifier que les EMPLOYEE ne peuvent pas modifier nom/prénom
   - ✅ Voir les rôles RBAC et permissions
   - ✅ Voir les informations employé (si lié)
   - ✅ Changer le mot de passe
   - ✅ Voir les sessions actives
   - ✅ Configurer les préférences (langue, timezone, notifications)
   - ✅ Voir les statistiques personnelles
   - ✅ Télécharger les données RGPD

## ✅ Étape 4 : Tester avec différents rôles

Testez l'interface avec différents comptes pour vérifier les restrictions :

1. **EMPLOYEE** (`employee@demo.com`) :
   - ✅ Ne peut pas modifier nom/prénom
   - ✅ Peut modifier téléphone
   - ✅ Peut changer son mot de passe
   - ✅ Peut voir ses statistiques

2. **MANAGER** (`manager@demo.com`) :
   - ✅ Peut modifier nom/prénom
   - ✅ Peut modifier téléphone
   - ✅ Peut voir ses statistiques

3. **ADMIN_RH** (`rh@demo.com`) :
   - ✅ Peut modifier nom/prénom
   - ✅ Peut modifier téléphone
   - ✅ Peut voir toutes les fonctionnalités

4. **SUPER_ADMIN** (`admin@demo.com`) :
   - ✅ Peut tout modifier
   - ✅ Accès complet

## ✅ Étape 5 : Vérifier les endpoints backend

Testez les nouveaux endpoints avec Postman, curl, ou directement depuis le frontend :

### Endpoints à tester :

1. **GET `/api/v1/users/me`**
   - Doit retourner : user + employee + roles + permissions

2. **PATCH `/api/v1/users/me`**
   - Tester avec EMPLOYEE (ne doit pas pouvoir modifier nom/prénom)
   - Tester avec ADMIN_RH (doit pouvoir modifier)

3. **POST `/api/v1/users/me/change-password`**
   - Tester le changement de mot de passe

4. **GET `/api/v1/users/me/preferences`**
   - Doit retourner les préférences (ou créer par défaut)

5. **PATCH `/api/v1/users/me/preferences`**
   - Tester la mise à jour des préférences

6. **GET `/api/v1/users/me/sessions`**
   - Doit retourner les sessions actives

7. **GET `/api/v1/users/me/stats`**
   - Doit retourner les statistiques personnelles

8. **GET `/api/v1/users/me/export`**
   - Doit retourner les données RGPD

## ✅ Étape 6 : Vérifier les logs

Surveillez les logs du backend pour détecter d'éventuelles erreurs :

```bash
# Dans le terminal du backend
# Vérifiez qu'il n'y a pas d'erreurs Prisma
```

## 🔧 En cas de problème

### Problème : Les préférences ne se sauvegardent pas
- Vérifiez que la table `UserPreferences` existe
- Vérifiez les logs du backend pour les erreurs SQL

### Problème : Les sessions ne s'affichent pas
- C'est normal pour l'instant, le tracking des sessions sera implémenté plus tard
- L'endpoint retourne une session par défaut

### Problème : Les statistiques sont vides
- C'est normal si l'utilisateur n'a pas de données d'attendance
- Les statistiques sont calculées depuis les données réelles

### Problème : Erreur "User not found"
- Vérifiez que l'utilisateur est bien connecté
- Vérifiez que le JWT contient les bonnes informations

## 📝 Notes importantes

- ⚠️ Les sessions ne sont pas encore trackées automatiquement lors de la connexion
- ⚠️ L'upload d'avatar n'est pas encore implémenté (bouton placeholder)
- ✅ Toutes les autres fonctionnalités devraient fonctionner

## 🎉 C'est terminé !

Une fois toutes ces étapes vérifiées, votre interface Profile est complètement fonctionnelle avec :
- ✅ Design professionnel
- ✅ RBAC intégré
- ✅ Restrictions selon les rôles
- ✅ Toutes les fonctionnalités demandées

