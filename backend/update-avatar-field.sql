-- Script SQL pour mettre à jour le champ avatar_url pour supporter les photos base64
-- Exécuter ce script pour permettre le stockage des photos de profil

-- Vérifier si la colonne avatar_url existe et la modifier si nécessaire
ALTER TABLE users 
MODIFY COLUMN avatar_url LONGTEXT DEFAULT NULL COMMENT 'URL ou données base64 de l\'avatar de l\'utilisateur';

-- Ajouter les autres champs de profil s'ils n'existent pas
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL COMMENT 'Numéro de téléphone',
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT NULL COMMENT 'Adresse de l\'utilisateur',
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL COMMENT 'Biographie de l\'utilisateur',
ADD COLUMN IF NOT EXISTS full_name VARCHAR(100) DEFAULT NULL COMMENT 'Nom complet de l\'utilisateur';

-- Ajouter des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Vérifier la structure de la table
DESCRIBE users;

-- Afficher un message de confirmation
SELECT 'Base de données mise à jour pour supporter les photos de profil' as message;
