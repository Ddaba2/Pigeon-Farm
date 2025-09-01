const { executeQuery } = require('./config/database.js');

async function createCouplesTable() {
  try {
    console.log('🗄️ Création de la table couples...');
    
    const createTableSQL = `
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
    `;
    
    await executeQuery(createTableSQL);
    console.log('✅ Table couples créée avec succès !');
    
    // Vérifier que la table existe
    const tables = await executeQuery('SHOW TABLES');
    console.log('📋 Tables disponibles:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table couples:', error);
  } finally {
    process.exit(0);
  }
}

createCouplesTable(); 