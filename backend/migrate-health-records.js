const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

async function migrateHealthRecords() {
  let connection;
  
  try {
    // Se connecter à MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pigeon_manager'
    });

    console.log('✅ Connexion à MySQL réussie');

    // Vérifier si la colonne user_id existe déjà
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'healthRecords' AND COLUMN_NAME = 'user_id'
    `, [process.env.DB_NAME || 'pigeon_manager']);

    if (columns.length > 0) {
      console.log('⚠️ La colonne user_id existe déjà dans healthRecords');
      return;
    }

    console.log('➕ Ajout de la colonne user_id à healthRecords...');

    // Ajouter la colonne user_id
    await connection.execute(`
      ALTER TABLE healthRecords 
      ADD COLUMN user_id INT AFTER id,
      ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      ADD INDEX idx_user_id (user_id)
    `);

    console.log('✅ Colonne user_id ajoutée avec succès');

    // Mettre à jour les enregistrements existants avec le premier utilisateur admin
    const [users] = await connection.execute('SELECT id FROM users WHERE role = "admin" ORDER BY id LIMIT 1');
    
    if (users.length > 0) {
      const adminId = users[0].id;
      console.log(`📝 Attribution des health records existants à l'utilisateur admin (ID: ${adminId})...`);
      
      await connection.execute('UPDATE healthRecords SET user_id = ? WHERE user_id IS NULL', [adminId]);
      
      const [result] = await connection.execute('SELECT COUNT(*) as count FROM healthRecords WHERE user_id = ?', [adminId]);
      console.log(`✅ ${result[0].count} enregistrements de santé attribués à l'utilisateur admin`);
    } else {
      console.log('⚠️ Aucun utilisateur admin trouvé');
    }

    console.log('✅ Migration terminée avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion fermée');
    }
  }
}

// Exécuter la migration
migrateHealthRecords();

