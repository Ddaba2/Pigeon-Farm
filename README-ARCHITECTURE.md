# 🏗️ Architecture Complète - PigeonFarm

## 📋 Vue d'ensemble

PigeonFarm est une application full-stack moderne pour la gestion d'élevage de pigeons, construite avec **React + TypeScript** (frontend) et **Node.js + Express** (backend).

## 🎯 Fonctionnalités Principales

### 1. **Tableau de bord** (`/dashboard`)
- **Vue d'ensemble** : Statistiques en temps réel
- **Activités récentes** : Suivi des dernières actions
- **Actions rapides** : Accès direct aux fonctions principales
- **Indicateurs clés** : Couples, œufs, pigeonneaux, alertes santé

### 2. **Gestion des Couples** (`/couples`)
- **CRUD complet** : Créer, lire, mettre à jour, supprimer
- **Statuts** : Actif, Reproduction, Inactif
- **Recherche et filtres** : Par ID, notes, statut
- **Statistiques** : Couples actifs, en reproduction, total pigeonneaux

### 3. **Suivi des Œufs** (`/eggs`)
- **Gestion des œufs** : Enregistrement, suivi, statuts
- **Statuts** : En incubation, Éclos, Cassé, Infertile
- **Calculs automatiques** : Jours restants jusqu'à l'éclosion
- **Localisation** : Nids, couveuses artificielles

### 4. **Gestion des Pigeonneaux** (`/pigeonneaux`)
- **Cycle de vie** : Nouveau-né → Croissance → Sevré → Prêt
- **Caractéristiques** : Sexe, couleur, poids, localisation
- **Statuts** : Nouveau-né, En croissance, Sevré, Prêt, Vendu, Décédé
- **Développement** : Suivi de l'âge et des étapes

### 5. **Suivi de la Santé** (`/health`)
- **Types d'interventions** : Vaccination, Traitement, Contrôle, Urgence, Prévention
- **Statuts** : Programmé, Terminé, Annulé, Urgent
- **Visites à venir** : Planning des prochaines interventions
- **Coûts** : Suivi des dépenses vétérinaires

### 6. **Statistiques** (`/statistics`)
- **Vue d'ensemble** : Métriques clés de l'élevage
- **Évolution mensuelle** : Tendances de production
- **Distribution des races** : Répartition par pourcentage
- **Indicateurs de productivité** : Taux d'éclosion, survie, efficacité
- **Résumé financier** : Revenus, dépenses, bénéfices

## 🏛️ Architecture Technique

### Frontend (React + TypeScript)

```
src/
├── components/           # Composants React
│   ├── Dashboard.tsx     # Tableau de bord principal
│   ├── CouplesManagement.tsx
│   ├── EggTracking.tsx
│   ├── PigeonnalManagement.tsx
│   ├── HealthTracking.tsx
│   ├── Statistics.tsx
│   ├── Navigation.tsx    # Navigation principale
│   ├── Login.tsx         # Authentification
│   └── ...
├── hooks/                # Hooks personnalisés
│   ├── useAccessibility.ts
│   ├── useDarkMode.ts
│   └── useKeyboardNavigation.ts
├── utils/                # Utilitaires
│   ├── api.ts            # Client API principal
│   ├── validation.ts     # Validation des données
│   └── ...
└── types/                # Types TypeScript
    └── types.ts
```

### Backend (Node.js + Express)

```
backend/
├── routes/               # Routes API
│   ├── couples.js        # Gestion des couples
│   ├── eggs.js           # Gestion des œufs
│   ├── pigeonneaux.js    # Gestion des pigeonneaux
│   ├── health.js         # Suivi de la santé
│   ├── statistics.js     # Statistiques
│   ├── users.js          # Gestion des utilisateurs
│   └── auth.js           # Authentification
├── services/             # Logique métier
│   ├── coupleService.js
│   ├── eggService.js
│   ├── pigeonneauService.js
│   ├── healthService.js
│   ├── statisticsService.js
│   └── userService.js
├── middleware/           # Middleware Express
│   ├── auth.js           # Authentification JWT
│   └── security.js       # Sécurité
└── config/               # Configuration
    ├── database.js       # Configuration MySQL
    └── config.js         # Variables d'environnement
```

## 🔌 Liaison Frontend-Backend

### Configuration API (`src/utils/api.ts`)

