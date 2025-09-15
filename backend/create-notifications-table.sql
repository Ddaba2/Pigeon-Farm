-- Création de la table notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'error', 'success', 'update', 'health') NOT NULL DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Clé étrangère vers la table users
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Index pour améliorer les performances
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_type (type)
);

-- Insertion de quelques notifications de test
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(1, 'Nouvelle mise à jour disponible', 'Une nouvelle version de PigeonFarm est disponible avec des améliorations de sécurité et de performance.', 'update', FALSE),
(1, 'Alerte santé - Pigeon #001', 'Le pigeon #001 présente des signes de fatigue. Vérifiez sa condition.', 'health', FALSE),
(1, 'Bienvenue sur PigeonFarm', 'Bienvenue dans votre tableau de bord PigeonFarm ! Explorez toutes les fonctionnalités disponibles.', 'info', FALSE),
(1, 'Rappel - Nettoyage prévu', 'N\'oubliez pas le nettoyage hebdomadaire des volières prévu pour demain.', 'warning', FALSE),
(1, 'Nouveau couple formé', 'Le couple Pigeon #005 et Pigeon #008 a été formé avec succès.', 'success', FALSE);
