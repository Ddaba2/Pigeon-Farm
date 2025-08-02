-- Création de la base de données
CREATE DATABASE IF NOT EXISTS pigeon_manager DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pigeon_manager;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user'
);

-- Table des couples
CREATE TABLE IF NOT EXISTS couples (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nestNumber VARCHAR(50) NOT NULL,
    race VARCHAR(100) NOT NULL,
    formationDate DATE,
    maleId VARCHAR(50),
    femaleId VARCHAR(50),
    observations TEXT,
    status VARCHAR(50) DEFAULT 'active'
);

-- Table des œufs
CREATE TABLE IF NOT EXISTS eggs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupleId INT NOT NULL,
    egg1Date DATE NOT NULL,
    egg2Date DATE,
    hatchDate1 DATE,
    hatchDate2 DATE,
    success1 BOOLEAN DEFAULT FALSE,
    success2 BOOLEAN DEFAULT FALSE,
    observations TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupleId) REFERENCES couples(id) ON DELETE CASCADE
);

-- Table des pigeonneaux
CREATE TABLE IF NOT EXISTS pigeonneaux (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupleId INT NOT NULL,
    eggRecordId INT NOT NULL,
    birthDate DATE NOT NULL,
    sex ENUM('male','female','unknown') DEFAULT 'unknown',
    weight INT,
    weaningDate DATE,
    status ENUM('alive','sold','dead') DEFAULT 'alive',
    salePrice INT,
    saleDate DATE,
    buyer VARCHAR(255),
    observations TEXT,
    FOREIGN KEY (coupleId) REFERENCES couples(id) ON DELETE CASCADE,
    FOREIGN KEY (eggRecordId) REFERENCES eggs(id) ON DELETE CASCADE
);

-- Table des enregistrements de santé
CREATE TABLE IF NOT EXISTS healthRecords (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    targetType VARCHAR(50) NOT NULL,
    targetId INT,
    product VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    nextDue DATE,
    observations TEXT
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    userId INT,
    entityType VARCHAR(50),
    entityId INT,
    isRead BOOLEAN DEFAULT FALSE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);

-- Table des logs d'audit
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity VARCHAR(50) NOT NULL,
    entityId INT NOT NULL,
    action ENUM('create', 'update', 'delete') NOT NULL,
    userId INT,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount DECIMAL(10,2) NOT NULL,
  description VARCHAR(255),
  client VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

-- Table des codes de réinitialisation de mot de passe
CREATE TABLE IF NOT EXISTS password_reset_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(4) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
); 

---

## Vérification à faire

1. **Vérifie l’id de chaque utilisateur**
   ```sql
   SELECT id, username FROM users;
   ```
   → Note bien l’id de chaque utilisateur.

2. **Vérifie le champ `userId` dans les tables**
   Par exemple, pour les couples :
   ```sql
   SELECT * FROM couples;
   ```
   → Vérifie que chaque couple a bien un `userId` correspondant à l’id du bon utilisateur.

3. **Vérifie le code backend**
   - Lors de la création d’une donnée (POST), le code doit faire :
     ```js
     const userId = req.user.id;
     // ... INSERT INTO ... userId ...
     ```
   - Lors de la lecture (GET), le code doit faire :
     ```js
     const userId = req.user.id;
     SELECT ... WHERE userId = ?
     ```

---

## Causes fréquentes

- **userId non renseigné lors de l’INSERT**  
  → Toutes les données sont créées avec `userId = NULL`, donc visibles par tous si le filtre SQL n’est pas strict.

- **userId mal récupéré (ex : hardcodé, ou récupéré du mauvais endroit)**

- **Requêtes SQL qui ne filtrent pas strictement**  
  → Par exemple, `WHERE userId = ? OR userId IS NULL` (ce qui est à éviter).

---

## Solution

### 1. **Corrige le code backend**
- Vérifie que chaque création de donnée (POST) utilise bien `userId: req.user.id` dans l’INSERT.
- Vérifie que chaque lecture (GET) utilise bien `WHERE userId = ?`.

### 2. **Nettoie la base**
- Supprime toutes les données où `userId IS NULL` ou `userId` ne correspond à aucun utilisateur existant.

### 3. **Teste**
- Crée un utilisateur, connecte-toi, crée une donnée.
- Crée un deuxième utilisateur, connecte-toi : il ne doit rien voir.
- Crée une donnée avec le deuxième utilisateur : il ne doit voir que la sienne.

---

## Requête SQL pour vérifier les userId

