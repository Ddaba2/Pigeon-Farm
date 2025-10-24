const { executeQuery } = require('./config/database.js');
const fs = require('fs');
const path = require('path');

/**
 * Script de réinitialisation complète de la base de données
 * 
 * ⚠️ ATTENTION: Ce script supprime TOUTES les données et recrée la base de données
 * 
 * Ce script :
 * - Supprime toutes les tables
 * - Recrée le schéma complet
 * - Crée un utilisateur admin par défaut
 */

async function resetDatabase() {
  console.log('🔄 Début de la réinitialisation complète de la base de données...\n');
  console.log('⚠️  ATTENTION: Cette opération supprimera TOUTES les données!\n');

  try {
    // Désactiver temporairement les contraintes de clés étrangères
    await executeQuery('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✅ Contraintes de clés étrangères désactivées\n');

    // Obtenir la liste de toutes les tables
    const [tables] = await executeQuery('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);

    console.log('🗑️  Suppression de toutes les tables...\n');
    for (const tableName of tableNames) {
      try {
        await executeQuery(`DROP TABLE IF EXISTS ${tableName}`);
        console.log(`✅ Table ${tableName} supprimée`);
      } catch (error) {
        console.log(`⚠️  Erreur lors de la suppression de ${tableName}: ${error.message}`);
      }
    }

    // Réactiver les contraintes
    await executeQuery('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n✅ Contraintes de clés étrangères réactivées\n');

    // Lire et exécuter le schéma SQL
    console.log('📖 Lecture du schéma de base de données...\n');
    const schemaPath = path.join(__dirname, 'db_schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Fichier de schéma non trouvé: ${schemaPath}`);
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Exécuter le schéma SQL
    console.log('🔨 Création des tables...\n');
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('CREATE DATABASE'));

    for (const statement of statements) {
      try {
        await executeQuery(statement);
      } catch (error) {
        // Ignorer les erreurs "Table already exists"
        if (!error.message.includes('already exists')) {
          console.log(`⚠️  Erreur: ${error.message}`);
        }
      }
    }

    console.log('✅ Tables créées\n');

    // Créer un utilisateur admin par défaut
    console.log('👤 Création d\'un utilisateur admin par défaut...\n');
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 12);

    try {
      await executeQuery(`
        INSERT INTO users (username, email, password, full_name, role, status, created_at)
        VALUES ('admin', 'admin@pigeonfarm.com', ?, 'Administrateur', 'admin', 'active', NOW())
      `, [hashedPassword]);
      console.log('✅ Utilisateur admin créé:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   Email: admin@pigeonfarm.com\n');
    } catch (error) {
      if (error.message.includes('Duplicate entry')) {
        console.log('⚠️  L\'utilisateur admin existe déjà\n');
      } else {
        console.log(`⚠️  Erreur lors de la création de l'utilisateur admin: ${error.message}\n`);
      }
    }

    // Vérifier les tables créées
    console.log('📋 Vérification des tables créées...\n');
    const [newTables] = await executeQuery('SHOW TABLES');
    newTables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });

    console.log('\n✅ Réinitialisation de la base de données terminée avec succès!');
    console.log('\n📝 Prochaines étapes:');
    console.log('   1. Connectez-vous avec: admin / admin123');
    console.log('   2. Changez le mot de passe admin immédiatement');
    console.log('   3. Commencez à ajouter vos données');

  } catch (error) {
    console.error('\n❌ Erreur lors de la réinitialisation:', error.message);
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

// Exécuter la réinitialisation
if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('\n👋 Au revoir!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { resetDatabase };

