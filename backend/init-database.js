const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  let connection;
  
  try {
    // Lire la configuration de la base de données
    const { config } = require('./config/config.js');
    
    console.log('🔧 Initialisation de la base de données...');
    
    // Connexion à MySQL sans spécifier de base de données
    connection = await mysql.createConnection({
      host: config.database.host,
      user: config.database.user,
      password: config.database.password,
      port: config.database.port
    });
    
    console.log('✅ Connexion à MySQL réussie');
    
    // Créer la base de données si elle n'existe pas
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${config.database.name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Base de données ${config.database.name} créée ou vérifiée`);
    
    // Utiliser la base de données
    await connection.query(`USE ${config.database.name}`);
    
    // Lire et exécuter le schéma SQL
    const schemaPath = path.join(__dirname, 'db_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Diviser le schéma en requêtes individuelles
    const queries = schema.split(';').filter(query => query.trim().length > 0);
    
    for (const query of queries) {
      const trimmedQuery = query.trim();
      if (trimmedQuery && !trimmedQuery.startsWith('--')) {
        try {
          await connection.execute(trimmedQuery);
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.log(`⚠️ Avertissement lors de l'exécution de la requête: ${error.message}`);
          }
        }
      }
    }
    
    console.log('✅ Schéma de base de données initialisé');
    
    // Vérifier les tables créées
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tables créées:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });
    
    console.log('🎉 Initialisation de la base de données terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter l'initialisation si le script est appelé directement
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;