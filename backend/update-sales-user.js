const { executeQuery } = require('./config/database');

async function updateSalesUser() {
  try {
    console.log('🔍 Mise à jour des ventes existantes...');
    
    // Vérifier s'il y a des ventes sans user_id
    const salesWithoutUser = await executeQuery(`
      SELECT id 
      FROM sales 
      WHERE user_id IS NULL
      LIMIT 5
    `);
    
    if (salesWithoutUser.length === 0) {
      console.log('✅ Aucune vente sans user_id trouvée');
      return;
    }
    
    console.log(`🔍 ${salesWithoutUser.length} ventes sans user_id trouvées (affichage des 5 premières)`);
    
    // Récupérer le premier utilisateur
    const users = await executeQuery(`
      SELECT id 
      FROM users 
      ORDER BY id 
      LIMIT 1
    `);
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
      console.log('💡 Vous devez d\'abord créer un utilisateur');
      return;
    }
    
    const firstUserId = users[0].id;
    console.log(`👤 Association des ventes à l'utilisateur ID: ${firstUserId}`);
    
    // Mettre à jour toutes les ventes sans user_id
    const result = await executeQuery(`
      UPDATE sales 
      SET user_id = ?
      WHERE user_id IS NULL
    `, [firstUserId]);
    
    console.log(`✅ ${result.affectedRows} ventes mises à jour`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error.message);
    process.exit(1);
  }
}

// Exécuter la mise à jour
updateSalesUser().then(() => {
  console.log('🎉 Mise à jour terminée avec succès !');
  process.exit(0);
}).catch(err => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});