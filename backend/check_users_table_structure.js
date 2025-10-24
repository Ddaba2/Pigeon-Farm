const { executeQuery } = require('./config/database');

console.log('🔍 Vérification de la structure de la table users...');

async function checkUsersTable() {
  try {
    // Vérifier la structure de la table
    const structure = await executeQuery('DESCRIBE users');
    console.log('\n📋 Structure de la table users:');
    structure.forEach(row => {
      console.log(`  ${row.Field}: ${row.Type} ${row.Null === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

checkUsersTable();
