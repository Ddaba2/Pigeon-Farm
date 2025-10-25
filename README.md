# 🐦 PigeonFarm - Application de Gestion d'Élevage de Pigeons

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

**Une solution complète et professionnelle pour la gestion d'élevage de pigeons**

[Fonctionnalités](#-fonctionnalités) • [Installation](#-installation) • [Configuration](#-configuration) • [Utilisation](#-utilisation) • [Structure](#-structure-du-projet)

</div>

---

## 📋 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies utilisées](#-technologies-utilisées)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Démarrage](#-démarrage)
- [Structure du projet](#-structure-du-projet)
- [API](#-api)
- [Base de données](#-base-de-données)
- [Sécurité](#-sécurité)
- [Accès administrateur](#-accès-administrateur)
- [Développement](#-développement)
- [Support](#-support)

---

## 🌟 À propos

**PigeonFarm** est une application web moderne et complète conçue pour faciliter la gestion professionnelle d'un élevage de pigeons. Elle permet aux éleveurs de suivre leurs couples reproducteurs, les pontes, les pigeonneaux, la santé des oiseaux, les ventes et de générer des statistiques détaillées.

### Public cible
- Éleveurs professionnels de pigeons
- Fermes spécialisées
- Amateurs passionnés par l'élevage

---

## ✨ Fonctionnalités

### 🎯 Core Features

#### 1. **Gestion des Couples**
- Création et suivi des couples reproducteurs
- Numérotation des nids
- Suivi des races
- Historique des formations
- Statut actif/inactif

#### 2. **Suivi des Œufs**
- Enregistrement des dates de ponte
- Suivi de l'éclosion
- Taux de réussite
- Observations détaillées

#### 3. **Gestion des Pigeonneaux**
- Suivi depuis la naissance jusqu'à la vente
- Enregistrement du sexe et du poids
- Dates de sevrage
- Statut (vivant, vendu, décédé)
- Informations sur les ventes

#### 4. **Suivi Sanitaire**
- Enregistrement des traitements médicaux
- Rappels de vaccinations
- Historique médical complet
- Suivi par type d'animal

#### 5. **Gestion des Ventes**
- Enregistrement des transactions
- Calcul automatique des montants
- Historique client
- Statistiques de revenus

#### 6. **Statistiques & Rapports**
- Tableau de bord en temps réel
- Tendances d'élevage
- Graphiques interactifs
- Export PDF

### 🔐 Sécurité & Authentification

- **Authentification locale** avec mot de passe sécurisé (bcrypt)
- **OAuth Google** pour connexion rapide
- **Gestion de session** sécurisée
- **Rôles utilisateurs** (admin/user)
- **Récupération de mot de passe** par email
- **CSRF Protection**

### 👨‍💼 Administration

- Gestion des utilisateurs
- Suivi des activités
- Tableaux de bord avancés
- Métriques détaillées
- Tendances et analyses

### 🔔 Notifications

- Alertes pour vaccinations à venir
- Notifications de ventes
- Rappels personnalisés
- Paramètres configurables

### 🎨 Interface Utilisateur

- **Design moderne** et responsive
- **Mode sombre/clair**
- **Accessibilité** améliorée
- **Raccourcis clavier**
- **Interface intuitive**

---

## 🛠 Technologies utilisées

### Frontend
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Vite** - Build tool moderne
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Icônes
- **React Router** - Navigation
- **jsPDF** - Export PDF
- **Socket.io Client** - Communication temps réel

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MySQL** - Base de données relationnelle
- **Passport.js** - Authentification
- **Bcrypt** - Hachage de mots de passe
- **Nodemailer** - Envoi d'emails
- **Express Session** - Gestion de sessions
- **Helmet** - Sécurité HTTP
- **CORS** - Cross-Origin Resource Sharing

---

## 📦 Prérequis

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MySQL** >= 8.0.0
- **Git** (optionnel)

---

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/votre-repo/Pigeon-Farm.git
cd Pigeon-Farm
```

### 2. Installer les dépendances

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd backend
npm install
cd ..
```

### 3. Créer la base de données

```bash
# Connectez-vous à MySQL
mysql -u root -p

# Créez la base de données
CREATE DATABASE pigeon_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 4. Exécuter le schéma de base de données

```bash
cd backend
mysql -u root -p pigeon_manager < db_schema.sql
cd ..
```

---

## ⚙️ Configuration

### Configuration Backend

Copiez le fichier `backend/env.example` vers `backend/config.env` :

```bash
cd backend
cp env.example config.env
```

Éditez `backend/config.env` avec vos informations :

```env
# Configuration de la base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=pigeon_manager
DB_PORT=3306

# Configuration des emails SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app

# Configuration du serveur
PORT=3002
NODE_ENV=development

# URLs du frontend
FRONTEND_URL=http://localhost:5174
FRONTEND_SUCCESS_URI=http://localhost:5174/oauth/success
FRONTEND_ERROR_URI=http://localhost:5174/oauth/error

# Configuration Google OAuth
GOOGLE_CLIENT_ID=votre-google-client-id
GOOGLE_CLIENT_SECRET=votre-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3002/api/oauth/google/callback

# Sécurité
COOKIE_SECRET=votre-secret-cookie-super-securise
SESSION_SECRET=votre-secret-session-super-securise
```

### Configuration Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet
3. Activez l'API Google+
4. Créez des identifiants OAuth 2.0
5. Ajoutez les URI de redirection autorisés :
   - `http://localhost:3002/api/oauth/google/callback`
   - `http://localhost:5174/oauth/success`
   - `http://localhost:5174/oauth/error`

---

## 🎬 Démarrage

### Mode Développement

#### Démarrage complet (Frontend + Backend)
```bash
npm run dev:full
```

#### Démarrage séparé

**Backend uniquement :**
```bash
cd backend
npm start
```

**Frontend uniquement :**
```bash
npm run dev
```

### Accès à l'application

- **Frontend** : http://localhost:5174
- **Backend API** : http://localhost:3002

### Production

```bash
# Build du frontend
npm run build

# Démarrer le backend
cd backend
npm start
```

---

## 📁 Structure du projet

```
Pigeon-Farm/
├── backend/                      # API Backend
│   ├── config/                   # Configuration
│   │   ├── config.js            # Configuration principale
│   │   ├── database.js          # Connexion MySQL
│   │   └── passport.js          # Configuration Passport
│   ├── middleware/              # Middlewares Express
│   │   ├── auth.js             # Authentification
│   │   └── security.js        # Sécurité
│   ├── routes/                  # Routes API
│   │   ├── auth.js            # Authentification
│   │   ├── couples.js         # Couples
│   │   ├── eggs.js            # Œufs
│   │   ├── pigeonneaux.js     # Pigeonneaux
│   │   ├── health.js          # Santé
│   │   ├── sales.js           # Ventes
│   │   ├── statistics.js      # Statistiques
│   │   └── admin.js           # Administration
│   ├── services/               # Services métier
│   ├── migrations/             # Migrations SQL
│   ├── utils/                  # Utilitaires
│   ├── db_schema.sql           # Schéma de base de données
│   ├── index.js                # Point d'entrée
│   └── package.json
│
├── src/                         # Frontend React
│   ├── components/              # Composants React
│   │   ├── Dashboard.tsx       # Tableau de bord
│   │   ├── CouplesManagement.tsx
│   │   ├── EggTracking.tsx
│   │   ├── PigeonnalManagement.tsx
│   │   ├── HealthTracking.tsx
│   │   ├── Statistics.tsx
│   │   ├── AdminPanel.tsx
│   │   └── ...
│   ├── hooks/                   # Hooks personnalisés
│   ├── services/                # Services frontend
│   ├── types/                   # Types TypeScript
│   ├── utils/                   # Utilitaires
│   ├── App.tsx                  # Composant principal
│   └── main.tsx                 # Point d'entrée
│
├── public/                      # Fichiers statiques
├── package.json                 # Dépendances frontend
└── README.md                    # Ce fichier
```

---

## 🌐 API

### Endpoints principaux

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/verify-session` - Vérification de session
- `POST /api/auth/forgot-password` - Récupération de mot de passe
- `POST /api/auth/reset-password` - Réinitialisation de mot de passe

#### OAuth
- `GET /api/oauth/google` - Connexion Google
- `GET /api/oauth/google/callback` - Callback Google

#### Couples
- `GET /api/couples` - Liste des couples
- `POST /api/couples` - Créer un couple
- `PUT /api/couples/:id` - Modifier un couple
- `DELETE /api/couples/:id` - Supprimer un couple

#### Œufs
- `GET /api/eggs` - Liste des œufs
- `POST /api/eggs` - Créer un enregistrement d'œuf
- `PUT /api/eggs/:id` - Modifier un enregistrement
- `DELETE /api/eggs/:id` - Supprimer un enregistrement

#### Pigeonneaux
- `GET /api/pigeonneaux` - Liste des pigeonneaux
- `POST /api/pigeonneaux` - Créer un pigeonneau
- `PUT /api/pigeonneaux/:id` - Modifier un pigeonneau
- `DELETE /api/pigeonneaux/:id` - Supprimer un pigeonneau

#### Santé
- `GET /api/health` - Liste des enregistrements santé
- `POST /api/health` - Créer un enregistrement
- `PUT /api/health/:id` - Modifier un enregistrement
- `DELETE /api/health/:id` - Supprimer un enregistrement

#### Ventes
- `GET /api/sales` - Liste des ventes
- `POST /api/sales` - Créer une vente
- `PUT /api/sales/:id` - Modifier une vente
- `DELETE /api/sales/:id` - Supprimer une vente

#### Statistiques
- `GET /api/statistics` - Statistiques globales
- `GET /api/statistics/health` - Statistiques santé
- `GET /api/statistics/revenue` - Statistiques revenus

#### Administration
- `GET /api/admin/users` - Liste des utilisateurs
- `GET /api/admin/metrics` - Métriques administration
- `GET /api/admin/trends` - Tendances

---

## 🗄 Base de données

### Tables principales

- **users** - Utilisateurs de l'application
- **couples** - Couples de pigeons reproducteurs
- **eggs** - Enregistrements d'œufs
- **pigeonneaux** - Jeunes pigeons
- **healthRecords** - Enregistrements sanitaires
- **sales** - Transactions de vente
- **sessions** - Sessions utilisateurs
- **notifications** - Notifications
- **password_reset_codes** - Codes de réinitialisation

### Schéma complet

Voir `backend/db_schema.sql` pour le schéma complet de la base de données.

---

## 🔒 Sécurité

### Mesures de sécurité implémentées

- ✅ **Hachage bcrypt** pour les mots de passe
- ✅ **CSRF Protection** via tokens
- ✅ **Helmet.js** pour les headers de sécurité
- ✅ **Rate limiting** sur les endpoints sensibles
- ✅ **Validation** des entrées utilisateur
- ✅ **CORS** configuré correctement
- ✅ **Sessions sécurisées** avec HttpOnly cookies
- ✅ **HTTPS** recommandé en production

### Recommandations de production

1. Utilisez HTTPS avec un certificat SSL valide
2. Configurez des variables d'environnement sécurisées
3. Activez le logging des erreurs
4. Configurez des sauvegardes automatiques de la base de données
5. Activez le rate limiting
6. Utilisez un proxy inversé (Nginx)

---

## 👨‍💼 Accès administrateur

### Créer un compte administrateur

```bash
cd backend
node create-admin-secure.js
```

Suivez les instructions pour créer un compte administrateur.

### Permissions administrateur

- Gestion complète des utilisateurs
- Accès aux statistiques globales
- Visualisation des tendances
- Métriques détaillées
- Gestion des profils utilisateurs

---

## 💻 Développement

### Scripts disponibles

#### Frontend
```bash
npm run dev              # Démarrer le serveur de développement
npm run build            # Build de production
npm run preview          # Prévisualiser le build
npm run lint             # Linter le code
```

#### Backend
```bash
npm start                # Démarrer le serveur
npm run dev              # Mode développement avec nodemon
npm run setup            # Configuration initiale
npm run verify:setup     # Vérifier la configuration
```

### Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📧 Support

Pour toute question ou problème :

- **Email** : support@pigeonfarm.com
- **Documentation** : Disponible dans l'application via le menu Aide
- **Issues** : [GitHub Issues](https://github.com/votre-repo/Pigeon-Farm/issues)

---

## 📄 Licence

Ce projet est sous licence ISC.

---

## 🙏 Remerciements

- **Lucide** pour les icônes
- **Tailwind CSS** pour le framework CSS
- **Express** pour le framework backend
- **MySQL** pour la base de données

---

<div align="center">

**Fait avec ❤️ pour les éleveurs de pigeons**

🐦 **PigeonFarm** - Gérez votre élevage en toute simplicité

</div>

