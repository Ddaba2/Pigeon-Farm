-- Script pour créer les tables manquantes dans pigeon_manager
USE pigeon_manager;

-- Table des couples (si elle n'existe pas)
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

-- Table des œufs (si elle n'existe pas)
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

-- Table des pigeonneaux (si elle n'existe pas)
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

-- Table des enregistrements de santé (si elle n'existe pas)
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

-- Table des ventes (si elle n'existe pas)
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

-- Table des codes de réinitialisation de mot de passe (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS password_reset_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(4) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vérification des tables créées
SHOW TABLES; 