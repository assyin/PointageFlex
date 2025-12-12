# Solution pour libérer le port 3001 (Frontend)

## Problème
Le port 3001 est déjà utilisé par un autre processus (probablement une ancienne instance du serveur frontend).

## Solutions

### Solution 1 : Utiliser PowerShell Windows (depuis votre terminal actuel)

```powershell
# Trouver le processus qui utilise le port 3001
netstat -ano | findstr :3001

# Tuer le processus (remplacez <PID> par le numéro trouvé dans la dernière colonne)
taskkill /PID <PID> /F
```

### Solution 2 : Arrêter tous les processus Node.js

```powershell
# Arrêter tous les processus Node.js
taskkill /F /IM node.exe
```

Puis redémarrez le frontend :
```bash
cd ../frontend
npm run dev
```

### Solution 3 : Utiliser WSL directement

Si vous êtes dans WSL, utilisez ces commandes :

```bash
# Trouver le processus
netstat -tulpn | grep :3001
# ou
ss -tulpn | grep :3001

# Tuer le processus (remplacez <PID> par le numéro trouvé)
kill -9 <PID>
```

### Solution 4 : Changer le port du frontend (temporaire)

Si vous ne pouvez pas arrêter le processus, changez temporairement le port dans `frontend/package.json` :

```json
"dev": "next dev -p 3002 -H 0.0.0.0"
```

Puis mettez à jour `frontend/lib/api/client.ts` pour pointer vers le nouveau port.

## Étapes recommandées

1. **Arrêter tous les processus Node.js** :
```powershell
taskkill /F /IM node.exe
```

2. **Redémarrer le backend** :
```bash
cd backend
npm run start:dev
```

3. **Redémarrer le frontend** :
```bash
cd frontend
npm run dev
```

## Vérification

Après avoir résolu le problème, vous devriez voir :
- Backend : `🚀 Application is running on: http://localhost:3000`
- Frontend : `Ready - started server on 0.0.0.0:3001`

