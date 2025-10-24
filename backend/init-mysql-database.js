const mysql = require('mysql2/promise');

// Configuration de la connexion MySQL sans spécifier de base de données
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT) || 3306
};

async function initDatabase() {
  let connection;
  
  try {
    // Connecter à MySQL sans base de données spécifique
    connection = await mysql.createConnection(config);
    console.log('✅ Connexion à MySQL réussie');
    
    // Créer la base de données si elle n'existe pas
    const dbName = process.env.DB_NAME || 'pigeon_manager';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Base de données '${dbName}' créée ou déjà existante`);
    
    // Utiliser la base de données
    await connection.execute(`USE \`${dbName}\``);
    console.log(`✅ Utilisation de la base de données '${dbName}'`);
    
    // Créer les tables si elles n'existent pas
    console.log('🔄 Création des tables...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        email_verified BOOLEAN DEFAULT FALSE,
        email_verification_token VARCHAR(255) NULL,
        password_reset_token VARCHAR(255) NULL,
        password_reset_expires TIMESTAMP NULL,
        google_id VARCHAR(255) NULL UNIQUE,
        avatar_url VARCHAR(500) NULL,
        auth_provider ENUM('local', 'google') DEFAULT 'local',
        status ENUM('active', 'pending', 'blocked') DEFAULT 'active',
        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_google_id (google_id),
        INDEX idx_auth_provider (auth_provider),
        INDEX idx_status (status)
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS couples (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        nestNumber VARCHAR(50) NOT NULL UNIQUE,
        race VARCHAR(100) NOT NULL,
        formationDate DATE,
        maleId VARCHAR(50),
        femaleId VARCHAR(50),
        observations TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_nest_number (nestNumber),
        INDEX idx_race (race),
        INDEX idx_status (status),
        INDEX idx_formation_date (formationDate)
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS eggs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        coupleId INT NOT NULL,
        egg1Date DATE NOT NULL,
        egg2Date DATE,
        hatchDate1 DATE,
        hatchDate2 DATE,
        success1 BOOLEAN DEFAULT FALSE,
        success2 BOOLEAN DEFAULT FALSE,
        observations TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (coupleId) REFERENCES couples(id) ON DELETE CASCADE,
        INDEX idx_couple_id (coupleId),
        INDEX idx_egg1_date (egg1Date),
        INDEX idx_hatch_date (hatchDate1)
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS pigeonneaux (
        id INT AUTO_INCREMENT PRIMARY KEY,
        coupleId INT NOT NULL,
        eggRecordId INT NOT NULL,
        birthDate DATE NOT NULL,
        sex ENUM('male','female','unknown') DEFAULT 'unknown',
        weight INT,
        weaningDate DATE,
        status ENUM('alive','sold','dead') DEFAULT 'alive',
        salePrice INT,
        saleDate DATE,
        buyer VARCHAR(255),
        observations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (coupleId) REFERENCES couples(id) ON DELETE CASCADE,
        FOREIGN KEY (eggRecordId) REFERENCES eggs(id) ON DELETE CASCADE,
        INDEX idx_couple_id (coupleId),
        INDEX idx_birth_date (birthDate),
        INDEX idx_status (status),
        INDEX idx_sale_date (saleDate)
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS healthRecords (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(100) NOT NULL,
        targetType VARCHAR(50) NOT NULL,
        targetId INT,
        product VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        nextDue DATE,
        observations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_target (targetType, targetId),
        INDEX idx_type (type),
        INDEX idx_date (date),
        INDEX idx_next_due (nextDue)
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        date DATE NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        amount DECIMAL(10,2) NOT NULL,
        description VARCHAR(255),
        client VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_date (date),
        INDEX idx_client (client),
        INDEX idx_amount (amount),
        INDEX idx_user_id (user_id)
      )
    `);
    
    console.log('✅ Toutes les tables ont été créées avec succès');
    
    // Ajouter la contrainte de clé étrangère pour sales si elle n'existe pas
    try {
      await connection.execute(`
        ALTER TABLE sales 
        ADD CONSTRAINT fk_sales_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      `);
      console.log('✅ Contrainte de clé étrangère ajoutée à la table sales');
    } catch (error) {
      // La contrainte existe peut-être déjà
      console.log('ℹ️  Contrainte de clé étrangère déjà existante ou erreur ignorée');
    }
    
    console.log('🎉 Initialisation de la base de données terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter l'initialisation
initDatabase().then(() => {
  console.log('✅ Script d\'initialisation terminé');
  process.exit(0);
}).catch(err => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});