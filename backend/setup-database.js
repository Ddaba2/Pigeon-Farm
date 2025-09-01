const fs = require('fs');
const path = require('path');
const { executeQuery } = require('./config/database.js');

async function setupDatabase() {
  try {
    console.log('🗄️ Configuration de la base de données...');
    
    // Lire le fichier de schéma
    const schemaPath = path.join(__dirname, 'db_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Diviser le schéma en requêtes individuelles
    const queries = schema
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--'));
    
    console.log(`📋 Exécution de ${queries.length} requêtes...`);
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      if (query.trim()) {
        try {
          await executeQuery(query);
          console.log(`✅ Requête ${i + 1}/${queries.length} exécutée`);
        } catch (error) {
          // Ignorer les erreurs de tables déjà existantes
          if (error.message.includes('already exists')) {
            console.log(`⚠️ Table déjà existante (requête ${i + 1})`);
          } else {
            console.error(`❌ Erreur requête ${i + 1}:`, error.message);
          }
        }
      }
    }
    
    console.log('✅ Configuration de la base de données terminée !');
    
    // Vérifier les tables créées
    const tables = await executeQuery('SHOW TABLES');
    console.log('📋 Tables disponibles:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
  } finally {
    process.exit(0);
  }
}

setupDatabase(); 