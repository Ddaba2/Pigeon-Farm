CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity VARCHAR(50) NOT NULL,
    entityId INT NOT NULL,
    action ENUM('create', 'update', 'delete') NOT NULL,
    userId INT,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
); 