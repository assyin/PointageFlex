# 🚀 Instructions de Démarrage - Frontend

## ⚠️ IMPORTANT : Démarrer le Backend AVANT le Frontend

Le frontend a besoin que le backend soit démarré pour fonctionner.

## 📋 Étapes de Démarrage

### 1. Démarrer le Backend (Terminal 1)

```bash
cd ~/PointaFlex/backend
npm run start:dev
```

**Attendez** de voir :
```
🚀 Application is running on: http://localhost:3000
🌐 Network access: http://0.0.0.0:3000
```

### 2. Créer le Fichier .env.local (Optionnel mais Recommandé)

```bash
cd ~/PointaFlex/frontend
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://172.17.112.163:3000/api/v1
EOF
```

**Note** : Remplacez `172.17.112.163` par votre IP WSL si elle est différente.

Pour trouver votre IP WSL :
```bash
hostname -I | awk '{print $1}'
```

### 3. Démarrer le Frontend (Terminal 2)

```bash
cd ~/PointaFlex/frontend
npm run dev
```

**Attendez** de voir :
```
✓ Ready in XXXXms
```

### 4. Accéder à l'Application

Depuis Windows :
- **Frontend** : http://172.17.112.163:3001
- **Backend API** : http://172.17.112.163:3000/api/docs

Depuis WSL :
- **Frontend** : http://localhost:3001
- **Backend API** : http://localhost:3000/api/docs

## 🔧 Si vous obtenez ERR_CONNECTION_REFUSED

1. **Vérifiez que le backend est démarré** :
   ```bash
   curl http://172.17.112.163:3000/api/docs
   ```
   Vous devriez voir du HTML (documentation Swagger).

2. **Vérifiez les ports** :
   ```bash
   netstat -tulpn | grep -E ':(3000|3001)'
   ```

3. **Redémarrez les serveurs** dans l'ordre :
   - D'abord le backend
   - Ensuite le frontend

## 📝 Notes

- Le frontend détecte automatiquement l'URL de l'API selon l'URL du navigateur
- Si vous accédez via `172.17.112.163:3001`, l'API sera sur `172.17.112.163:3000`
- Si vous accédez via `localhost:3001`, l'API sera sur `localhost:3000`
- Pour forcer une URL spécifique, créez `.env.local` avec `NEXT_PUBLIC_API_URL`

---

**Date de création** : 2025-12-11
**Version** : 1.0

