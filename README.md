# PigeonFarm – Gestion d’élevage de pigeons

## Présentation

PigeonFarm est une application web de gestion d’élevage de pigeons : suivi des couples, œufs, pigeonneaux, santé, utilisateurs, etc.

---

## Prérequis

- Node.js (v18 ou supérieur recommandé)
- npm (v7 ou supérieur)
- MySQL/MariaDB

---

## Installation

1. **Clone le dépôt**
   ```bash
   git clone <url-du-repo>
   cd <nom-du-dossier>
   ```

2. **Installe les dépendances**
   ```bash
   npm install
   cd backend
   npm install
   ```

3. **Configure la base de données**
   - Crée une base de données MySQL nommée `pigeon_manager` (ou adapte le nom dans `.env`)
   - Exécute le script `backend/db_schema.sql` pour créer les tables

4. **Configure les variables d’environnement**
   - Copie le fichier `.env.example` en `.env` dans le dossier `backend`
   - Renseigne les valeurs (voir ci-dessous)

---

## Fichier `.env.example` (à placer dans `backend/`)

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pigeon_manager
DB_PORT=3306
PORT=3001

JWT_SECRET=un_secret_pour_jwt
```

---

## Lancement

### Backend

```bash
cd backend
node index.js
```

### Frontend

```bash
npm run dev
```
(ou selon ton outil, ex : `vite`, `react-scripts start`, etc.)

---

## Scripts utiles

- `npm run lint` – Vérifie la qualité du code (ESLint)
- `npm run format` – Formate le code (Prettier)

---

## Fonctionnalités principales

- Authentification JWT (inscription, connexion, mot de passe oublié)
- Gestion des couples, œufs, pigeonneaux, santé
- Historique des connexions
- Profil utilisateur (modification/suppression)
- Interface moderne et responsive

---

## Contribution

1. Fork le projet
2. Crée une branche (`git checkout -b feature/ma-feature`)
3. Commits tes modifications (`git commit -am 'Ajout de ma feature'`)
4. Push la branche (`git push origin feature/ma-feature`)
5. Ouvre une Pull Request

---

## Licence

MIT

---

## Aide

Pour toute question, ouvre une issue ou contacte l’auteur. 