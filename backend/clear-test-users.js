const { executeQuery } = require('./config/database.js');

async function clearTestUsers() {
  try {
    console.log('🧹 Nettoyage des utilisateurs de test...');
    
    // Option 1: Supprimer tous les utilisateurs sauf les admins
    const sql = `DELETE FROM users WHERE role != 'admin'`;
    const result = await executeQuery(sql);
    
    console.log(`✅ ${result.affectedRows} utilisateur(s) supprimé(s)`);
    
    // Option 2: Afficher les utilisateurs restants
    const users = await executeQuery('SELECT id, username, email, role FROM users');
    console.log('\n📋 Utilisateurs restants:');
    console.table(users);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

clearTestUsers();

