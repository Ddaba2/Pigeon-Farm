-- Migration pour ajouter les tables d'archivage

-- Table des notifications archivées
CREATE TABLE IF NOT EXISTS archived_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archive_reason VARCHAR(100) DEFAULT 'auto_archive',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_archived_at (archived_at),
    INDEX idx_original_id (original_id),
    INDEX idx_archive_reason (archive_reason)
);

-- Table des notifications push archivées
CREATE TABLE IF NOT EXISTS archived_push_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    data JSON,
    timestamp TIMESTAMP NOT NULL,
    status ENUM('pending', 'sent', 'read', 'failed') DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archive_reason VARCHAR(100) DEFAULT 'auto_archive',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_archived_at (archived_at),
    INDEX idx_original_id (original_id),
    INDEX idx_archive_reason (archive_reason)
);

-- Table des logs d'archivage
CREATE TABLE IF NOT EXISTS archive_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    archive_type ENUM('notifications', 'push_notifications', 'audit_logs', 'reset_codes', 'full') NOT NULL,
    items_archived INT DEFAULT 0,
    items_deleted INT DEFAULT 0,
    execution_time_ms INT,
    status ENUM('success', 'error', 'partial') DEFAULT 'success',
    error_message TEXT NULL,
    executed_by INT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (executed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_archive_type (archive_type),
    INDEX idx_executed_at (executed_at),
    INDEX idx_status (status)
);

-- Créer des index pour optimiser les requêtes d'archivage
CREATE INDEX IF NOT EXISTS idx_notifications_read_created 
ON notifications (read_status, created_at);

CREATE INDEX IF NOT EXISTS idx_push_notifications_status_read 
ON push_notifications (status, read_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created 
ON audit_logs (created_at);

CREATE INDEX IF NOT EXISTS idx_reset_codes_expires_used 
ON password_reset_codes (expires_at, used);

-- Procédure stockée pour l'archivage automatique
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS ArchiveOldData()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Archiver les notifications lues de plus de 30 jours
    INSERT INTO archived_notifications (
        original_id, user_id, title, message, type, read_status, 
        created_at, archived_at, archive_reason
    )
    SELECT 
        id, user_id, title, message, type, read_status, 
        created_at, NOW(), 'auto_archive_30_days'
    FROM notifications 
    WHERE read_status = TRUE 
    AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    -- Supprimer les notifications archivées
    DELETE FROM notifications 
    WHERE read_status = TRUE 
    AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    -- Archiver les notifications push lues de plus de 60 jours
    INSERT INTO archived_push_notifications (
        original_id, user_id, title, message, type, priority, 
        data, timestamp, status, sent_at, read_at, archived_at, archive_reason
    )
    SELECT 
        id, user_id, title, message, type, priority, 
        data, timestamp, status, sent_at, read_at, NOW(), 'auto_archive_60_days'
    FROM push_notifications 
    WHERE status = 'read' 
    AND read_at < DATE_SUB(NOW(), INTERVAL 60 DAY);
    
    -- Supprimer les notifications push archivées
    DELETE FROM push_notifications 
    WHERE status = 'read' 
    AND read_at < DATE_SUB(NOW(), INTERVAL 60 DAY);
    
    -- Supprimer les logs d'audit de plus de 1 an
    DELETE FROM audit_logs 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
    
    -- Supprimer les codes de réinitialisation expirés
    DELETE FROM password_reset_codes 
    WHERE expires_at < NOW() OR used = TRUE;
    
    COMMIT;
END //

DELIMITER ;

-- Événement pour l'archivage automatique quotidien
CREATE EVENT IF NOT EXISTS daily_archive
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
  CALL ArchiveOldData();

-- Activer le planificateur d'événements
SET GLOBAL event_scheduler = ON;

-- Afficher les tables créées
SHOW TABLES LIKE '%archive%';
SHOW TABLES LIKE '%archived%';

-- Afficher les événements
SHOW EVENTS;
