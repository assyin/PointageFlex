# Guide de Résolution - Serveur Inaccessible sur WSL

## 🔍 Diagnostic

Le serveur démarre correctement mais n'est pas accessible. Cela est généralement dû à un problème de port forwarding entre Windows et WSL.

## ✅ Solutions

### Solution 1: Configuration du Port Forwarding (Recommandé)

**Sur Windows (PowerShell en tant qu'administrateur):**

1. **Obtenez l'IP WSL:**
   ```bash
   # Dans WSL
   hostname -I | awk '{print $1}'
   ```

2. **Configurez le port forwarding:**
   ```powershell
   # Remplacez <WSL_IP> par l'IP obtenue ci-dessus
   netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=<WSL_IP>
   ```

3. **Ajoutez une règle de pare-feu:**
   ```powershell
   New-NetFirewallRule -DisplayName "WSL Backend Port 3000" -Direction Inbound -LocalPort 3000 -Action Allow -Protocol TCP
   ```

4. **Vérifiez la configuration:**
   ```powershell
   netsh interface portproxy show all
   ```

### Solution 2: Script Automatique

Utilisez le script fourni:

```bash
cd backend
chmod +x fix-wsl-access.sh
./fix-wsl-access.sh
```

Le script vous donnera les commandes exactes à exécuter.

### Solution 3: Vérification du Serveur

Utilisez le script de diagnostic:

```bash
cd backend
chmod +x check-server.sh
./check-server.sh
```

## 🧪 Test de Connexion

### Depuis WSL:
```bash
curl http://localhost:3000/api/v1/auth/login
```

### Depuis Windows (PowerShell):
```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/v1/auth/login -Method POST
```

### Depuis le navigateur:
- http://localhost:3000/api/docs
- http://localhost:3000/api/v1/auth/login

## 🔧 Dépannage

### Le port forwarding ne fonctionne pas

1. **Vérifiez que le service WSL est actif:**
   ```powershell
   Get-Service LxssManager
   ```

2. **Redémarrez le service WSL:**
   ```powershell
   Restart-Service LxssManager
   ```

3. **Supprimez et recréez le port forwarding:**
   ```powershell
   # Supprimer
   netsh interface portproxy delete v4tov4 listenport=3000 listenaddress=0.0.0.0
   
   # Recréer
   netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=<WSL_IP>
   ```

### Le pare-feu bloque la connexion

1. **Vérifiez les règles de pare-feu:**
   ```powershell
   Get-NetFirewallRule -DisplayName "*WSL*" | Format-Table
   ```

2. **Ajoutez une règle plus permissive (temporairement):**
   ```powershell
   New-NetFirewallRule -DisplayName "WSL All Ports" -Direction Inbound -Action Allow -RemoteAddress 172.16.0.0/12
   ```

### Le serveur ne répond pas

1. **Vérifiez que le serveur écoute bien:**
   ```bash
   # Dans WSL
   lsof -i:3000
   # ou
   ss -lptn 'sport = :3000'
   ```

2. **Vérifiez les logs du serveur** pour des erreurs

3. **Testez avec curl depuis WSL:**
   ```bash
   curl -v http://localhost:3000/api/v1/auth/login
   ```

## 📝 Notes Importantes

1. **L'IP WSL peut changer** après un redémarrage. Vous devrez peut-être reconfigurer le port forwarding.

2. **Pour automatiser le port forwarding**, créez un script PowerShell qui s'exécute au démarrage de Windows.

3. **Alternative**: Utilisez `localhost` au lieu de l'IP WSL dans vos applications frontend si possible.

## 🚀 Script Automatique de Configuration

Créez un fichier `setup-wsl-port.ps1` sur Windows:

```powershell
# Obtenir l'IP WSL
$wslIP = (wsl hostname -I).Trim().Split()[0]

# Configurer le port forwarding
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=$wslIP

# Ajouter la règle de pare-feu
New-NetFirewallRule -DisplayName "WSL Backend Port 3000" -Direction Inbound -LocalPort 3000 -Action Allow -Protocol TCP -ErrorAction SilentlyContinue

Write-Host "Port forwarding configuré: Windows:3000 -> WSL ($wslIP):3000"
```

Exécutez ce script en tant qu'administrateur chaque fois que vous redémarrez Windows ou WSL.

