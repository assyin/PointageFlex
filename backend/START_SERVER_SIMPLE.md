# 🚀 Démarrage Simple du Serveur

## Méthode 1: Script Rapide (Recommandé)

```bash
cd backend
chmod +x restart-now.sh
./restart-now.sh
```

Ou via npm:
```bash
cd backend
npm run restart:now
```

## Méthode 2: Test de Connexion

Pour vérifier si le serveur est accessible:

```bash
cd backend
chmod +x test-connection.sh
./test-connection.sh
```

Ou via npm:
```bash
cd backend
npm run test:server
```

## Méthode 3: Redémarrage Complet

```bash
cd backend
npm run restart
```

## ⚠️ Si le serveur n'est toujours pas accessible depuis Windows

### Configuration WSL Port Forwarding (Windows PowerShell Admin)

1. **Obtenez l'IP WSL:**
   ```bash
   # Dans WSL
   hostname -I | awk '{print $1}'
   ```

2. **Dans PowerShell (Admin):**
   ```powershell
   # Remplacez <WSL_IP> par l'IP obtenue
   $wslIP = "<WSL_IP>"
   netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=$wslIP
   New-NetFirewallRule -DisplayName "WSL Backend" -Direction Inbound -LocalPort 3000 -Action Allow -Protocol TCP
   ```

3. **Vérifiez:**
   ```powershell
   netsh interface portproxy show all
   ```

## 🔍 Diagnostic

Si le serveur ne démarre pas ou n'est pas accessible:

```bash
cd backend
./check-server.sh
```

## 📝 Notes

- Le serveur écoute sur `0.0.0.0:3000` par défaut
- Pour changer le port: `PORT=3001 npm run start:dev`
- Les logs du serveur s'affichent dans le terminal

