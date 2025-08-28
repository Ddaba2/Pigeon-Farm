-- Script pour créer un utilisateur admin valide
USE pigeon_manager;

-- Supprimer l'ancien utilisateur admin s'il existe
DELETE FROM users WHERE username = 'admin';

-- Créer un nouvel utilisateur admin avec un mot de passe hashé valide
-- Le mot de passe est 'admin123' hashé avec bcrypt
INSERT INTO users (username, full_name, email, password, role, created_at) VALUES (
    'admin',
    'Administrateur PigeonFarm',
    'admin@pigeonfarm.com',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    NOW()
);

-- Vérifier que l'utilisateur a été créé
SELECT id, username, full_name, email, role, created_at FROM users WHERE username = 'admin';

-- Afficher le message de succès
SELECT 'Utilisateur admin créé avec succès !' as message;
SELECT 'Username: admin' as credentials;
SELECT 'Password: admin123' as credentials; 