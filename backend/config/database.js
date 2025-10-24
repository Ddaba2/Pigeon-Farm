const { config } = require('./config.js');
const fs = require('fs');
const path = require('path');

// Vérifier si MySQL est disponible
let mysql;
try {
  mysql = require('mysql2/promise');
} catch (error) {
  console.log('⚠️  MySQL non disponible, utilisation du mode lecture seule');
  mysql = null;
}

// Vérifier si le fichier SQLite existe
const sqliteDbPath = path.join(__dirname, '../pigeon_manager.db');
const useSQLite = fs.existsSync(sqliteDbPath) && !mysql;

let pool, dbConfig;

if (!useSQLite && mysql) {
  // Configuration de la connexion MySQL
  dbConfig = {
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
    port: config.database.port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000
  };

  // Création du pool de connexions
  pool = mysql.createPool(dbConfig);
}

// Test de connexion à la base de données
const testDatabaseConnection = async () => {
  if (useSQLite) {
    console.log('✅ Mode SQLite (lecture seule) - Utilisation du fichier pigeon_manager.db');
    console.log(`📊 Base de données: ${sqliteDbPath}`);
    return true;
  }
  
  if (!mysql) {
    console.log('⚠️  MySQL non disponible - Certaines fonctionnalités seront limitées');
    return false;
  }

  try {
    const connection = await pool.getConnection();
    console.log('✅ Connexion à MySQL réussie !');
    console.log(`📊 Base de données: ${config.database.name}`);
    console.log(`🌐 Hôte: ${config.database.host}:${config.database.port}`);
    console.log(`👤 Utilisateur: ${config.database.user}`);
    
    // Test des tables principales
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tables disponibles:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à MySQL:', error.message);
    console.log('💡 Vérifiez que:');
    console.log('   1. MySQL est démarré');
    console.log('   2. La base de données "pigeon_manager" existe');
    console.log('   3. Les credentials sont corrects');
    console.log('   4. Le port 3306 est accessible');
    return false;
  }
};

// Fonction pour exécuter des requêtes
const executeQuery = async (sql, params = []) => {
  if (useSQLite) {
    // Pour le mode SQLite, retourner un tableau vide ou une erreur
    // car nous ne pouvons pas écrire dans la base de données SQLite existante
    console.warn('⚠️  Mode lecture seule - Impossible d\'exécuter des requêtes d\'écriture');
    throw new Error('Fonctionnalité non disponible en mode lecture seule. Veuillez configurer MySQL pour les opérations d\'écriture.');
  }
  
  if (!mysql) {
    throw new Error('MySQL non disponible. Veuillez installer MySQL pour les opérations de base de données.');
  }

  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ Erreur d\'exécution de requête:', error.message);
    throw error;
  }
};

// Fonction pour exécuter des requêtes avec transaction
const executeTransaction = async (queriesOrCallback) => {
  if (useSQLite) {
    throw new Error('Transactions non disponibles en mode lecture seule. Veuillez configurer MySQL.');
  }
  
  if (!mysql) {
    throw new Error('MySQL non disponible. Veuillez installer MySQL pour les transactions.');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Si c'est une fonction callback (nouveau format)
    if (typeof queriesOrCallback === 'function') {
      const result = await queriesOrCallback(connection);
      await connection.commit();
      return result;
    }
    
    // Si c'est un tableau de requêtes (ancien format)
    const results = [];
    for (const query of queriesOrCallback) {
      const [result] = await connection.execute(query.sql, query.params || []);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool: pool || null,
  testDatabaseConnection,
  executeQuery,
  executeTransaction,
  dbConfig,
  execute: executeQuery,
  isReadOnly: useSQLite
};