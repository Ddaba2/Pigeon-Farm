const { executeQuery } = require('./config/database.js');

/**
 * Script de nettoyage de la base de données
 * 
 * Ce script supprime toutes les données de test tout en préservant :
 * - Les utilisateurs admin essentiels
 * - La structure de la base de données
 */

async function cleanDatabase() {
  console.log('🧹 Début du nettoyage de la base de données...\n');

  try {
    // Désactiver temporairement les contraintes de clés étrangères
    await executeQuery('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✅ Contraintes de clés étrangères désactivées\n');

    // Tables à nettoyer
    const tablesToClean = [
      'couples',
      'eggs',
      'pigeonneaux',
      'healthRecords',
      'sales',
      'notifications',
      'audit_logs',
      'password_reset_codes',
      'sessions',
      'user_preferences'
    ];

    // Compter les enregistrements avant suppression
    console.log('📊 Comptage des enregistrements avant suppression...\n');
    for (const table of tablesToClean) {
      try {
        const [countResult] = await executeQuery(`SELECT COUNT(*) as count FROM ${table}`);
        const count = countResult.count;
        console.log(`   ${table}: ${count} enregistrements`);
      } catch (error) {
        console.log(`   ${table}: Table non trouvée ou erreur`);
      }
    }

    console.log('\n🗑️  Suppression des données...\n');

    // Supprimer les données dans l'ordre approprié (en respectant les dépendances)
    for (const table of tablesToClean) {
      try {
        const result = await executeQuery(`DELETE FROM ${table}`);
        console.log(`✅ ${table}: ${result.affectedRows} enregistrements supprimés`);
      } catch (error) {
        console.log(`⚠️  ${table}: ${error.message}`);
      }
    }

    // Supprimer les utilisateurs non-admin
    console.log('\n👥 Nettoyage des utilisateurs...\n');
    try {
      const result = await executeQuery(`DELETE FROM users WHERE role != 'admin'`);
      console.log(`✅ Utilisateurs non-admin: ${result.affectedRows} supprimés`);
    } catch (error) {
      console.log(`⚠️  Erreur lors de la suppression des utilisateurs: ${error.message}`);
    }

    // Réinitialiser les compteurs AUTO_INCREMENT
    console.log('\n🔄 Réinitialisation des compteurs AUTO_INCREMENT...\n');
    const tablesWithAutoIncrement = [
      'couples',
      'eggs',
      'pigeonneaux',
      'healthRecords',
      'sales',
      'notifications',
      'audit_logs',
      'password_reset_codes',
      'sessions',
      'user_preferences',
      'users'
    ];

    for (const table of tablesWithAutoIncrement) {
      try {
        await executeQuery(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
        console.log(`✅ ${table}: Compteur réinitialisé`);
      } catch (error) {
        console.log(`⚠️  ${table}: ${error.message}`);
      }
    }

    // Réactiver les contraintes de clés étrangères
    await executeQuery('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n✅ Contraintes de clés étrangères réactivées');

    // Compter les enregistrements après suppression
    console.log('\n📊 Comptage des enregistrements après suppression...\n');
    for (const table of tablesToClean) {
      try {
        const [countResult] = await executeQuery(`SELECT COUNT(*) as count FROM ${table}`);
        const count = countResult.count;
        console.log(`   ${table}: ${count} enregistrements`);
      } catch (error) {
        console.log(`   ${table}: Table non trouvée ou erreur`);
      }
    }

    // Vérifier les utilisateurs restants
    console.log('\n👥 Utilisateurs restants:\n');
    try {
      const users = await executeQuery('SELECT id, username, email, role FROM users');
      users.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - ${user.role}`);
      });
    } catch (error) {
      console.log(`⚠️  Erreur: ${error.message}`);
    }

    console.log('\n✅ Nettoyage de la base de données terminé avec succès!');
    console.log('\n📝 Note: Les utilisateurs admin et la structure de la base de données ont été préservés.');

  } catch (error) {
    console.error('\n❌ Erreur lors du nettoyage:', error.message);
    console.error(error);
    
    // Réactiver les contraintes en cas d'erreur
    try {
      await executeQuery('SET FOREIGN_KEY_CHECKS = 1');
    } catch (e) {
      console.error('Impossible de réactiver les contraintes:', e.message);
    }
    
    process.exit(1);
  }
}

// Exécuter le nettoyage
if (require.main === module) {
  cleanDatabase()
    .then(() => {
      console.log('\n👋 Au revoir!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { cleanDatabase };

