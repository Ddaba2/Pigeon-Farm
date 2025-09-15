// Script Node.js pour créer la table notifications
const { executeQuery } = require('./config/database.js');

async function createNotificationsTable() {
  try {
    console.log('🗄️ Création de la table notifications...\n');
    
    // 1. Créer la table notifications
    console.log('1. Création de la table notifications...');
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('info', 'warning', 'error', 'success', 'update', 'health') NOT NULL DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        
        INDEX idx_user_id (user_id),
        INDEX idx_is_read (is_read),
        INDEX idx_created_at (created_at),
        INDEX idx_type (type)
      )
    `;
    
    await executeQuery(createTableSQL);
    console.log('✅ Table notifications créée avec succès');
    
    // 2. Insérer des notifications de test
    console.log('\n2. Insertion des notifications de test...');
    const testNotifications = [
      {
        user_id: 1,
        title: 'Nouvelle mise à jour disponible',
        message: 'Une nouvelle version de PigeonFarm est disponible avec des améliorations de sécurité et de performance.',
        type: 'update',
        is_read: false
      },
      {
        user_id: 1,
        title: 'Alerte santé - Pigeon #001',
        message: 'Le pigeon #001 présente des signes de fatigue. Vérifiez sa condition.',
        type: 'health',
        is_read: false
      },
      {
        user_id: 1,
        title: 'Bienvenue sur PigeonFarm',
        message: 'Bienvenue dans votre tableau de bord PigeonFarm ! Explorez toutes les fonctionnalités disponibles.',
        type: 'info',
        is_read: false
      },
      {
        user_id: 1,
        title: 'Rappel - Nettoyage prévu',
        message: 'N\'oubliez pas le nettoyage hebdomadaire des volières prévu pour demain.',
        type: 'warning',
        is_read: false
      },
      {
        user_id: 1,
        title: 'Nouveau couple formé',
        message: 'Le couple Pigeon #005 et Pigeon #008 a été formé avec succès.',
        type: 'success',
        is_read: false
      }
    ];
    
    for (const notification of testNotifications) {
      const insertSQL = `
        INSERT INTO notifications (user_id, title, message, type, is_read)
        VALUES (?, ?, ?, ?, ?)
      `;
      await executeQuery(insertSQL, [
        notification.user_id,
        notification.title,
        notification.message,
        notification.type,
        notification.is_read
      ]);
    }
    
    console.log('✅ Notifications de test insérées avec succès');
    
    // 3. Vérifier la création
    console.log('\n3. Vérification de la table...');
    const notifications = await executeQuery('SELECT * FROM notifications WHERE user_id = 1');
    console.log(`✅ ${notifications.length} notifications trouvées pour l'utilisateur 1`);
    
    console.log('\n🎉 Table notifications créée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table notifications:', error);
  }
  
  process.exit(0);
}

createNotificationsTable();
