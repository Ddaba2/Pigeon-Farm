// Script de test pour vérifier que l'API avatar fonctionne
const { executeQuery } = require('./config/database.js');

async function testAvatarAPI() {
  try {
    console.log('🧪 Test de l\'API avatar...\n');
    
    // 1. Vérifier qu'il y a un utilisateur de test
    console.log('1. Vérification de l\'utilisateur de test...');
    const users = await executeQuery('SELECT id, username, avatar_url FROM users LIMIT 1');
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
      return;
    }
    
    const testUser = users[0];
    console.log(`✅ Utilisateur de test trouvé: ${testUser.username} (ID: ${testUser.id})`);
    
    // 2. Test d'insertion d'un avatar base64
    console.log('\n2. Test d\'insertion d\'avatar...');
    const testBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
    
    try {
      await executeQuery('UPDATE users SET avatar_url = ? WHERE id = ?', [testBase64, testUser.id]);
      console.log('✅ Avatar inséré avec succès');
      
      // Vérifier la lecture
      const result = await executeQuery('SELECT avatar_url FROM users WHERE id = ?', [testUser.id]);
      if (result[0] && result[0].avatar_url === testBase64) {
        console.log('✅ Avatar lu avec succès');
      } else {
        console.log('❌ Problème lors de la lecture de l\'avatar');
      }
      
    } catch (error) {
      console.log('❌ Erreur lors de l\'insertion:', error.message);
    }
    
    // 3. Test de la méthode updateProfile du service
    console.log('\n3. Test de la méthode updateProfile...');
    try {
      const UserService = require('./services/userService.js');
      const updatedUser = await UserService.updateProfile(testUser.id, { 
        avatar_url: testBase64 
      });
      
      if (updatedUser) {
        console.log('✅ Méthode updateProfile fonctionne');
        console.log(`   Avatar URL: ${updatedUser.avatar_url ? 'Présent' : 'Absent'}`);
      } else {
        console.log('❌ Méthode updateProfile a échoué');
      }
      
    } catch (error) {
      console.log('❌ Erreur dans updateProfile:', error.message);
    }
    
    // 4. Nettoyer le test
    console.log('\n4. Nettoyage du test...');
    await executeQuery('UPDATE users SET avatar_url = NULL WHERE id = ?', [testUser.id]);
    console.log('✅ Test nettoyé');
    
    console.log('\n🎉 Test de l\'API avatar terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
  
  process.exit(0);
}

testAvatarAPI();
