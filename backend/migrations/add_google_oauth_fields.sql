-- Migration pour ajouter les champs Google OAuth à la table users
-- À exécuter si la table users existe déjà

USE pigeon_manager;

-- Ajouter les champs Google OAuth
ALTER TABLE users 
ADD COLUMN google_id VARCHAR(255) NULL UNIQUE AFTER password_reset_expires,
ADD COLUMN avatar_url VARCHAR(500) NULL AFTER google_id,
ADD COLUMN auth_provider ENUM('local', 'google') DEFAULT 'local' AFTER avatar_url,
ADD COLUMN status ENUM('active', 'pending', 'blocked') DEFAULT 'active' AFTER auth_provider;

-- Modifier le champ password pour permettre NULL (comptes Google)
ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL;

-- Ajouter les index pour les nouveaux champs
ALTER TABLE users 
ADD INDEX idx_google_id (google_id),
ADD INDEX idx_auth_provider (auth_provider),
ADD INDEX idx_status (status);

-- Vérifier la structure mise à jour
DESCRIBE users;
