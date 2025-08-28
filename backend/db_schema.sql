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
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_expires_at (expires_at)
);

-- Table des notifications (pour futures fonctionnalités)
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, read_status),
    INDEX idx_created_at (created_at)
);

-- Table des logs d'audit (pour futures fonctionnalités)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_action (user_id, action),
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_created_at (created_at)
);

-- Amélioration de la table users avec timestamps
ALTER TABLE users 
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
ADD COLUMN last_login TIMESTAMP NULL,
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN email_verification_token VARCHAR(255) NULL,
ADD COLUMN password_reset_token VARCHAR(255) NULL,
ADD COLUMN password_reset_expires TIMESTAMP NULL;

-- Amélioration de la table couples avec timestamps
ALTER TABLE couples 
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Amélioration de la table eggs avec timestamps
ALTER TABLE eggs 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Amélioration de la table pigeonneaux avec timestamps
ALTER TABLE pigeonneaux 
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Amélioration de la table healthRecords avec timestamps
ALTER TABLE healthRecords 
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Amélioration de la table sales avec timestamps
ALTER TABLE sales 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Insertion d'utilisateurs de test
INSERT INTO users (username, email, password, full_name, role, created_at) 
VALUES 
    ('admin', 'admin@pigeonfarm.ml', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrateur PigeonFarm', 'admin', NOW()),
ON DUPLICATE KEY UPDATE id=id;

-- Insertion de couples de test


-- Vérification de la structure
SHOW TABLES;
DESCRIBE users;
DESCRIBE password_reset_codes; 