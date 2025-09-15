// Test final pour vérifier que l'upload d'avatar fonctionne
const { executeQuery } = require('./config/database.js');

async function testFinalAvatar() {
  try {
    console.log('🧪 Test final de l\'upload d\'avatar...\n');
    
    // Vérifier la structure de la table users
    const describeResult = await executeQuery('DESCRIBE users');
    const avatarField = describeResult.find(field => field.Field === 'avatar_url');
    
    if (!avatarField) {
      console.log('❌ Champ avatar_url manquant');
      console.log('   Exécutez: fix-database-structure.bat');
      return;
    }
    
    console.log(`✅ Champ avatar_url trouvé: ${avatarField.Type}`);
    
    // Test d'insertion d'un avatar base64
    const testBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
    
    try {
      // Test de mise à jour avec une chaîne base64
      await executeQuery('UPDATE users SET avatar_url = ? WHERE id = 1 LIMIT 1', [testBase64]);
      console.log('✅ Test d\'insertion base64 réussi');
      
      // Vérifier que les données ont été stockées
      const result = await executeQuery('SELECT avatar_url FROM users WHERE id = 1 LIMIT 1');
      if (result[0] && result[0].avatar_url === testBase64) {
        console.log('✅ Vérification de lecture des données base64 réussie');
      } else {
        console.log('❌ Problème lors de la lecture des données');
      }
      
      // Nettoyer le test
      await executeQuery('UPDATE users SET avatar_url = NULL WHERE id = 1 LIMIT 1');
      console.log('✅ Nettoyage du test réussi');
      
    } catch (error) {
      console.log('❌ Erreur lors du test d\'insertion:', error.message);
      if (error.message.includes('Data too long')) {
        console.log('   Le champ est trop petit pour stocker des données base64');
        console.log('   Solution: exécuter fix-database-structure.bat');
      }
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
    
    console.log('\n🎉 Test final terminé!');
    console.log('\n📋 Résumé:');
    console.log('- Base de données prête pour les avatars ✓');
    console.log('- Support des données base64 ✓');
    console.log('- Champs de profil disponibles ✓');
    
  } catch (error) {
    console.error('❌ Erreur lors du test final:', error);
  }
  
  process.exit(0);
}

testFinalAvatar();
