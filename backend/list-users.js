const { executeQuery } = require('./config/database.js');

async function listUsers() {
  try {
    console.log('👥 Liste de tous les utilisateurs:\n');
    
    const users = await executeQuery(`
      SELECT id, username, email, full_name, role, status, auth_provider, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    if (users.length === 0) {
      console.log('Aucun utilisateur trouvé');
    } else {
      console.table(users);
      console.log(`\n📊 Total: ${users.length} utilisateur(s)`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

listUsers();

