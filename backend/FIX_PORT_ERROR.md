# Solution pour l'erreur EADDRINUSE (Port 3000 déjà utilisé)

## Problème
Le port 3000 est déjà utilisé par un autre processus (probablement une ancienne instance du serveur).

## Solutions

### Solution 1 : Arrêter le processus qui utilise le port 3000 (Recommandé)

#### Sur Windows (PowerShell) :
```powershell
# Trouver le processus qui utilise le port 3000
netstat -ano | findstr :3000

# Tuer le processus (remplacez PID par le numéro trouvé)
taskkill /PID <PID> /F
```

#### Sur Linux/WSL :
```bash
# Trouver le processus qui utilise le port 3000
lsof -i :3000
# ou
netstat -tulpn | grep :3000

# Tuer le processus (remplacez PID par le numéro trouvé)
kill -9 <PID>
```

### Solution 2 : Changer le port du serveur

Modifiez le fichier `backend/src/main.ts` pour utiliser un autre port :

```typescript
await app.listen(3001); // Au lieu de 3000
```

Puis mettez à jour votre frontend pour pointer vers le nouveau port.

### Solution 3 : Redémarrer complètement

1. Arrêtez tous les processus Node.js :
```bash
# Windows
taskkill /F /IM node.exe

# Linux/WSL
pkill node
```

2. Redémarrez le serveur :
```bash
npm run start:dev
```

## Vérification

Après avoir résolu le problème, vérifiez que le serveur démarre correctement :

```
🚀 Application is running on: http://localhost:3000
```

