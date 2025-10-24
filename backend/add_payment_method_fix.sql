-- Ajouter le champ payment_method à la table sales
ALTER TABLE sales ADD COLUMN payment_method VARCHAR(50) DEFAULT 'espece';

