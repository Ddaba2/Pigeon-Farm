-- Script SQL pour ajouter les nouveaux champs de profil à la table users
-- Exécuter ce script pour étendre la table users avec les champs de profil

-- Ajouter les nouveaux champs de profil
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) DEFAULT NULL COMMENT 'URL de l\'avatar de l\'utilisateur',
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL COMMENT 'Numéro de téléphone',
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT NULL COMMENT 'Adresse de l\'utilisateur',
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL COMMENT 'Biographie de l\'utilisateur';

-- Ajouter des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Mettre à jour la colonne full_name si elle n'existe pas
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(100) DEFAULT NULL COMMENT 'Nom complet de l\'utilisateur';

-- Vérifier la structure de la table
DESCRIBE users;

-- Afficher un message de confirmation
SELECT 'Champs de profil ajoutés avec succès à la table users' as message;