```sql
SELECT * FROM couples WHERE userId IS NULL OR userId NOT IN (SELECT id FROM users);
SELECT * FROM eggs WHERE userId IS NULL OR userId NOT IN (SELECT id FROM users);
SELECT * FROM pigeonneaux WHERE userId IS NULL OR userId NOT IN (SELECT id FROM users);
SELECT * FROM sales WHERE userId IS NULL OR userId NOT IN (SELECT id FROM users);
SELECT * FROM healthRecords WHERE userId IS NULL OR userId NOT IN (SELECT id FROM users);
SELECT * FROM notifications WHERE userId IS NULL OR userId NOT IN (SELECT id FROM users);
```

---

**Si tu veux, je peux t’aider à corriger le code backend pour forcer l’insertion du bon userId à chaque création de donnée.  
Veux-tu que je vérifie ou corrige un fichier précis ?** 

---

## 1. **Vérification de la gestion du token côté frontend**

### a) **Stockage du token**
- Le token JWT doit être stocké après la connexion (login) dans le localStorage ou sessionStorage.
- Exemple typique dans le frontend React :
  ```js
  localStorage.setItem('token', token);
  ```

### b) **Envoi du token dans les requêtes**
- Toutes les requêtes vers l’API doivent inclure le token dans le header `Authorization` :
  ```js
  fetch('/api/couples', {
    headers: {
      'Authorization': 'Bearer ' + token,
      // ...
    }
  })
  ```
- Vérifie dans ton utilitaire d’API (`src/utils/api.ts` ou équivalent) que le header est bien ajouté à chaque requête.

### c) **Changement d’utilisateur**
- Lors de la déconnexion, le token doit être supprimé du stockage.
- Lors de la connexion d’un nouvel utilisateur, le nouveau token doit remplacer l’ancien.

---

## 2. **Test complet étape par étape**

### a) **Nettoyage de la base**
- Supprime toutes les données des tables concernées (couples, eggs, pigeonneaux, sales, healthRecords, notifications).

### b) **Création de deux utilisateurs**
1. Inscris-toi avec un premier compte (ex : user1).
2. Inscris-toi avec un deuxième compte (ex : user2).

### c) **Connexion et création de données**
1. Connecte-toi avec user1.
   - Crée un couple, une ponte, une vente, etc.
   - Vérifie que tu vois bien ces données.
2. Déconnecte-toi (supprime le token du stockage).
3. Connecte-toi avec user2.
   - Tu ne dois voir aucune donnée.
   - Crée un couple, une vente, etc.
   - Vérifie que tu ne vois que tes propres données.

### d) **Vérification dans la base**
- Vérifie que chaque donnée créée a bien le bon `userId` (correspondant à l’id de l’utilisateur connecté).

---

## 3. **À vérifier dans le code frontend**

- Dans `src/utils/api.ts` (ou équivalent), tu dois avoir quelque chose comme :
  ```js
  export async function apiFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : undefined,
    };
    // ...
  }
  ```
- À chaque login, le token doit être mis à jour dans le stockage.

---

## 4. **Si tu veux un test automatisé**
Je peux te donner un script de test (Postman/curl) pour simuler ces étapes.

---

**Veux-tu que je vérifie le contenu de ton fichier `src/utils/api.ts` ou que je te donne un script de test automatisé pour valider le comportement ?**  
Ou veux-tu un guide pour vérifier le stockage et l’envoi du token dans le navigateur ? 

---

### 1. **Stockage du token**

- Le token est stocké via `safeLocalStorage.setItem('token', token)` (utilise localStorage si disponible, sinon un fallback mémoire).
- Pour le récupérer, le code fait :  
  ```js
  const token = safeLocalStorage.getItem('token');
  ```
- À la déconnexion, il faut appeler `safeLocalStorage.removeItem('token')` pour supprimer le token.

---

### 2. **Envoi du token dans les requêtes**

- Dans `src/utils/api.ts`, chaque appel à `apiFetch` ajoute le header `Authorization: Bearer <token>` si le token est présent :
  ```js
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  ```
- Toutes les requêtes API passent donc bien le token JWT du user connecté.

---

### 3. **À vérifier dans l’application**

- **Après connexion** :  
  - Ouvre l’onglet Application/Stockage de ton navigateur (F12 > Application > Stockage local).
  - Vérifie que la clé `token` est bien présente dans le localStorage.
- **À chaque requête API** :  
  - Ouvre l’onglet Réseau (F12 > Réseau/Network).
  - Clique sur une requête vers `/api/` (ex : `/api/couples`).
  - Vérifie dans l’onglet Headers que tu as bien :
    ```
    Authorization: Bearer <ton_token>
    ```

---

### 4. **Changement d’utilisateur**

- Lors de la déconnexion, le token doit être supprimé du stockage.
- Lors de la connexion d’un nouvel utilisateur, le nouveau token doit remplacer l’ancien.

---

### 5. **Conseil**

- Si tu utilises plusieurs onglets ou fenêtres, recharge bien la page après chaque connexion/déconnexion pour éviter d’utiliser un ancien token en mémoire.

---

**Conclusion** :  
Le code frontend gère correctement le stockage et l’envoi du token.  
Si tu constates que le mauvais utilisateur est utilisé, c’est probablement que le token n’est pas mis à jour/supprimé correctement lors du changement de compte.

---

**Veux-tu un guide pour tester tout ça en live dans le navigateur, ou as-tu un cas précis où le token ne change pas ?** 

---

### 1. **Le champ userId n’est pas bien renseigné lors de la création**
- Si, lors de l’INSERT, le champ `userId` est NULL ou incorrect, les données ne sont pas isolées.
- **À vérifier** :  
  ```sql
  SELECT id, userId FROM couples;
  SELECT id, userId FROM eggs;
  SELECT id, userId FROM pigeonneaux;
  SELECT id, userId FROM sales;
  SELECT id, userId FROM healthRecords;
  SELECT id, userId FROM notifications;
  ```
  → Les nouvelles lignes doivent avoir un `userId` qui correspond à l’id de l’utilisateur connecté.

---

### 2. **Le backend ne filtre pas strictement sur userId**
- Toutes les requêtes de lecture doivent faire `WHERE userId = ?`.
- **À vérifier** :  
  - Si tu as modifié le code, assure-toi que ce filtre est bien présent partout.

---

### 3. **Le token JWT n’est pas mis à jour lors du changement d’utilisateur**
- Si tu ne fais pas de déconnexion propre, le token du premier utilisateur reste en mémoire/localStorage.
- **À vérifier** :  
  - Après chaque connexion, le token dans le localStorage doit changer.
  - Dans l’onglet Réseau, le header Authorization doit correspondre au bon utilisateur.

---

### 4. **La base contient des données avec userId NULL ou partagé**
- Si tu as des données avec `userId IS NULL` ou le même userId pour plusieurs utilisateurs, elles seront visibles par tous (selon le filtre SQL).

---

### 5. **Le frontend utilise un cache local**
- Si tu utilises un cache local (localStorage, IndexedDB, etc.), il peut y avoir des données persistantes non liées à l’utilisateur connecté.

---

## **Ce que tu dois faire maintenant (diagnostic rapide) :**

1. **Vérifie dans la base**  
   - Exécute :
     ```sql
     SELECT * FROM couples;
     SELECT * FROM users;
     ```
   - Vérifie que chaque couple a bien un userId qui correspond à un utilisateur unique.

2. **Teste la création de données**  
   - Connecte-toi avec user1, crée un couple.
   - Déconnecte-toi, connecte-toi avec user2, crée un couple.
   - Vérifie dans la base que chaque couple a le bon userId.

3. **Vérifie le token dans le navigateur**  
   - Après chaque connexion, vérifie que le token change dans le localStorage.
   - Dans l’onglet Réseau, vérifie que le header Authorization correspond au bon utilisateur.

---

## **Si tu veux, je peux t’aider à faire ce diagnostic en direct :**
- Donne-moi le résultat de :
  ```sql
  SELECT * FROM users;
  SELECT * FROM couples;
  ```
- Ou, décris-moi ce que tu vois dans le localStorage et dans les requêtes réseau.

---

**En résumé** :  
Le problème est soit dans la base (userId mal renseigné), soit dans le token (mauvais utilisateur envoyé), soit dans le code backend (filtre SQL absent).  
Dis-moi ce que tu observes dans la base et dans le navigateur, et je t’aide à corriger ! 

---

L’erreur :  
```
#1054 - Champ 'userId' inconnu dans field list
```
signifie que la colonne `userId` n’existe pas dans la table `couples`.

---

## Pourquoi c’est un problème ?

- **Sans colonne `userId`**, il est impossible d’isoler les données par utilisateur.
- Toutes les requêtes SQL du backend qui filtrent par `userId` ne fonctionneront pas correctement.
- C’est la cause principale pour laquelle les utilisateurs voient les données des autres.

---

## Solution immédiate

### 1. **Ajoute la colonne `userId` dans toutes les tables concernées**

Exécute ces requêtes SQL dans ta base :

