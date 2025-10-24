const fs = require('fs');
const path = require('path');

// Fonction pour déterminer le type de base de données à utiliser
function getDatabaseType() {
  // Vérifier si le fichier SQLite existe
  const sqliteDbPath = path.join(__dirname, '../pigeon_manager.db');
  if (fs.existsSync(sqliteDbPath)) {
    return 'sqlite';
  }
  
  // Par défaut, utiliser MySQL
  return 'mysql';
}

// Adapter pour exécuter les requêtes selon le type de base de données
class DatabaseAdapter {
  constructor() {
    this.dbType = getDatabaseType();
    this.db = null;
    
    if (this.dbType === 'sqlite') {
      this.initSQLite();
    } else {
      this.initMySQL();
    }
  }
  
  initSQLite() {
    try {
      const sqlite3 = require('sqlite3').verbose();
      const dbPath = path.join(__dirname, '../pigeon_manager.db');
      this.db = new sqlite3.Database(dbPath);
      console.log('✅ Connecté à la base de données SQLite');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de SQLite:', error.message);
      throw error;
    }
  }
  
  initMySQL() {
    try {
      const mysql = require('mysql2/promise');
      const { config } = require('./config.js');
      
      this.dbConfig = {
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
      
      console.log('✅ Configuration MySQL prête');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de MySQL:', error.message);
      throw error;
    }
  }
  
  async executeQuery(sql, params = []) {
    if (this.dbType === 'sqlite') {
      return this.executeSQLiteQuery(sql, params);
    } else {
      return this.executeMySQLQuery(sql, params);
    }
  }
  
  async executeSQLiteQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      // Convertir les requêtes MySQL en SQLite
      let sqliteSql = sql;
      
      // Remplacer les enums par des VARCHAR pour SQLite
      sqliteSql = sqliteSql.replace(/ENUM\s*$$[^$$]*$$/g, 'VARCHAR(255)');
      
      // Remplacer les clauses spécifiques à MySQL
      sqliteSql = sqliteSql.replace(/ON UPDATE CURRENT_TIMESTAMP/g, 'DEFAULT CURRENT_TIMESTAMP');
      
      // Adapter les requêtes selon le type
      if (sqliteSql.trim().toUpperCase().startsWith('SELECT')) {
        this.db.all(sqliteSql, params, (err, rows) => {
          if (err) {
            console.error('❌ Erreur SQLite SELECT:', err.message);
            reject(err);
          } else {
            resolve(rows);
          }
        });
      } else if (sqliteSql.trim().toUpperCase().startsWith('INSERT')) {
        this.db.run(sqliteSql, params, function(err) {
          if (err) {
            console.error('❌ Erreur SQLite INSERT:', err.message);
            reject(err);
          } else {
            resolve({ insertId: this.lastID, affectedRows: this.changes });
          }
        });
      } else if (sqliteSql.trim().toUpperCase().startsWith('UPDATE') || 
                 sqliteSql.trim().toUpperCase().startsWith('DELETE')) {
        this.db.run(sqliteSql, params, function(err) {
          if (err) {
            console.error('❌ Erreur SQLite UPDATE/DELETE:', err.message);
            reject(err);
          } else {
            resolve({ affectedRows: this.changes });
          }
        });
      } else {
        // Pour les autres requêtes (CREATE, ALTER, etc.)
        this.db.run(sqliteSql, params, function(err) {
          if (err) {
            console.error('❌ Erreur SQLite autre:', err.message);
            reject(err);
          } else {
            resolve({ affectedRows: this.changes });
          }
        });
      }
    });
  }
  
  async executeMySQLQuery(sql, params = []) {
    try {
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection(this.dbConfig);
      const [rows] = await connection.execute(sql, params);
      await connection.end();
      return rows;
    } catch (error) {
      console.error('❌ Erreur MySQL:', error.message);
      throw error;
    }
  }
  
  async testConnection() {
    try {
      if (this.dbType === 'sqlite') {
        console.log('✅ Connexion à SQLite réussie');
        console.log(`📊 Base de données: pigeon_manager.db`);
        return true;
      } else {
        // Test MySQL connection
        const mysql = require('mysql2/promise');
        const connection = await mysql.createConnection(this.dbConfig);
        console.log('✅ Connexion à MySQL réussie');
        console.log(`📊 Base de données: ${this.dbConfig.database}`);
        await connection.end();
        return true;
      }
    } catch (error) {
      console.error(`❌ Erreur de connexion à ${this.dbType}:`, error.message);
      return false;
    }
  }
}

// Exporter une instance singleton
const dbAdapter = new DatabaseAdapter();
module.exports = dbAdapter;