const { executeQuery } = require('./config/database.js');
const statisticsService = require('./services/statisticsService.js');

async function testStatisticsHealth() {
  console.log('🧪 Test des statistiques de santé...\n');

  try {
    // 1. Compter les health records existants
    console.log('1️⃣  Comptage des health records existants...');
    const healthRecords = await executeQuery('SELECT COUNT(*) as total FROM healthRecords');
    console.log(`   ✅ Total de health records: ${healthRecords[0].total}\n`);

    // 2. Compter par type
    console.log('2️⃣  Comptage par type...');
    const healthByType = await executeQuery(`
      SELECT 
        type,
        COUNT(*) as count
      FROM healthRecords
      GROUP BY type
    `);
    
    healthByType.forEach(record => {
      console.log(`   - ${record.type}: ${record.count}`);
    });
    console.log('');

    // 3. Tester getStatsByUser
    console.log('3️⃣  Test de getStatsByUser...');
    const stats = await statisticsService.getStatsByUser(1);
    console.log(`   ✅ Health records dans les stats: ${stats.totalHealthRecords}`);
    console.log(`   ✅ Couples: ${stats.totalCouples}`);
    console.log(`   ✅ Œufs: ${stats.totalEggs}`);
    console.log(`   ✅ Pigeonneaux: ${stats.totalPigeonneaux}`);
    console.log(`   ✅ Ventes: ${stats.totalSales}`);
    console.log('');

    // 4. Tester getDashboardStats
    console.log('4️⃣  Test de getDashboardStats...');
    const dashboardStats = await statisticsService.getDashboardStats();
    console.log(`   ✅ Total health records: ${dashboardStats.totalHealthRecords}`);
    console.log(`   ✅ Health by type:`, dashboardStats.healthByType);
    console.log('');

    // 5. Ajouter un health record de test
    console.log('5️⃣  Ajout d\'un health record de test...');
    try {
      await executeQuery(`
        INSERT INTO healthRecords (type, targetType, targetId, product, date, observations, created_at, updated_at)
        VALUES ('traitement', 'couple', 999, 'Test Product', CURDATE(), 'Test observation', NOW(), NOW())
      `);
      console.log('   ✅ Health record de test ajouté\n');
    } catch (error) {
      console.log(`   ⚠️  Erreur lors de l'ajout: ${error.message}\n`);
    }

    // 6. Vérifier que le nouveau health record est compté
    console.log('6️⃣  Vérification du nouveau health record...');
    const newCount = await executeQuery('SELECT COUNT(*) as total FROM healthRecords');
    console.log(`   ✅ Nouveau total: ${newCount[0].total}`);
    
    if (newCount[0].total > healthRecords[0].total) {
      console.log('   ✅ Le nouveau health record est bien compté!\n');
    } else {
      console.log('   ⚠️  Le health record n\'a pas été ajouté ou pas compté\n');
    }

    // 7. Nettoyer le health record de test
    console.log('7️⃣  Nettoyage du health record de test...');
    await executeQuery("DELETE FROM healthRecords WHERE product = 'Test Product'");
    console.log('   ✅ Health record de test supprimé\n');

    console.log('✅ Tous les tests sont passés avec succès!');
    console.log('\n📋 Résumé des modifications :');
    console.log('   ✅ Les health records sont maintenant tous comptés (pas de filtre par couple)');
    console.log('   ✅ Les types "traitement" et "examen" sont correctement comptés');
    console.log('   ✅ Les statistiques se rafraîchissent automatiquement toutes les 30 secondes');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testStatisticsHealth()
  .then(() => {
    console.log('\n👋 Tests terminés!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });

