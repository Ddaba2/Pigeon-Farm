// Script de test pour vérifier si la base de données est prête pour les avatars
const { executeQuery } = require('./config/database.js');

async function testDatabaseAvatar() {
  try {
    console.log('🔍 Vérification de la structure de la base de données...\n');
    
    // Vérifier la structure de la table users
    const describeResult = await executeQuery('DESCRIBE users');
    console.log('📋 Structure de la table users:');
    console.table(describeResult);
    
    // Vérifier si le champ avatar_url existe et son type
    const avatarField = describeResult.find(field => field.Field === 'avatar_url');
    if (avatarField) {
      console.log(`✅ Champ avatar_url trouvé: ${avatarField.Type}`);
      if (avatarField.Type.includes('LONGTEXT') || avatarField.Type.includes('MEDIUMTEXT')) {
        console.log('✅ Le champ peut stocker des données base64 longues');
      } else {
        console.log('⚠️  Le champ pourrait être trop petit pour les données base64');
        console.log('   Recommandation: exécuter update-avatar-field.sql');
      }
    } else {
      console.log('❌ Champ avatar_url manquant');
      console.log('   Action requise: exécuter update-avatar-field.sql');
    }
    
    // Vérifier les autres champs de profil
    const requiredFields = ['phone', 'address', 'bio', 'full_name'];
    console.log('\n📝 Vérification des autres champs de profil:');
    
    for (const field of requiredFields) {
      const fieldExists = describeResult.find(f => f.Field === field);
      if (fieldExists) {
        console.log(`✅ ${field}: ${fieldExists.Type}`);
      } else {
        console.log(`❌ ${field}: manquant`);
      }
    }
    
    // Test d'insertion d'un avatar base64 (simulation)
    console.log('\n🧪 Test de capacité de stockage...');
    const testBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
    
    if (avatarField) {
      try {
        // Test de mise à jour avec une chaîne base64
        await executeQuery('UPDATE users SET avatar_url = ? WHERE id = 1 LIMIT 1', [testBase64]);
        console.log('✅ Test d\'insertion base64 réussi');
        
        // Nettoyer le test
        await executeQuery('UPDATE users SET avatar_url = NULL WHERE id = 1 LIMIT 1');
        console.log('✅ Nettoyage du test réussi');
      } catch (error) {
        console.log('❌ Erreur lors du test d\'insertion:', error.message);
        if (error.message.includes('Data too long')) {
          console.log('   Le champ est trop petit pour stocker des données base64');
          console.log('   Solution: exécuter update-avatar-field.sql');
        }
      }
    }
    
    console.log('\n🎉 Vérification terminée!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
  
  process.exit(0);
}

testDatabaseAvatar();
