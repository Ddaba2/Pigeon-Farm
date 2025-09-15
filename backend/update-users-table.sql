-- Script de mise à jour de la table users pour l'administration
-- Ajouter les colonnes nécessaires pour la gestion des utilisateurs

-- Ajouter la colonne status si elle n'existe pas
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status ENUM('active', 'blocked', 'pending') DEFAULT 'active';

-- Ajouter la colonne updated_at si elle n'existe pas
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Ajouter la colonne login_attempts si elle n'existe pas
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS login_attempts INT DEFAULT 0;

-- Mettre à jour tous les utilisateurs existants pour avoir le statut 'active'
UPDATE users SET status = 'active' WHERE status IS NULL;

-- Créer un index sur la colonne status pour de meilleures performances
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Créer un index sur la colonne role pour de meilleures performances
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Afficher la structure de la table mise à jour
DESCRIBE users;
