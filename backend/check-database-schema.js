const { executeQuery } = require('./config/database.js');

// Vérifier la structure des tables de la base de données
async function checkDatabaseSchema() {
  console.log('🔍 Vérification de la structure de la base de données...\n');

  try {
    // Tables à vérifier
    const tables = [
      'users',
      'couples', 
      'eggs',
      'pigeonneaux',
      'health_records',
      'sales',
      'action_logs',
      'notifications'
    ];

    for (const tableName of tables) {
      console.log(`📋 Table: ${tableName}`);
      console.log('=' .repeat(30));
      
      try {
        const columns = await executeQuery(`DESCRIBE ${tableName}`);
        
        console.log('Colonnes:');
        columns.forEach(col => {
          console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        // Vérifier spécifiquement les colonnes user_id ou user
        const userColumns = columns.filter(col => 
          col.Field.includes('user') || col.Field.includes('owner') || col.Field.includes('created_by')
        );
        
        if (userColumns.length > 0) {
          console.log('🔗 Colonnes liées à l\'utilisateur:');
          userColumns.forEach(col => {
            console.log(`   ✅ ${col.Field} (${col.Type})`);
          });
        } else {
          console.log('⚠️ Aucune colonne liée à l\'utilisateur trouvée');
        }
        
      } catch (error) {
        console.log(`❌ Erreur lors de la vérification de ${tableName}:`, error.message);
      }
      
      console.log('');
    }

    console.log('🎯 Résumé des colonnes utilisateur par table:');
    console.log('=' .repeat(50));
    
    for (const tableName of tables) {
      try {
        const columns = await executeQuery(`DESCRIBE ${tableName}`);
        const userColumns = columns.filter(col => 
          col.Field.includes('user') || col.Field.includes('owner') || col.Field.includes('created_by')
        );
        
        if (userColumns.length > 0) {
          console.log(`✅ ${tableName}: ${userColumns.map(col => col.Field).join(', ')}`);
        } else {
          console.log(`❌ ${tableName}: Aucune colonne utilisateur`);
        }
      } catch (error) {
        console.log(`❌ ${tableName}: Erreur - ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter la vérification
if (require.main === module) {
  checkDatabaseSchema();
}

module.exports = { checkDatabaseSchema };