```sql
ALTER TABLE couples ADD COLUMN userId INT;
ALTER TABLE eggs ADD COLUMN userId INT;
ALTER TABLE pigeonneaux ADD COLUMN userId INT;
ALTER TABLE sales ADD COLUMN userId INT;
ALTER TABLE healthRecords ADD COLUMN userId INT;
ALTER TABLE notifications ADD COLUMN userId INT;
```

---

### 2. **Vérifie que le backend renseigne bien ce champ lors de chaque création de donnée**
- Toutes les routes POST doivent faire :  
  ```js
  const userId = req.user.id;
  // ... INSERT INTO ... userId ...
  ```

---

### 3. **Nettoie les anciennes données**
- Après avoir ajouté la colonne, supprime ou mets à jour les anciennes données pour qu’elles aient le bon `userId`.

---

### 4. **Teste à nouveau**
- Crée deux utilisateurs, connecte-toi avec chacun, crée des données, et vérifie que chaque donnée a le bon `userId`.

---

**C’est la clé pour garantir la confidentialité des données utilisateur.  
Fais cette modification SQL, puis refais le test.  
Si tu veux, je peux t’aider à écrire les requêtes de migration ou de nettoyage après l’ajout de la colonne.** 

---

Voici les raisons les plus courantes pour lesquelles, dans une application, l'utilisateur 1 peut accéder aux données de l'utilisateur 2 :

---

### 1. **Absence de vérification d'identité dans les routes**
Si, dans tes routes (API), tu ne vérifies pas que l'utilisateur connecté est bien le propriétaire de la donnée demandée, n'importe qui peut accéder à n'importe quelle donnée en changeant l'identifiant dans la requête.

**Exemple de faille :**
```js
// Mauvais exemple
app.get('/user/:id', (req, res) => {
  User.findById(req.params.id).then(user => res.json(user));
});
```
Ici, n'importe quel utilisateur peut accéder à n'importe quel `id`.

---

### 2. **Absence ou mauvaise utilisation de middleware d'authentification/autorisation**
Si tu n'utilises pas de middleware pour vérifier que l'utilisateur est authentifié et autorisé à accéder à la ressource, il n'y a aucune barrière de sécurité.

**Exemple de faille :**
- Pas de `authMiddleware` ou de vérification de rôle/identité avant d'accéder à la ressource.

---

### 3. **Endpoints trop permissifs**
Si tes endpoints retournent toutes les données sans filtrer par l'utilisateur connecté, tout le monde peut tout voir.

---

### 4. **Manque de filtrage côté base de données**
Si tu ne filtres pas les requêtes par l'identifiant de l'utilisateur connecté (`userId`), tu risques de retourner des données d'autres utilisateurs.

---

## **Comment corriger ?**

### 1. **Vérification systématique de l'identité**
Dans chaque route qui retourne ou modifie des données utilisateur, vérifie que l'utilisateur connecté est bien le propriétaire de la donnée :
```js
// Bon exemple
app.get('/user/:id', authMiddleware, (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: "Accès interdit" });
  }
  User.findById(req.params.id).then(user => res.json(user));
});
```

### 2. **Utiliser un middleware d'authentification**
Ajoute un middleware qui vérifie le token ou la session de l'utilisateur avant d'accéder à la logique métier :
```js
function authMiddleware(req, res, next) {
  // Vérifie le token, récupère l'utilisateur, etc.
  // Ajoute l'utilisateur à req.user
  next();
}
```

### 3. **Filtrer les requêtes par l'utilisateur connecté**
Quand tu fais une requête à la base de données, utilise toujours l'identifiant de l'utilisateur connecté :
```js
User.findOne({ _id: req.params.id, owner: req.user.id })
```

---

**Si tu veux une analyse précise de ton code, je peux lire tes fichiers de routes et middlewares pour te dire exactement où se trouve la faille. Veux-tu que je continue et que je te montre l'endroit précis à corriger ?** 

---

## 1. **Script de test automatisé (exemple avec curl)**

Ce script simule deux utilisateurs, crée des données, et vérifie l’isolation :

```bash
<code_block_to_apply_changes_from>
```
> **Remarque** : Adapte les routes selon ton API réelle (`/api/couples`, `/api/login`, etc.).

---

## 2. **Audit du frontend (gestion du token)**

- **Après chaque connexion**, vérifie dans le localStorage que la clé `token` change.
- **À chaque requête API**, vérifie dans l’onglet Réseau que le header `Authorization` correspond bien au bon utilisateur.
- **À la déconnexion**, le token doit être supprimé du stockage.

---

## 3. **Nettoyage de la base**