```typescript
class ApiClient {
  private baseURL: string = 'http://localhost:3002/api';
  
  // Méthodes CRUD pour chaque entité
  async getCouples(): Promise<ApiResponse<any>>
  async createCouple(coupleData: any): Promise<ApiResponse<any>>
  async updateCouple(id: number, coupleData: any): Promise<ApiResponse<any>>
  async deleteCouple(id: number): Promise<ApiResponse<any>>
  
  // ... autres méthodes
}
```

### Routes Backend

```javascript
// Exemple : routes/couples.js
router.get('/couples', authMiddleware, coupleController.getAll);
router.post('/couples', authMiddleware, coupleController.create);
router.put('/couples/:id', authMiddleware, coupleController.update);
router.delete('/couples/:id', authMiddleware, coupleController.delete);
```

## 🎨 Interface Utilisateur

### Design System
- **Framework CSS** : Tailwind CSS
- **Thème** : Support clair/sombre
- **Responsive** : Mobile-first design
- **Accessibilité** : Navigation clavier, contrastes élevés

### Composants UI
- **Navigation** : Onglets avec icônes Lucide React
- **Tableaux** : Données avec actions (éditer, supprimer)
- **Formulaires** : Validation en temps réel
- **Statistiques** : Graphiques et indicateurs visuels
- **Modales** : Création et édition d'entités

## 🔐 Sécurité et Authentification

### JWT (JSON Web Tokens)
- **Login** : Vérification des identifiants
- **Middleware** : Protection des routes sensibles
- **Refresh** : Renouvellement automatique des tokens
- **Logout** : Invalidation des sessions

### Rôles et Permissions
- **Admin** : Accès complet + gestion des utilisateurs
- **User** : Accès limité aux fonctionnalités de base

## 📊 Base de Données

### Structure MySQL
```sql
-- Tables principales
couples          # Couples de pigeons
eggs             # Suivi des œufs
pigeonneaux      # Gestion des jeunes
health_records   # Dossiers de santé
users            # Utilisateurs du système
statistics       # Données statistiques
```

### Relations
- **Couples** → **Œufs** → **Pigeonneaux**
- **Utilisateurs** → **Toutes les entités** (via permissions)
- **Santé** → **Pigeons** (couples + pigeonneaux)

## 🚀 Déploiement

### Frontend
```bash
npm run build    # Production build
npm run dev      # Développement local
```

### Backend
```bash
npm start        # Production
npm run dev      # Développement avec nodemon
```

### Variables d'Environnement
```env
# Backend (.env)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=pigeon_manager
JWT_SECRET=your-secret-key
PORT=3002

# Frontend
VITE_API_URL=http://localhost:3002/api
```

## 🧪 Tests

### Frontend
- **Composants** : Tests unitaires React
- **Hooks** : Tests des hooks personnalisés
- **API** : Tests d'intégration

### Backend
- **Routes** : Tests des endpoints API
- **Services** : Tests de la logique métier
- **Base de données** : Tests d'intégration

## 📈 Monitoring et Logs

### Logs
- **Backend** : Winston pour les logs structurés
- **Frontend** : Console et service de reporting
- **Erreurs** : Capture et reporting automatique

### Métriques
- **Performance** : Temps de réponse API
- **Utilisation** : Statistiques d'usage
- **Erreurs** : Taux d'erreur et types

## 🔄 Workflow de Développement

1. **Feature Branch** : Création depuis `main`
2. **Développement** : Frontend + Backend en parallèle
3. **Tests** : Unitaires + Intégration
4. **Code Review** : Validation par l'équipe
5. **Merge** : Intégration dans `main`
6. **Déploiement** : Automatique via CI/CD

## 🎯 Roadmap

### Phase 1 ✅ (Terminée)
- [x] Architecture de base
- [x] Composants principaux
- [x] API backend
- [x] Authentification

### Phase 2 🚧 (En cours)
- [ ] Formulaires de création/édition
- [ ] Validation avancée
- [ ] Tests automatisés
- [ ] Documentation utilisateur

### Phase 3 📋 (Planifiée)
- [ ] Notifications en temps réel
- [ ] Export de données (PDF, Excel)
- [ ] Application mobile
- [ ] Intégration IoT (capteurs)

## 🤝 Contribution

### Standards de Code
- **TypeScript** : Typage strict
- **ESLint** : Règles de qualité
- **Prettier** : Formatage automatique
- **Conventional Commits** : Messages de commit

### Documentation
- **Code** : Commentaires JSDoc
- **API** : Swagger/OpenAPI
- **Architecture** : Diagrammes et schémas
- **Utilisateur** : Guides et tutoriels

---

**PigeonFarm** - Une solution complète pour la gestion moderne d'élevage de pigeons 🐦 