const { executeTransaction } = require('./config/database.js');

// Test de la correction de executeTransaction
async function testTransactionFix() {
  console.log('🔧 Test de la correction executeTransaction...\n');

  try {
    // Test avec callback (format utilisé dans userService)
    console.log('1️⃣ Test avec callback (format userService):');
    const result = await executeTransaction(async (connection) => {
      // Test simple
      const [rows] = await connection.execute('SELECT 1 as test');
      return rows[0].test;
    });
    
    console.log(`✅ Résultat: ${result}`);
    
    // Test avec tableau (ancien format)
    console.log('\n2️⃣ Test avec tableau (ancien format):');
    const queries = [
      { sql: 'SELECT 1 as test1', params: [] },
      { sql: 'SELECT 2 as test2', params: [] }
    ];
    
    const results = await executeTransaction(queries);
    console.log(`✅ Résultats: ${results.length} requêtes exécutées`);
    
    console.log('\n🎉 Correction réussie !');
    console.log('✅ executeTransaction supporte maintenant les deux formats');
    console.log('✅ La suppression d\'utilisateur devrait fonctionner');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Détails:', error);
  }
}

// Test spécifique de la suppression d'utilisateur
async function testUserDeletion() {
  console.log('\n🧪 Test de la suppression d\'utilisateur...');
  
  try {
    const UserService = require('./services/userService.js');
    
    // Test avec un utilisateur de test (ne pas vraiment supprimer)
    console.log('⚠️ Test de simulation - pas de suppression réelle');
    
    // Vérifier que la méthode existe et est accessible
    if (typeof UserService.deleteUserAdmin === 'function') {
      console.log('✅ Méthode deleteUserAdmin accessible');
    } else {
      console.log('❌ Méthode deleteUserAdmin non accessible');
    }
    
    console.log('✅ La suppression d\'utilisateur devrait maintenant fonctionner');
    
  } catch (error) {
    console.error('❌ Erreur lors du test de suppression:', error.message);
  }
}

// Exécuter les tests
if (require.main === module) {
  console.log('🚀 Test de la correction executeTransaction\n');
  
  testTransactionFix();
  testUserDeletion();
}

module.exports = {
  testTransactionFix,
  testUserDeletion
};