- Supprime ou corrige toutes les lignes où `userId` est NULL ou incorrect (voir requêtes SQL précédentes).
- Vérifie que chaque donnée appartient bien à un utilisateur existant.

---

## 4. **Tests manuels**

- Crée des données avec deux comptes différents.
- Vérifie que chaque utilisateur ne voit que ses propres données dans l’interface.

---

## 5. **À faire si tu veux aller plus loin**

- **Automatiser ces tests** avec Postman, Jest, ou un autre outil de test d’API.
- **Ajouter des tests unitaires** côté backend pour chaque route sensible.
- **Mettre en place des logs d’audit** pour détecter toute tentative d’accès non autorisé.

---

**Dis-moi si tu veux un script Postman, un exemple de test Jest, ou un guide pour auditer le frontend en détail !** 

---

**Bonne nouvelle : la plupart de tes routes critiques filtrent déjà correctement par `userId` !**  
Voici le résumé et les points à surveiller pour garantir que chaque utilisateur ne voit que ses propres données :

---

## 1. **Résumé de l’audit**

- **couples.js, eggs.js, pigeonneaux.js, healthRecords.js, notifications.js, sales.js, statistics.js, exports.js**  
  → Toutes les requêtes SQL de lecture, modification et suppression utilisent bien `WHERE userId = ?` ou `AND userId = ?`  
  → À la création, le champ `userId` est bien renseigné avec `req.user.id`.

- **Les jointures (LEFT JOIN)** dans eggs, pigeonneaux, healthRecords sont aussi filtrées côté entité principale par `userId`.

---

## 2. **Points à surveiller/corriger**

- **Vérifie les autres routes** (par exemple, `users.js`, `actionLogs.js`, `auditLogs.js`, `backup.js`) si elles manipulent des données utilisateur (hors admin).
- **Vérifie la création des utilisateurs** : chaque utilisateur doit avoir un identifiant unique.
- **Vérifie le frontend** : il doit toujours utiliser le token JWT de l’utilisateur connecté.

---

## 3. **Correctif global à appliquer**

- **Pour chaque nouvelle route ou requête SQL** :  
  - Toujours ajouter `WHERE userId = ?` (ou `AND userId = ?` si d’autres conditions).
  - Toujours passer `req.user.id` en paramètre.
  - À la création, toujours insérer le champ `userId` avec la valeur de l’utilisateur connecté.

- **Exemple générique** :
  ```js
  // Lecture
  const userId = req.user.id;
  const [rows] = await pool.query('SELECT * FROM table WHERE userId = ?', [userId]);

  // Création
  await pool.query('INSERT INTO table (champ1, userId) VALUES (?, ?)', [champ1, userId]);

  // Modification
  await pool.query('UPDATE table SET champ1=? WHERE id=? AND userId=?', [champ1, id, userId]);

  // Suppression
  await pool.query('DELETE FROM table WHERE id=? AND userId=?', [id, userId]);
  ```

---

## 4. **Conseil supplémentaire**

- **Ajoute des tests** : connecte-toi avec deux utilisateurs différents, crée des données avec chacun, et vérifie que chacun ne voit que ses propres données.
- **Vérifie la base de données** : si tu as déjà des données partagées, il faudra corriger les `userId` à la main.

---

**Si tu veux, je peux aussi auditer les autres routes (users, logs, etc.) ou t’aider à écrire un script pour corriger les données existantes en base.**  
Veux-tu aller plus loin sur un point précis ? 

---

Très bonne question !  
Même après avoir sécurisé le code, **si tes utilisateurs continuent d’accéder aux mêmes données**, il y a généralement trois causes principales :

---

## 1. **Les données existantes en base ont le même `userId`**
- Si, lors de la création des données, le champ `userId` n’était pas correctement renseigné, toutes les données peuvent appartenir au même utilisateur (ou à aucun).
- **Conséquence** : Tous les utilisateurs voient les mêmes données, car le filtre `WHERE userId = ?` retourne tout (si `userId` est nul ou identique pour tous).

### Comment vérifier ?
Exécute cette requête SQL pour une table (exemple avec `couples`) :
```sql
SELECT id, userId FROM couples;
```
- Si tu vois le même `userId` partout (ou des valeurs nulles), c’est la cause du problème.

---

## 2. **Le middleware d’authentification ne met pas le bon `req.user.id`**
- Si le token JWT n’est pas bien généré ou décodé, ou si le frontend envoie toujours le même token, alors tous les utilisateurs sont vus comme le même utilisateur côté backend.
- **Conséquence** : Le backend croit que tous les utilisateurs sont la même personne.

