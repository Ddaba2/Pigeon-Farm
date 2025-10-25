-- Ajouter la colonne user_id à la table healthRecords
ALTER TABLE healthRecords 
ADD COLUMN user_id INT AFTER id,
ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
ADD INDEX idx_user_id (user_id);

-- Pour les données existantes, mettre à jour user_id avec la valeur par défaut (1 ou le premier admin)
-- ATTENTION: À adapter selon votre base de données
UPDATE healthRecords SET user_id = 1 WHERE user_id IS NULL;

