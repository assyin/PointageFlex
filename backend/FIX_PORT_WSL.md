# Solution pour libérer le port 3001 dans WSL

## Problème
Le port 3001 est utilisé par un processus dans WSL (Ubuntu), pas dans Windows.

## Solution : Utiliser les commandes WSL directement

### Option 1 : Depuis votre terminal WSL (recommandé)

Ouvrez un terminal WSL et exécutez :

```bash
# Trouver le processus qui utilise le port 3001
sudo lsof -i :3001
# ou
sudo netstat -tulpn | grep :3001
# ou
sudo ss -tulpn | grep :3001

# Tuer le processus (remplacez <PID> par le numéro trouvé)
sudo kill -9 <PID>
```

### Option 2 : Arrêter tous les processus Node.js dans WSL

```bash
# Trouver tous les processus Node.js
ps aux | grep node

# Tuer tous les processus Node.js
pkill -9 node
```

### Option 3 : Redémarrer WSL (solution radicale)

Si rien ne fonctionne, redémarrez WSL :

```powershell
# Depuis PowerShell Windows
wsl --shutdown
```

Puis relancez WSL et redémarrez les serveurs.

## Étapes recommandées

1. **Ouvrez un terminal WSL** (Ubuntu)

2. **Arrêtez tous les processus Node.js** :
```bash
pkill -9 node
```

3. **Vérifiez que les ports sont libres** :
```bash
netstat -tulpn | grep -E ':(3000|3001)'
```

4. **Redémarrez le backend** :
```bash
cd ~/PointaFlex/backend
npm run start:dev
```

5. **Dans un autre terminal, redémarrez le frontend** :
```bash
cd ~/PointaFlex/frontend
npm run dev
```

## Note importante

Si vous utilisez WSL, les processus Node.js tournent dans l'environnement Linux, pas Windows. 
Les commandes Windows `taskkill` ne fonctionneront pas pour les processus WSL.