### Comment vérifier ?
- Ajoute un log dans le middleware `auth.js` :
  ```js
  console.log('Utilisateur authentifié:', user);
  ```
- Connecte-toi avec deux comptes différents et regarde si l’ID change bien à chaque fois.

---

## 3. **Le frontend utilise le mauvais token**
- Si le frontend ne change pas de token lors du changement d’utilisateur, toutes les requêtes sont faites au nom du même utilisateur.

### Comment vérifier ?
- Ouvre les outils de développement de ton navigateur, regarde l’en-tête `Authorization` envoyé à chaque requête.
- Change d’utilisateur, vérifie que le token change.

---

## **Que faire pour corriger ?**

1. **Corrige les données existantes** :  
   - Mets à jour les champs `userId` dans chaque table pour qu’ils correspondent au bon utilisateur.
   - Exemple SQL :
     ```sql
     UPDATE couples SET userId = <bon_id> WHERE id = <id_du_couple>;
     ```

2. **Vérifie le middleware d’authentification** :  
   - Assure-toi que `req.user.id` correspond bien à l’utilisateur connecté.

3. **Vérifie le frontend** :  
   - Assure-toi que le token JWT change bien quand tu changes d’utilisateur.

---

### **Veux-tu que je t’aide à écrire un script pour corriger les données en base, ou à ajouter des logs pour diagnostiquer le middleware ?**
Dis-moi ce que tu préfères, ou partage-moi un exemple de données de ta base si tu veux une analyse directe ! 

---

-- Table des logs d'actions utilisateur
CREATE TABLE IF NOT EXISTS actionLogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
); 

---

Très bonne pratique : il faut toujours afficher des messages d’erreur clairs et conviviaux pour l’utilisateur, et **ne jamais révéler de détails techniques** (comme “token inconnu”, “invalid token”, etc.) dans l’interface utilisateur.

Voici comment adapter les messages d’erreur dans toute ton application :

---

## 1. **Backend – Adapter les messages d’erreur**

- **Connexion**  
  - Si l’email ou le mot de passe est incorrect :  
    ```json
    { "error": "Mot de passe ou email incorrect." }
    ```
  - Ne jamais préciser si c’est l’email ou le mot de passe qui est faux (pour éviter de donner des indices à un attaquant).

- **Token invalide ou expiré**  
  - Si le token JWT est manquant, invalide ou expiré, retourne :  
    ```json
    { "error": "Session expirée, veuillez vous reconnecter." }
    ```
  - **Ne jamais** afficher “token inconnu”, “invalid token”, etc.

- **Accès interdit**  
  - Si l’utilisateur tente d’accéder à une ressource qui ne lui appartient pas :  
    ```json
    { "error": "Accès interdit." }
    ```

- **Autres erreurs**  
  - Pour toute autre erreur inattendue, retourne un message générique :  
    ```json
    { "error": "Une erreur est survenue, veuillez réessayer." }
    ```

---

## 2. **Frontend – Afficher les messages à l’utilisateur**

- Affiche toujours le contenu du champ `error` de la réponse, mais **jamais d’objet d’erreur technique**.
- Si la réponse ne contient pas de champ `error`, affiche un message générique.

### **Exemple de gestion d’erreur dans React**
```js
try {
  // ... appel API ...
} catch (err) {
  const msg = err.response?.data?.error || "Une erreur est survenue, veuillez réessayer.";
  setError(msg);
}
```
```jsx
{error && <p style={{color: "red"}}>{error}</p>}
```

---

## 3. **À faire dans tout le backend**

- **Remplace tous les messages techniques** par des messages conviviaux.
- **Exemples à remplacer** :
  - “token inconnu”, “invalid token”, “jwt malformed”, “user not found”, etc.
- **À utiliser** :
  - “Mot de passe ou email incorrect.”
  - “Session expirée, veuillez vous reconnecter.”
  - “Accès interdit.”
  - “Une erreur est survenue, veuillez réessayer.”

---

## 4. **Exemple de modification dans le middleware d’authentification**
```js
<code_block_to_apply_changes_from>
```

---

## 5. **Résumé**

- **Jamais de message technique pour l’utilisateur**
- **Toujours un message simple, clair, et générique**
- **Pour la connexion** : “Mot de passe ou email incorrect.”
- **Pour le token** : “Session expirée, veuillez vous reconnecter.”
- **Pour l’accès interdit** : “Accès interdit.”
- **Pour toute autre erreur** : “Une erreur est survenue, veuillez réessayer.”

---

