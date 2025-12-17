# 🚀 Démarrage du Frontend

## ⚠️ IMPORTANT : Démarrer le Backend AVANT le Frontend

Le frontend nécessite que le backend soit démarré et accessible.

## 📋 Démarrage Rapide

### Option 1: Script de Redémarrage (Recommandé)

```bash
cd frontend
chmod +x restart-frontend.sh
./restart-frontend.sh
```

Ou via npm:
```bash
cd frontend
npm run restart
```

### Option 2: Démarrage Simple

```bash
cd frontend
npm run dev
```

## 🔍 Diagnostic

Si le frontend n'est pas accessible:

```bash
cd frontend
chmod +x check-frontend.sh
./check-frontend.sh
```

Ou via npm:
```bash
cd frontend
npm run check
```

## 🌐 URLs d'Accès

Une fois démarré, le frontend sera accessible sur:

- **Depuis WSL**: http://localhost:3001
- **Depuis Windows**: http://localhost:3001 (si port forwarding configuré)
- **IP directe**: http://<WSL_IP>:3001

Pour obtenir l'IP WSL:
```bash
hostname -I | awk '{print $1}'
```

## ⚙️ Configuration

### Fichier .env.local (Optionnel)

Pour forcer l'URL de l'API, créez `.env.local`:

```bash
cd frontend
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
EOF
```

**Note**: Remplacez `localhost` par l'IP WSL si vous accédez depuis Windows.

## 🔧 Dépannage

### Le frontend ne démarre pas

1. **Vérifiez les dépendances:**
   ```bash
   cd frontend
   npm install
   ```

2. **Nettoyez le cache:**
   ```bash
   cd frontend
   npm run clean
   npm run dev
   ```

3. **Vérifiez les erreurs de compilation:**
   Regardez les logs dans le terminal

### Le frontend démarre mais n'est pas accessible depuis Windows

Configurez le port forwarding WSL (PowerShell Admin):

```powershell
# Obtenir l'IP WSL (dans WSL)
# hostname -I | awk '{print $1}'

# Dans PowerShell Admin
$wslIP = "<WSL_IP>"
netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=$wslIP
New-NetFirewallRule -DisplayName "WSL Frontend" -Direction Inbound -LocalPort 3001 -Action Allow -Protocol TCP
```

### Erreur 500 sur les fichiers statiques

```bash
cd frontend
rm -rf .next
npm run dev
```

## 📝 Notes

- Le frontend écoute sur `0.0.0.0:3001` par défaut
- Pour changer le port: `npm run dev -- -p 3002`
- Les logs s'affichent dans le terminal

