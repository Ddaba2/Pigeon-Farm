# PigeonFarm Backend

Backend API pour l'application de gestion d'élevage de pigeons.

## Prérequis

- Node.js (version 16 ou supérieure)
- MySQL Server
- npm ou yarn

## Installation

### 1. Configuration de la base de données

Assurez-vous que MySQL est démarré, puis exécutez :

```bash
# Créer la base de données et les tables
node init-database.js
```

Ou utilisez le script de configuration automatique :

```bash
# Configuration complète (base de données + admin)
npm run setup
```

### 2. Configuration des variables d'environnement

Copiez le fichier `env.example` en `config.env` et modifiez les valeurs selon votre configuration :

```bash
cp env.example config.env
```

Variables importantes :
- `DB_HOST` : Hôte de la base de données (défaut: localhost)
- `DB_USER` : Utilisateur MySQL (défaut: root)
- `DB_PASSWORD` : Mot de passe MySQL (défaut: vide)
- `DB_NAME` : Nom de la base de données (défaut: pigeon_manager)
- `PORT` : Port du serveur (défaut: 3002)

### 3. Installation des dépendances

```bash
npm install
```

### 4. Création de l'utilisateur administrateur

```bash
node create-admin-secure.js
```

## Démarrage

### Mode développement

```bash
npm run dev
```

### Mode production

```bash
npm start
```

## Scripts disponibles

- `npm start` : Démarre le serveur
- `npm run dev` : Démarre le serveur en mode développement avec rechargement automatique
- `npm run setup` : Configure la base de données et crée l'administrateur
- `npm run users:list` : Liste les utilisateurs
- `npm run users:clear` : Supprime les utilisateurs de test
- `npm run users:delete` : Supprime un utilisateur spécifique

## Structure de la base de données

Le schéma de la base de données est défini dans `db_schema.sql` et comprend les tables suivantes :

- `users` : Gestion des utilisateurs
- `couples` : Gestion des couples de pigeons
- `eggs` : Suivi des œufs
- `pigeonneaux` : Gestion des pigeonneaux
- `healthRecords` : Suivi de la santé
- `sales` : Gestion des ventes
- `password_reset_codes` : Codes de réinitialisation de mot de passe
- `notifications` : Notifications (futures fonctionnalités)
- `audit_logs` : Logs d'audit (futures fonctionnalités)

## Sécurité

- Mots de passe hachés avec bcrypt
- Validation des entrées
- Protection CSRF
- Limitation des requêtes
- Headers de sécurité (Helmet)
- Authentification par session
- Support OAuth Google

## API Endpoints

- `/api/auth/*` : Authentification
- `/api/oauth/*` : Authentification Google OAuth
- `/api/users/*` : Gestion des utilisateurs
- `/api/couples/*` : Gestion des couples
- `/api/eggs/*` : Suivi des œufs
- `/api/pigeonneaux/*` : Gestion des pigeonneaux
- `/api/health-records/*` : Suivi de la santé
- `/api/statistics/*` : Statistiques
- `/api/sales/*` : Gestion des ventes
- `/api/admin/*` : Administration

## Dépannage

### Problèmes de connexion à la base de données

1. Vérifiez que MySQL est démarré
2. Vérifiez les identifiants dans `config.env`
3. Vérifiez que la base de données `pigeon_manager` existe

### Problèmes de démarrage

1. Vérifiez les logs dans la console
2. Assurez-vous que tous les ports sont disponibles
3. Vérifiez les dépendances avec `npm install`

## Contribution

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence ISC.

## Contact

PigeonFarm Team - contactpigeonfarm@gmail.com

© 2025 PigeonFarm Team - Tous droits réservés