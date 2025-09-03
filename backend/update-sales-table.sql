-- Script pour mettre à jour la table sales
USE pigeon_manager;

-- Supprimer la table sales existante si elle existe
DROP TABLE IF EXISTS sales;

-- Créer la nouvelle table sales avec la structure appropriée
CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_type ENUM('couple', 'pigeonneau', 'oeuf', 'male', 'female') NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    target_name VARCHAR(255),
    buyer_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_method ENUM('virement', 'espece', 'cheque', 'mobile_money') NOT NULL DEFAULT 'espece',
    date DATE NOT NULL,
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_target (target_type, target_id),
    INDEX idx_date (date),
    INDEX idx_payment_method (payment_method),
    INDEX idx_buyer_name (buyer_name)
);

-- Vérifier la structure de la nouvelle table
DESCRIBE sales;
