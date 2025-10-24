-- Migration pour ajouter la colonne user_id à la table sales
-- À exécuter sur votre base de données existante

USE pigeon_manager;

-- Ajouter la colonne user_id
ALTER TABLE sales 
ADD COLUMN user_id INT NULL;

-- Ajouter la contrainte de clé étrangère
ALTER TABLE sales 
ADD CONSTRAINT fk_sales_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Ajouter un index pour améliorer les performances
ALTER TABLE sales 
ADD INDEX idx_user_id (user_id);

-- Mettre à jour les ventes existantes pour les associer au premier utilisateur
-- (vous pouvez modifier cette requête pour associer les ventes à un utilisateur spécifique)
UPDATE sales 
SET user_id = (SELECT id FROM users ORDER BY id LIMIT 1)
WHERE user_id IS NULL;

-- Rendre la colonne user_id non nullable
ALTER TABLE sales 
MODIFY COLUMN user_id INT NOT NULL;

-- Vérifier la structure mise à jour
DESCRIBE sales;