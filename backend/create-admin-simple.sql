-- Script simple pour créer un compte administrateur
-- Exécutez ce script dans votre base de données MySQL

-- Créer la table users si elle n'existe pas
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('admin', 'user') DEFAULT 'user',
    status ENUM('active', 'blocked', 'pending') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    login_attempts INT DEFAULT 0
);

-- Insérer un compte administrateur par défaut
-- Mot de passe: admin123 (hashé avec bcrypt)
INSERT IGNORE INTO users (username, email, password, full_name, role, status) 
VALUES (
    'admin',
    'admin@pigeonfarm.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4.8x7Vj0JK', -- admin123
    'Administrateur PigeonFarm',
    'admin',
    'active'
);

-- Afficher les utilisateurs créés
SELECT id, username, email, role, status, created_at FROM users WHERE role = 'admin';