**Veux-tu que je t’aide à faire le tour de tes fichiers backend pour repérer et corriger tous les messages d’erreur ?  
Ou tu veux un exemple de code pour un fichier précis ?**

---

Très bonne précision :  
- Après 3 tentatives de connexion échouées, il faut **bloquer la page de login** (côté frontend) pendant 3 minutes (180 secondes), en plus du blocage côté backend.

Voici comment procéder :

---

## 1. **Côté Backend (API)**
- Après 3 échecs, la route `/login` doit répondre avec un code d’erreur (ex : 429) et un message indiquant le temps restant avant de pouvoir réessayer.
- Exemple de réponse :
  ```json
  {
    "error": "Trop de tentatives, réessayez plus tard.",
    "retryAfter": 180 // en secondes
  }
  ```

**À adapter dans le middleware :**
```js
if (attempt.count >= MAX_ATTEMPTS && now - attempt.lastTry < BLOCK_TIME) {
  const retryAfter = Math.ceil((BLOCK_TIME - (now - attempt.lastTry)) / 1000);
  return res.status(429).json({
    error: "Trop de tentatives, réessayez plus tard.",
    retryAfter
  });
}
```

---

## 2. **Côté Frontend (React ou autre)**

- Quand tu reçois une erreur 429 avec `retryAfter`, tu dois :
  1. **Désactiver le formulaire de login** (bouton désactivé, champs grisés)
  2. **Afficher un message** :  
     _"Trop de tentatives, réessayez dans 3 minutes !"_
  3. **Démarre un compte à rebours** (timer)
  4. **Réactiver le formulaire** quand le temps est écoulé

### **Exemple de logique React**
```jsx
<code_block_to_apply_changes_from>
```

---

## 3. **Résumé du flux**

1. **3 échecs** → backend bloque et renvoie `retryAfter`
2. **Frontend** désactive le formulaire et affiche le timer
3. **Après 3 minutes** → formulaire réactivé automatiquement

---

### **Veux-tu le code complet pour le backend, le frontend, ou les deux ?**  
Dis-moi ta stack frontend (React, Vue, autre) si tu veux un exemple adapté ! 

---

Voici un **état des lieux** des messages d’erreur dans tes principaux fichiers backend, avec des suggestions de correction pour qu’ils soient conviviaux et sécurisés :

---

## 1. **middleware/auth.js**
- **Actuel** :
  - `res.status(401).json({ error: 'Token manquant' });`
  - `res.status(403).json({ error: 'Token invalide' });`
- **À remplacer par** :
  - `res.status(401).json({ error: 'Session expirée, veuillez vous reconnecter.' });`

---

## 2. **middleware/roles.js**
- **Actuel** :
  - `res.status(403).json({ error: 'Accès refusé : rôle insuffisant' });`
- **À remplacer par** :
  - `res.status(403).json({ error: 'Accès interdit.' });`

---

## 3. **routes/auth.js**
- **Connexion** :
  - `res.status(401).json({ error: 'Utilisateur ou mot de passe incorrect' });`
  - **À remplacer par** :  
    `res.status(401).json({ error: 'Mot de passe ou email incorrect.' });`
- **Inscription** :
  - `res.status(400).json({ error: 'Email ou nom d’utilisateur déjà utilisé.' });` (OK)
- **Autres erreurs** :
  - `res.status(500).json({ error: err.message });`
  - **À remplacer par** :  
    `res.status(500).json({ error: 'Une erreur est survenue, veuillez réessayer.' });`
- **Code de réinitialisation, etc.** :  
  - `res.status(400).json({ error: 'Code invalide ou expiré.' });` (OK)
  - `res.status(404).json({ error: 'Utilisateur non trouvé' });`
  - **À remplacer par** :  
    `res.status(404).json({ error: 'Utilisateur non trouvé.' });`

---

## 4. **routes/users.js, couples.js, eggs.js, pigeonneaux.js**
- **Not found** :
  - `res.status(404).json({ error: 'Not found' });`
  - **À remplacer par** :  
    `res.status(404).json({ error: 'Ressource non trouvée.' });`
- **Accès refusé** :
  - `res.status(403).json({ error: 'Accès refusé' });`
  - **À remplacer par** :  
    `res.status(403).json({ error: 'Accès interdit.' });`
- **Erreur serveur** :
  - `res.status(500).json({ error: err.message });`
  - **À remplacer par** :  
    `res.status(500).json({ error: 'Une erreur est survenue, veuillez réessayer.' });`
- **Erreur de validation** :
  - `res.status(400).json({ error: ... });`  
    (À adapter selon le contexte, mais rester générique et convivial.)

