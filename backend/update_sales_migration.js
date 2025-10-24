const { executeQuery } = require('./config/database');

async function updateSalesTable() {
  try {
    console.log('🔍 Vérification de la structure de la table sales...');
    
    // Vérifier si la colonne user_id existe déjà
    const columns = await executeQuery(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'pigeon_manager' 
      AND TABLE_NAME = 'sales' 
      AND COLUMN_NAME = 'user_id'
    `);
    
    if (columns.length > 0) {
      console.log('✅ La colonne user_id existe déjà dans la table sales');
      return;
    }
    
    console.log('🔄 Ajout de la colonne user_id à la table sales...');
    
    // Ajouter la colonne user_id (temporairement nullable)
    await executeQuery(`
      ALTER TABLE sales 
      ADD COLUMN user_id INT NULL
    `);
    
    console.log('✅ Colonne user_id ajoutée');
    
    // Associer toutes les ventes existantes au premier utilisateur trouvé
    const users = await executeQuery('SELECT id FROM users ORDER BY id LIMIT 1');
    if (users.length > 0) {
      const firstUserId = users[0].id;
      console.log(`🔄 Association de toutes les ventes existantes à l'utilisateur ID ${firstUserId}...`);
      
      await executeQuery(`
        UPDATE sales 
        SET user_id = ? 
        WHERE user_id IS NULL
      `, [firstUserId]);
      
      console.log('✅ Toutes les ventes ont été associées à un utilisateur');
    }
    
    // Rendre la colonne user_id non nullable
    console.log('🔄 Modification de la colonne user_id pour la rendre non nullable...');
    await executeQuery(`
      ALTER TABLE sales 
      MODIFY COLUMN user_id INT NOT NULL
    `);
    
    // Ajouter la contrainte de clé étrangère
    console.log('🔄 Ajout de la contrainte de clé étrangère...');
    await executeQuery(`
      ALTER TABLE sales 
      ADD CONSTRAINT fk_sales_user 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `);
    
    // Ajouter un index pour améliorer les performances
    console.log('🔄 Ajout de l\'index sur user_id...');
    await executeQuery(`
      ALTER TABLE sales 
      ADD INDEX idx_user_id (user_id)
    `);
    
    console.log('✅ Migration terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

// Exécuter la migration
updateSalesTable().then(() => {
  console.log('🎉 Script de migration terminé');
  process.exit(0);
}).catch(err => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});