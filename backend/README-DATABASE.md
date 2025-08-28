# 🗄️ Base de Données PigeonFarm

## 📋 **Vue d'ensemble**

Toute la structure de la base de données est maintenant consolidée dans un seul fichier : **`db_schema.sql`**

## 🏗️ **Structure des Tables**

### **1. Table `users` (Utilisateurs)**
- **Champs de base :** `id`, `username`, `full_name`, `email`, `password`, `role`
- **Champs ajoutés :** `created_at`, `updated_at`, `last_login`, `email_verified`, `email_verification_token`, `password_reset_token`, `password_reset_expires`
- **Index :** `username` (unique), `email` (unique)

### **2. Table `couples` (Couples de pigeons)**
- **Champs :** `id`, `nestNumber`, `race`, `formationDate`, `maleId`, `femaleId`, `observations`, `status`, `created_at`, `updated_at`
- **Index :** `nestNumber`, `status`

### **3. Table `eggs` (Œufs)**
- **Champs :** `id`, `coupleId`, `egg1Date`, `egg2Date`, `hatchDate1`, `hatchDate2`, `success1`, `success2`, `observations`, `createdAt`, `updated_at`
- **Clés étrangères :** `coupleId` → `couples(id)`

### **4. Table `pigeonneaux` (Jeunes pigeons)**
- **Champs :** `id`, `coupleId`, `eggRecordId`, `birthDate`, `sex`, `weight`, `weaningDate`, `status`, `salePrice`, `saleDate`, `buyer`, `observations`, `created_at`, `updated_at`
- **Clés étrangères :** `coupleId` → `couples(id)`, `eggRecordId` → `eggs(id)`

### **5. Table `healthRecords` (Suivi de santé)**
- **Champs :** `id`, `type`, `targetType`, `targetId`, `product`, `date`, `nextDue`, `observations`, `created_at`, `updated_at`

### **6. Table `sales` (Ventes)**
- **Champs :** `id`, `date`, `quantity`, `unit_price`, `amount`, `description`, `client`, `created_at`, `updated_at`

### **7. Table `password_reset_codes` (Codes de réinitialisation)**
- **Champs :** `id`, `email`, `code`, `expires_at`, `used`, `created_at`
- **Index :** `email`, `expires_at`
- **Fonctionnalité :** Réinitialisation de mot de passe avec codes à 4 chiffres

### **8. Table `notifications` (Notifications - Futures fonctionnalités)**
- **Champs :** `id`, `user_id`, `title`, `message`, `type`, `read_status`, `created_at`
- **Clés étrangères :** `user_id` → `users(id)`
- **Index :** `user_id + read_status`, `created_at`

### **9. Table `audit_logs` (Logs d'audit - Futures fonctionnalités)**
- **Champs :** `id`, `user_id`, `action`, `table_name`, `record_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`
- **Clés étrangères :** `user_id` → `users(id)`
- **Index :** `user_id + action`, `table_name + record_id`, `created_at`

## 🚀 **Installation et Configuration**

### **Étape 1 : Démarrer XAMPP**
```bash
# Démarrer Apache et MySQL depuis XAMPP Control Panel
```

### **Étape 2 : Appliquer le schéma**
```bash
# Option 1 : Script automatique (recommandé)
update-database.bat

# Option 2 : Manuel
mysql -u root -p < db_schema.sql
```

### **Étape 3 : Vérification**
```sql
USE pigeon_manager;
SHOW TABLES;
DESCRIBE users;
SELECT COUNT(*) FROM users;
```

## 🧪 **Données de Test**

Le schéma inclut automatiquement :

### **Utilisateurs de test :**
- **Admin :** `admin@pigeonfarm.ml` / `password`
- **Test :** `test@example.com` / `password`

### **Couples de test :**
- **NID-001 :** Racing Homer (M-001 + F-001)
- **NID-002 :** Show Racer (M-002 + F-002)

### **Œufs de test :**
- Couple 1 : 2 œufs (20-22 janvier 2024)
- Couple 2 : 2 œufs (25-27 janvier 2024)

## 🔧 **Maintenance**

### **Sauvegarde :**
```bash
mysqldump -u root -p pigeon_manager > backup_$(date +%Y%m%d_%H%M%S).sql
```

### **Restauration :**
```bash
mysql -u root -p pigeon_manager < backup_file.sql
```

### **Vérification de l'intégrité :**
```sql
-- Vérifier les contraintes de clés étrangères
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = 'pigeon_manager';

-- Vérifier les index
SHOW INDEX FROM users;
SHOW INDEX FROM couples;
SHOW INDEX FROM password_reset_codes;
```

## 📊 **Statistiques de la Base**

- **Tables :** 9 tables principales
- **Index :** Optimisés pour les requêtes fréquentes
- **Contraintes :** Intégrité référentielle complète
- **Timestamps :** Traçabilité complète des modifications
- **Sécurité :** Hachage des mots de passe, codes de réinitialisation sécurisés

## 🔮 **Évolutions Futures**

- **Authentification à deux facteurs** (2FA)
- **Historique des connexions**
- **Gestion des permissions granulaires**
- **Synchronisation cloud**
- **API REST complète**

---

**📝 Note :** Ce schéma est conçu pour être extensible et maintenable. Toutes les modifications futures seront ajoutées à ce fichier unique. 