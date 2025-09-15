-- Script pour corriger la structure de la base de données
-- et ajouter les champs manquants pour le profil utilisateur

-- Renommer profile_picture en avatar_url et changer le type pour supporter base64
ALTER TABLE users 
CHANGE COLUMN profile_picture avatar_url LONGTEXT DEFAULT NULL COMMENT 'URL ou données base64 de l\'avatar de l\'utilisateur';

-- Ajouter les champs manquants pour le profil
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL COMMENT 'Numéro de téléphone',
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT NULL COMMENT 'Adresse de l\'utilisateur',
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL COMMENT 'Biographie de l\'utilisateur';

-- Vérifier que full_name existe (il semble déjà présent)
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(100) DEFAULT NULL COMMENT 'Nom complet de l\'utilisateur';

-- Ajouter des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Vérifier la structure de la table
DESCRIBE users;

-- Afficher un message de confirmation
SELECT 'Structure de la base de données corrigée pour le profil utilisateur' as message;