---

## 5. **Règle générale**
- **Jamais de message technique** (pas de stacktrace, pas de message d’exception, pas de détails sur le token ou la base).
- **Toujours un message simple, clair, et générique**.

---

## 6. **Exemple de correction (auth.js, middleware/auth.js)**
```js
// Mauvais :
if (!token) return res.status(401).json({ error: 'Token manquant' });
if (err) return res.status(403).json({ error: 'Token invalide' });

// Bon :
if (!token || err) return res.status(401).json({ error: 'Session expirée, veuillez vous reconnecter.' });
```
```js
// Mauvais :
res.status(500).json({ error: err.message });

// Bon :
res.status(500).json({ error: 'Une erreur est survenue, veuillez réessayer.' });
```
```js
<code_block_to_apply_changes_from>
```

---

## 7. **Proposition d’action**
- Je peux te proposer un patch pour tous ces fichiers, ou te donner le code corrigé pour chaque cas.
- **Veux-tu que je fasse directement les modifications dans les fichiers ?**  
  (Si oui, précise si tu veux tout corriger d’un coup ou fichier par fichier.)

---

# 1. Historique des connexions

## **A. Ajout de la table `login_history` dans la base de données**

Ajoute ce bloc à ton fichier `db_schema.sql` et exécute-le sur ta base :

```sql
CREATE TABLE IF NOT EXISTS login_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    login_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip VARCHAR(45),
    user_agent VARCHAR(255),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## **B. Enregistrement d’une connexion à chaque login**

Dans ta route `/login` (dans `backend/routes/auth.js`), après la génération du token et AVANT le `res.json`, ajoute :

```js
await pool.query(
  'INSERT INTO login_history (userId, ip, user_agent) VALUES (?, ?, ?)',
  [user.id, req.ip, req.headers['user-agent']]
);
```

**Exemple d’intégration :**
```js
if (user.password !== hash) return res.status(401).json({ error: 'Mot de passe ou email incorrect.' });
// ... génération du token ...
await pool.query(
  'INSERT INTO login_history (userId, ip, user_agent) VALUES (?, ?, ?)',
  [user.id, req.ip, req.headers['user-agent']]
);
res.json({ token, user: { ... } });
```

---

## **C. Route pour récupérer l’historique**

Toujours dans `backend/routes/auth.js` (ou un autre fichier de routes sécurisé), ajoute :

```js
router.get('/login-history', authenticateToken, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT login_at, ip, user_agent FROM login_history WHERE userId = ? ORDER BY login_at DESC LIMIT 20',
    [req.user.id]
  );
  res.json(rows);
});
```

---

## **D. Frontend (exemple React)**

- Ajoute un bouton ou un onglet "Historique des connexions".
- Quand l’utilisateur clique, fais un appel GET à `/api/login-history` (avec le token).
- Affiche la liste : date, IP, navigateur.

**Exemple de rendu simple :**
```jsx
<ul>
  {history.map((item, idx) => (
    <li key={idx}>
      {new Date(item.login_at).toLocaleString()} — {item.ip} — {item.user_agent}
    </li>
  ))}
</ul>
```

---

## **E. Optionnel : Sécurité**

- Mets en évidence les connexions inhabituelles (IP différente, user-agent inconnu, etc.).
- Permets à l’utilisateur de signaler une connexion suspecte.

---

### **Veux-tu que je t’écrive le code exact à insérer dans un fichier précis, ou tu passes à l’étape suivante (alertes automatiques) ?** 

---

Voici le code exact à insérer dans le fichier `backend/routes/auth.js` pour enregistrer l’historique de connexion :

---

### **Dans la route `/login` (autour de la ligne 30, juste après la génération du token)**

Remplace ce bloc :
```js
const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
res.json({ token, user: { id: user.id, username: user.username, full_name: user.full_name, email: user.email, role: user.role } });
```

par :
```js
const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
await pool.query(
  'INSERT INTO login_history (userId, ip, user_agent) VALUES (?, ?, ?)',
  [user.id, req.ip, req.headers['user-agent']]
);
res.json({ token, user: { id: user.id, username: user.username, full_name: user.full_name, email: user.email, role: user.role } });
```

---

**Résumé :**
- Tu ajoutes l’appel à `await pool.query(...)` juste après la génération du token et avant le `res.json`.
- Cela enregistre la connexion dans la table `login_history` à chaque login réussi.

---

Veux-tu que je t’ajoute aussi la route GET `/login-history` pour que l’utilisateur puisse consulter ses connexions ? 

---

ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255); 