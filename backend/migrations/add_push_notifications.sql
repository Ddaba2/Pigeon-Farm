-- Migration pour ajouter les notifications push et préférences utilisateur

-- Table des préférences de notification utilisateur
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    push_notifications BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    critical_alerts_only BOOLEAN DEFAULT TRUE,
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '07:00:00',
    timezone VARCHAR(50) DEFAULT 'Europe/Paris',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preferences (user_id),
    INDEX idx_user_id (user_id)
);

-- Table des notifications push
CREATE TABLE IF NOT EXISTS push_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    data JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'sent', 'read', 'failed') DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    error_message TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status),
    INDEX idx_timestamp (timestamp),
    INDEX idx_priority (priority),
    INDEX idx_type (type)
);

-- Table des tokens de notification push (pour les navigateurs)
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh_key VARCHAR(255) NOT NULL,
    auth_key VARCHAR(255) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_endpoint (endpoint),
    INDEX idx_user_id (user_id)
);

-- Table des logs de notifications push
CREATE TABLE IF NOT EXISTS push_notification_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notification_id INT NOT NULL,
    user_id INT NOT NULL,
    action ENUM('sent', 'delivered', 'clicked', 'dismissed', 'error') NOT NULL,
    details JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notification_id) REFERENCES push_notifications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notification_id (notification_id),
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp)
);

-- Insérer les préférences par défaut pour les utilisateurs existants
INSERT IGNORE INTO user_notification_preferences (user_id, push_notifications, email_notifications, sms_notifications, critical_alerts_only)
SELECT 
    id as user_id,
    TRUE as push_notifications,
    TRUE as email_notifications,
    FALSE as sms_notifications,
    TRUE as critical_alerts_only
FROM users 
WHERE id NOT IN (SELECT user_id FROM user_notification_preferences);

-- Créer un index composite pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_notifications_user_status_timestamp 
ON push_notifications (user_id, status, timestamp DESC);

-- Créer un index pour les requêtes de nettoyage
CREATE INDEX IF NOT EXISTS idx_notifications_status_timestamp 
ON push_notifications (status, timestamp);

-- Afficher les tables créées
SHOW TABLES LIKE '%notification%';
SHOW TABLES LIKE '%push%';
