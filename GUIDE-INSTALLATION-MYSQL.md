# 🗄️ Guide d'Installation MySQL pour PigeonFarm

## 📋 **Prérequis**
- Windows 10/11
- Droits administrateur
- Connexion Internet

## 🚀 **Option 1 : Installation XAMPP (Recommandée)**

### **Étape 1 : Téléchargement**
1. Allez sur [https://www.apachefriends.org/download.html](https://www.apachefriends.org/download.html)
2. Téléchargez **XAMPP pour Windows**
3. Choisissez la version **PHP 8.x** (plus récente)

### **Étape 2 : Installation**
1. **Exécutez** le fichier téléchargé
2. **Suivez** l'assistant d'installation
3. **Gardez** tous les composants cochés (Apache, MySQL, PHP)
4. **Installez** dans `C:\xampp` (par défaut)

### **Étape 3 : Démarrage**
1. **Ouvrez** XAMPP Control Panel
2. **Cliquez** sur "Start" pour MySQL
3. **Vérifiez** que le statut devient vert
4. **Notez** le port (généralement 3306)

## 🗄️ **Option 2 : Installation MySQL Server**

### **Étape 1 : Téléchargement**
1. Allez sur [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. Téléchargez **MySQL Community Server**
3. Choisissez **Windows (x86, 64-bit), ZIP Archive**

### **Étape 2 : Installation**
1. **Extrayez** le fichier ZIP
2. **Copiez** le dossier dans `C:\mysql`
3. **Ajoutez** `C:\mysql\bin` au PATH Windows
4. **Créez** le fichier `my.ini` de configuration

## 🔧 **Configuration de la Base de Données**

### **Étape 1 : Création de la Base**
```sql
CREATE DATABASE IF NOT EXISTS pigeon_manager 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

### **Étape 2 : Import du Schéma**
```bash
# Dans le dossier de votre projet
mysql -u root -p pigeon_manager < backend/db_schema.sql
```

### **Étape 3 : Création de l'Utilisateur Admin**
```sql
USE pigeon_manager;

INSERT INTO users (username, full_name, email, password, role) 
VALUES (
    'admin', 
    'Administrateur', 
    'admin@pigeonfarm.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kq8Kq8', 
    'admin'
);
```

## ⚙️ **Configuration du Backend**

### **Étape 1 : Décommenter la Configuration**
Dans `backend/config.env`, décommentez :
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pigeon_manager
DB_PORT=3306
```

### **Étape 2 : Redémarrer le Serveur**
```bash
cd backend
npm run dev
```

## 🧪 **Test de la Connexion**

### **Vérification Automatique**
Le serveur affichera :
```
✅ Connexion à MySQL réussie !
📊 Base de données: pigeon_manager
🌐 Hôte: localhost:3306
👤 Utilisateur: root
📋 Tables disponibles:
   - users
   - couples
   - eggs
   - pigeonneaux
   - healthRecords
   - sales
   - password_reset_codes
```

## 🚨 **Dépannage**

### **Problème : Port 3306 déjà utilisé**
```bash
# Vérifier quel service utilise le port
netstat -ano | findstr :3306

# Arrêter le service ou changer le port
```

### **Problème : Accès refusé**
```bash
# Vérifier les permissions MySQL
mysql -u root -p
GRANT ALL PRIVILEGES ON pigeon_manager.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### **Problème : Base de données non trouvée**
```bash
# Vérifier que la base existe
SHOW DATABASES;

# Créer si nécessaire
CREATE DATABASE pigeon_manager;
```

## 🎯 **Utilisation**

### **Identifiants de Test**
- **Username** : `admin`
- **Password** : `admin123`
- **Rôle** : `admin`

### **Tables Disponibles**
- **`users`** : Gestion des utilisateurs
- **`couples`** : Couples de pigeons
- **`eggs`** : Suivi des œufs
- **`pigeonneaux`** : Jeunes pigeons
- **`healthRecords`** : Dossiers de santé
- **`sales`** : Gestion des ventes

## 💡 **Conseils**

1. **Utilisez XAMPP** pour un démarrage rapide
2. **Gardez MySQL démarré** pendant le développement
3. **Sauvegardez** régulièrement votre base de données
4. **Testez** avec la page `test-backend-complet.html`

## 🆘 **Support**

En cas de problème :
1. Vérifiez les logs MySQL
2. Consultez la documentation officielle
3. Testez la connexion avec `mysql -u root -p`

---

**🎉 Votre base de données MySQL sera bientôt opérationnelle !** 