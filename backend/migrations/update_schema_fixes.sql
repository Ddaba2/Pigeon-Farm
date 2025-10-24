-- =====================================================
-- MIGRATION : CORRECTIONS DU SCHÉMA DE BASE DE DONNÉES
-- =====================================================
-- Date : 2025-10-23
-- Description : Corrections apportées pour résoudre les erreurs 500 et 400
-- =====================================================

USE pigeon_manager;

-- 1. Ajout de la colonne user_id à la table sales
-- (Nécessaire pour associer les ventes aux utilisateurs)
ALTER TABLE sales ADD COLUMN user_id INT(11) NOT NULL AFTER id;
ALTER TABLE sales ADD INDEX idx_sales_user_id (user_id);
ALTER TABLE sales ADD CONSTRAINT fk_sales_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 2. Ajout des champs de profil à la table users
-- (Nécessaire pour la mise à jour du profil utilisateur)
ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL;
ALTER TABLE users ADD COLUMN address TEXT NULL;
ALTER TABLE users ADD COLUMN bio TEXT NULL;

-- Vérification des modifications
SELECT 'Modifications appliquées avec succès' as status;
