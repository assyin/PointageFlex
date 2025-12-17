# Scripts de Redémarrage du Serveur Backend

## 📋 Description

Scripts pour redémarrer automatiquement le serveur backend PointaFlex. Ces scripts :
- Arrêtent les processus existants sur le port 3000
- Vérifient que le port est libre
- Installent les dépendances si nécessaire
- Génèrent le client Prisma
- Redémarrent le serveur en mode développement

## 🚀 Utilisation

### Sur Linux/WSL (Bash)

```bash
cd backend
chmod +x restart-server.sh
./restart-server.sh
```

Ou via npm :
```bash
cd backend
npm run restart
```

### Sur Windows (PowerShell)

```powershell
cd backend
.\restart-server.ps1
```

Ou via npm :
```powershell
cd backend
npm run restart:win
```

## 🔧 Fonctionnalités

Les scripts effectuent automatiquement :

1. **Arrêt des processus existants**
   - Recherche et arrête les processus sur le port 3000
   - Arrête les processus NestJS/Node.js liés au backend

2. **Vérification du port**
   - Vérifie que le port 3000 est libre
   - Tente de libérer le port si nécessaire

3. **Vérification des dépendances**
   - Vérifie la présence de `node_modules`
   - Installe les dépendances si nécessaire

4. **Génération Prisma Client**
   - Génère le client Prisma si le schéma existe

5. **Démarrage du serveur**
   - Lance le serveur en mode développement (`npm run start:dev`)
   - Affiche les URLs d'accès

## 🌐 URLs d'accès

Une fois le serveur démarré, il sera accessible sur :
- **API** : http://localhost:3000
- **Swagger Docs** : http://localhost:3000/api/docs
- **Réseau** : http://0.0.0.0:3000 (accessible depuis le réseau local)

## ⚠️ Dépannage

### Le port est toujours occupé

Si le port 3000 est toujours occupé après l'exécution du script :

**Sur Linux/WSL :**
```bash
# Trouver le processus
lsof -ti:3000
# ou
fuser 3000/tcp

# Arrêter manuellement
kill -9 <PID>
```

**Sur Windows :**
```powershell
# Trouver le processus
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess

# Arrêter manuellement
Stop-Process -Id <PID> -Force
```

### Le serveur n'est pas accessible

1. Vérifiez que le serveur écoute sur `0.0.0.0` et non seulement sur `localhost`
2. Vérifiez les règles de pare-feu
3. Vérifiez que le port 3000 n'est pas bloqué
4. Pour WSL, vérifiez que le port forwarding est configuré

### Erreur de migration Prisma

Si vous avez modifié le schéma Prisma, exécutez d'abord :
```bash
cd backend
npx prisma migrate dev --name <nom_migration>
```

## 📝 Notes

- Le script utilise le port 3000 par défaut
- Vous pouvez changer le port en définissant la variable d'environnement `PORT`
- Le script arrête **tous** les processus Node.js liés au backend, pas seulement ceux sur le port 3000

