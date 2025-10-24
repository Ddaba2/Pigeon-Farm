const { executeQuery } = require('./config/database');

async function verifyDatabase() {
  try {
    console.log('🔍 Vérification de la base de données...');
    
    // Tester la connexion
    const connected = await require('./config/database').testDatabaseConnection();
    if (!connected) {
      console.log('❌ Impossible de se connecter à la base de données');
      return;
    }
    
    // Vérifier si la colonne user_id existe dans la table sales
    console.log('🔍 Vérification de la structure de la table sales...');
    
    const salesColumns = await executeQuery(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'pigeon_manager' 
      AND TABLE_NAME = 'sales' 
      AND COLUMN_NAME = 'user_id'
    `);
    
    if (salesColumns.length > 0) {
      console.log('✅ La colonne user_id existe dans la table sales');
    } else {
      console.log('❌ La colonne user_id n\'existe pas dans la table sales');
      console.log('💡 Vous devez appliquer la migration:');
      console.log('   node backend/apply-migration.js');
      return;
    }
    
    // Vérifier s'il y a des ventes sans user_id
    const salesWithoutUser = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM sales 
      WHERE user_id IS NULL
    `);
    
    if (salesWithoutUser[0].count > 0) {
      console.log(`⚠️  Il y a ${salesWithoutUser[0].count} ventes sans user_id`);
      console.log('💡 Vous devez mettre à jour ces ventes avec un user_id valide');
    } else {
      console.log('✅ Toutes les ventes sont associées à un utilisateur');
    }
    
    // Vérifier les tables principales
    console.log('🔍 Vérification des tables...');
    const tables = await executeQuery('SHOW TABLES');
    console.log('📋 Tables disponibles:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });
    
    console.log('🎉 Vérification terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    process.exit(1);
  }
}

// Exécuter la vérification
verifyDatabase().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});