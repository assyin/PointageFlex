# 🔧 Créer le Fichier .env.local

## ⚠️ Solution Rapide

Pour forcer l'URL de l'API, créez un fichier `.env.local` dans le dossier `frontend/` :

### Étape 1 : Créer le fichier

```bash
cd ~/PointaFlex/frontend
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://172.17.112.163:3000/api/v1
EOF
```

### Étape 2 : Vérifier que le fichier existe

```bash
cat .env.local
```

Vous devriez voir :
```
NEXT_PUBLIC_API_URL=http://172.17.112.163:3000/api/v1
```

### Étape 3 : Redémarrer le Frontend

**IMPORTANT** : Vous devez redémarrer le frontend pour que les changements prennent effet !

```bash
# Arrêter le frontend (Ctrl+C)
cd ~/PointaFlex/frontend
npm run dev
```

### Étape 4 : Tester

1. Ouvrez votre navigateur
2. Allez sur : http://172.17.112.163:3001/login
3. Ouvrez la console (F12)
4. Vous devriez voir : `[API Client] URL de base configurée: http://172.17.112.163:3000/api/v1`
5. Essayez de vous connecter

## 🔍 Vérifier l'IP WSL

Si votre IP WSL est différente de `172.17.112.163`, trouvez-la d'abord :

```bash
hostname -I | awk '{print $1}'
```

Puis utilisez cette IP dans le fichier `.env.local`.

## 📝 Alternative : Modifier Manuellement

Si la commande `cat` ne fonctionne pas, créez le fichier manuellement :

1. Ouvrez votre éditeur de texte
2. Créez un nouveau fichier nommé `.env.local` dans le dossier `frontend/`
3. Ajoutez cette ligne :
   ```
   NEXT_PUBLIC_API_URL=http://172.17.112.163:3000/api/v1
   ```
4. Sauvegardez
5. Redémarrez le frontend

---

**Date de création** : 2025-12-11
**Version** : 1.0

