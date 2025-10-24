const { executeQuery } = require('./config/database');

console.log('🔍 Vérification de la structure de la table sales...');

async function checkSalesTable() {
  try {
    // Vérifier la structure de la table
    const structure = await executeQuery('DESCRIBE sales');
    console.log('\n📋 Structure de la table sales:');
    structure.forEach(row => {
      console.log(`  ${row.Field}: ${row.Type} ${row.Null === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    // Vérifier les données existantes
    const data = await executeQuery('SELECT * FROM sales LIMIT 5');
    console.log('\n📊 Données existantes (5 premières lignes):');
    if (data.length === 0) {
      console.log('  Aucune donnée trouvée');
    } else {
      data.forEach(row => {
        console.log(`  ID: ${row.id}, User ID: ${row.user_id}, Date: ${row.date}, Amount: ${row.amount}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

checkSalesTable();
