# PointageFlex

Solution SaaS multi-tenant complète de gestion de présence et de pointage pour entreprises.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![NestJS](https://img.shields.io/badge/NestJS-10.x-red.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.x-black.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue.svg)

## Présentation

PointageFlex est une application SaaS multi-tenant destinée aux entreprises marocaines et internationales pour gérer :

- Pointage biométrique (empreinte, reconnaissance faciale, badge RFID, QR code, code PIN)
- Gestion des horaires et shifts (matin/soir/nuit)
- Plannings et équipes
- Congés et absences
- Heures supplémentaires et récupérations
- Rapports RH et exports paie
- Audit et traçabilité

### Caractéristiques Clés

- **Multi-tenant** : Données isolées par entreprise
- **Flexible** : Alertes légales non bloquantes (conformité marocaine)
- **Biométrie** : Support de multiples méthodes de pointage
- **Shifts** : Matin/Soir/Nuit avec rotation optionnelle
- **Plannings visuels** : Vue jour/semaine/mois
- **Exports** : PDF, Excel, données paie
- **API REST** : Documentation Swagger automatique
- **Temps réel** : Dashboard avec indicateurs live
- **Responsive** : Interface mobile-first

---

## Stack Technique

### Backend

- **Framework** : NestJS 10.x (TypeScript)
- **Base de données** : PostgreSQL 15.x
- **ORM** : Prisma 5.x
- **Authentification** : JWT + Refresh Tokens
- **Documentation** : Swagger/OpenAPI
- **Validation** : class-validator
- **Tests** : Jest

### Frontend

- **Framework** : Next.js 14.x (App Router)
- **UI** : React 18 + TypeScript
- **Styling** : TailwindCSS + shadcn/ui
- **State Management** : React Query (TanStack Query)
- **Forms** : React Hook Form + Zod
- **Icons** : Lucide React

### Déploiement

- **Backend** : Render / Railway / Heroku
- **Frontend** : Vercel / Netlify
- **Database** : Supabase / Railway / Render

---

## Installation

### Prérequis

- Node.js 18+ et npm/yarn
- PostgreSQL 15+
- Git

### Cloner le Projet

```bash
git clone https://github.com/votre-username/pointageflex.git
cd pointageflex
```

---

## Configuration Backend

### 1. Installation des Dépendances

```bash
cd backend
npm install
```

### 2. Configuration Base de Données

Créer un fichier `.env` à la racine de `backend/` :

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pointageflex?schema=public"

# JWT
JWT_SECRET="votre-secret-jwt-tres-securise"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="votre-secret-refresh-tres-securise"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_URL="http://localhost:3001"
```

### 3. Génération Prisma et Migrations

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer et appliquer les migrations
npm run prisma:migrate

# Optionnel : Ouvrir Prisma Studio
npm run prisma:studio
```

### 4. Lancement Backend

```bash
# Mode développement
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

Le backend sera accessible sur `http://localhost:3000`

Documentation Swagger : `http://localhost:3000/api/docs`

---

## Configuration Frontend

### 1. Installation des Dépendances

```bash
cd frontend
npm install
```

### 2. Configuration Environnement

Créer un fichier `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_NAME=PointageFlex
```

### 3. Installation shadcn/ui

```bash
npx shadcn-ui@latest init

# Installer les composants nécessaires
npx shadcn-ui@latest add button card table dialog select input badge alert
```

### 4. Lancement Frontend

```bash
# Mode développement
npm run dev

# Build production
npm run build
npm start
```

Le frontend sera accessible sur `http://localhost:3001`

---

## Utilisation Docker (Optionnel)

### Backend + PostgreSQL

Créer un `docker-compose.yml` à la racine :

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: pointageflex_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: pointageflex
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    container_name: pointageflex_backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/pointageflex?schema=public
      JWT_SECRET: your-secret-key
      JWT_REFRESH_SECRET: your-refresh-secret
      PORT: 3000
    ports:
      - '3000:3000'
    depends_on:
      - postgres
    volumes:
      - ./backend:/app
      - /app/node_modules

volumes:
  postgres_data:
```

Lancer avec Docker :

```bash
docker-compose up -d
```

---

## Structure du Projet

```
pointageflex/
├── backend/                  # API NestJS
│   ├── src/
│   │   ├── common/          # Guards, decorators, middleware
│   │   ├── config/          # Configuration
│   │   ├── database/        # Prisma service
│   │   ├── modules/         # Modules fonctionnels
│   │   │   ├── auth/
│   │   │   ├── tenants/
│   │   │   ├── users/
│   │   │   ├── employees/
│   │   │   ├── attendance/
│   │   │   ├── shifts/
│   │   │   ├── teams/
│   │   │   ├── schedules/
│   │   │   ├── leaves/
│   │   │   ├── overtime/
│   │   │   ├── reports/
│   │   │   └── audit/
│   │   ├── utils/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma    # Schéma base de données
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # Application Next.js
│   ├── app/                 # Pages (App Router)
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   └── layout.tsx
│   ├── components/          # Composants React
│   │   ├── ui/             # shadcn/ui
│   │   ├── layout/
│   │   ├── dashboard/
│   │   └── shared/
│   ├── lib/
│   │   ├── api/            # Clients API
│   │   ├── hooks/          # React Query hooks
│   │   ├── utils/
│   │   └── types/
│   ├── providers/
│   ├── .env.local
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.js
│
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md
│   ├── API_ENDPOINTS.md
│   ├── MODULES_CODE.md
│   ├── SHIFTS_TEAMS_SCHEDULES.md
│   ├── LEAVES_OVERTIME.md
│   ├── REPORTS_AUDIT_EXPORT.md
│   └── FRONTEND_STRUCTURE.md
│
├── docker-compose.yml
└── README.md
```

---

## API Endpoints Principaux

Base URL : `/api/v1`

### Authentification
- `POST /auth/register` - Inscription tenant + admin
- `POST /auth/login` - Connexion
- `POST /auth/refresh` - Rafraîchir token
- `POST /auth/logout` - Déconnexion

### Employés
- `GET /employees` - Liste employés
- `POST /employees` - Créer employé
- `GET /employees/:id` - Détails employé
- `PATCH /employees/:id` - Modifier employé
- `POST /employees/:id/biometric` - Enregistrer biométrie

### Pointages
- `POST /attendance` - Pointage manuel
- `GET /attendance` - Liste pointages
- `POST /webhooks/attendance` - Webhook terminaux
- `GET /attendance/anomalies` - Anomalies

### Plannings
- `POST /schedules` - Créer planning
- `POST /schedules/bulk` - Planning en masse
- `GET /schedules/week/:date` - Planning semaine
- `GET /schedules/month/:date` - Planning mois
- `GET /schedules/alerts` - **Alertes légales non bloquantes**

### Congés
- `POST /leaves` - Demander congé
- `PATCH /leaves/:id/approve` - Approuver (Manager → RH)
- `GET /leaves/employee/:id/balance` - Solde congés

### Rapports
- `GET /reports/attendance` - Rapport présence
- `GET /reports/dashboard` - Tableau de bord
- `POST /reports/export/pdf` - Export PDF
- `POST /reports/export/excel` - Export Excel
- `GET /reports/payroll` - Export paie

Documentation complète : [docs/API_ENDPOINTS.md](docs/API_ENDPOINTS.md)

Swagger live : `http://localhost:3000/api/docs`

---

## Fonctionnalités Spécifiques

### Multi-Tenant

Chaque entreprise (tenant) a ses propres données isolées :

- Résolution automatique du tenant via sous-domaine ou header `X-Tenant-ID`
- Isolation complète des données par `tenantId`
- Paramètres personnalisables par tenant

### Alertes Légales Non Bloquantes

Conformément au cahier des charges, le système **alerte mais ne bloque jamais** :

- Heures hebdomadaires > 44h → **Alerte WARNING**
- Repos insuffisant < 11h → **Alerte WARNING**
- Travail de nuit répétitif → **Alerte CRITICAL**
- Effectif minimum non atteint → **Alerte WARNING**

Toutes ces alertes sont **informatives uniquement** et peuvent être ignorées par un admin.

### Pointage Biométrique

Support de multiples méthodes :

- Empreinte digitale
- Reconnaissance faciale
- Badge RFID
- QR Code
- Code PIN
- Géolocalisation mobile

Integration via webhooks ou import CSV/Excel.

### Shifts & Rotations

- Shifts prédéfinis : Matin, Soir, Nuit
- Shifts personnalisés
- **Rotation optionnelle** (activable/désactivable par équipe)
- Planning visuel avec Gantt/Timeline
- Remplacements et échanges de shifts

### Workflow Congés

1. Employé demande → `PENDING`
2. Manager approuve → `MANAGER_APPROVED`
3. RH approuve → `APPROVED` (finalisé)

### Heures Supplémentaires

- Calcul automatique depuis les pointages
- Taux configurable (jour/nuit)
- Conversion en récupération
- Workflow d'approbation

---

## Déploiement

### Backend sur Render

1. Créer un compte sur [Render](https://render.com)
2. Créer un nouveau Web Service
3. Connecter votre repo GitHub
4. Configuration :
   - Build Command : `npm install && npm run build`
   - Start Command : `npm run start:prod`
5. Ajouter les variables d'environnement
6. Créer une PostgreSQL database sur Render
7. Déployer

### Frontend sur Vercel

1. Créer un compte sur [Vercel](https://vercel.com)
2. Importer le projet depuis GitHub
3. Configuration :
   - Framework : Next.js
   - Root Directory : `frontend`
4. Ajouter `NEXT_PUBLIC_API_URL`
5. Déployer

### Base de Données sur Supabase

1. Créer un projet sur [Supabase](https://supabase.com)
2. Récupérer la connexion string
3. Mettre à jour `DATABASE_URL` dans les variables d'environnement
4. Lancer les migrations Prisma

---

## Tests

### Backend

```bash
cd backend

# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend

```bash
cd frontend

# Tests Jest
npm run test

# Tests e2e Playwright (à configurer)
npm run test:e2e
```

---

## Scripts NPM Utiles

### Backend

```bash
npm run start:dev       # Lancer en mode développement
npm run build           # Build production
npm run start:prod      # Lancer en production
npm run prisma:generate # Générer client Prisma
npm run prisma:migrate  # Migrations
npm run prisma:studio   # Ouvrir Prisma Studio
npm run lint            # Linter
npm run format          # Prettier
```

### Frontend

```bash
npm run dev             # Mode développement
npm run build           # Build production
npm start               # Lancer build production
npm run lint            # Linter
```

---

## Configuration Avancée

### Paramètres Tenant

Personnalisables via l'API `/tenants/:id/settings` :

```json
{
  "workDaysPerWeek": 6,
  "maxWeeklyHours": 44,
  "lateToleranceMinutes": 15,
  "breakDuration": 60,
  "alertWeeklyHoursExceeded": true,
  "alertInsufficientRest": true,
  "alertNightWorkRepetitive": true,
  "annualLeaveDays": 18,
  "overtimeRate": 1.25,
  "nightShiftRate": 1.5
}
```

### Webhooks Terminaux Biométriques

Endpoint : `POST /api/v1/webhooks/attendance`

Headers requis :
- `X-Device-ID` : ID du terminal
- `X-API-Key` : Clé API du terminal

Body :
```json
{
  "employeeId": "uuid",
  "type": "IN",
  "method": "FINGERPRINT",
  "timestamp": "2024-01-15T08:00:00Z",
  "rawData": {}
}
```

---

## Sécurité

- **JWT** avec refresh tokens
- **RBAC** : 4 rôles (SUPER_ADMIN, ADMIN_RH, MANAGER, EMPLOYEE)
- **HTTPS** obligatoire en production
- **Rate Limiting** sur les endpoints sensibles
- **Validation** stricte des inputs (class-validator)
- **Audit Log** : Traçabilité de toutes les modifications
- **Passwords** hashés avec bcrypt
- **CORS** configuré

---

## Support & Contribution

### Bugs & Features

Ouvrir une issue sur GitHub : [Issues](https://github.com/votre-username/pointageflex/issues)

### Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

---

## Documentation Complète

- [Architecture NestJS](docs/ARCHITECTURE.md)
- [Endpoints API](docs/API_ENDPOINTS.md)
- [Code Modules](docs/MODULES_CODE.md)
- [Shifts & Plannings](docs/SHIFTS_TEAMS_SCHEDULES.md)
- [Congés & Heures Sup](docs/LEAVES_OVERTIME.md)
- [Rapports & Exports](docs/REPORTS_AUDIT_EXPORT.md)
- [Structure Frontend](docs/FRONTEND_STRUCTURE.md)

---

## License

MIT License - voir [LICENSE](LICENSE)

---

## Auteur

Développé avec par [Votre Nom](https://github.com/votre-username)

---

## Roadmap

### Version 1.0 (Actuelle)
- ✅ Multi-tenant
- ✅ Pointage biométrique
- ✅ Shifts & Plannings
- ✅ Congés & Heures sup
- ✅ Rapports & Exports
- ✅ Audit & Traçabilité

### Version 2.0 (À venir)
- [ ] Application mobile (React Native)
- [ ] Notifications push temps réel
- [ ] IA : Prédiction absences
- [ ] IA : Optimisation plannings
- [ ] Intégration paie (SAGE, etc.)
- [ ] Multi-langues (FR, AR, EN)
- [ ] Géofencing avancé
- [ ] Reconnaissance faciale 3D

---

**Besoin d'aide ?** Consultez la [Documentation](docs/) ou ouvrez une [Issue](https://github.com/votre-username/pointageflex/issues).

**PointageFlex** - La solution moderne de gestion de présence pour entreprises.
