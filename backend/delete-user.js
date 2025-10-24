const { executeQuery } = require('./config/database.js');

async function deleteUser() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('❌ Usage:');
    console.log('  node delete-user.js username');
    console.log('  node delete-user.js email@example.com');
    process.exit(1);
  }
  
  const identifier = args[0];
  
  try {
    console.log(`🔍 Recherche de l'utilisateur: ${identifier}`);
    
    // Chercher par username ou email
    const user = await executeQuery(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [identifier, identifier]
    );
    
    if (user.length === 0) {
      console.log('❌ Utilisateur non trouvé');
      process.exit(1);
    }
    
    console.log('👤 Utilisateur trouvé:');
    console.table([{
      id: user[0].id,
      username: user[0].username,
      email: user[0].email,
      role: user[0].role
    }]);
    
    // Supprimer
    const result = await executeQuery(
      'DELETE FROM users WHERE id = ?',
      [user[0].id]
    );
    
    console.log(`✅ Utilisateur supprimé avec succès`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

deleteUser();

