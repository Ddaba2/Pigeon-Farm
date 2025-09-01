const mysql = require('mysql2/promise');
const { config } = require('./config.js');

// Configuration de la connexion MySQL
const dbConfig = {
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  port: config.database.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Création du pool de connexions
const pool = mysql.createPool(dbConfig);

// Test de connexion à la base de données
const testDatabaseConnection = async () => {
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
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ Erreur d\'exécution de requête:', error.message);
    throw error;
  }
};

// Fonction pour exécuter des requêtes avec transaction
const executeTransaction = async (queries) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const query of queries) {
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
  pool,
  testDatabaseConnection,
  executeQuery,
  executeTransaction,
  dbConfig,
  execute: executeQuery
}; 