const UserService = require('./services/userService.js');
const EmailService = require('./services/emailService.js');

// Test de suppression d'utilisateur
async function testDeleteUser() {
  console.log('🧪 Test de suppression d\'utilisateur...\n');

  const emailService = new EmailService();

  // Créer un utilisateur de test
  console.log('📝 Création d\'un utilisateur de test...');
  try {
    const testUser = await UserService.createUser({
      username: 'test_delete_user',
      email: 'test_delete@example.com',
      password: 'testpassword123',
      fullName: 'Test Delete User',
      role: 'user'
    });

    console.log('✅ Utilisateur de test créé avec l\'ID:', testUser.id);

    // Test d'envoi d'email de suppression
    console.log('\n📧 Test d\'envoi d\'email de suppression...');
    try {
      await emailService.sendAccountDeletedNotification(testUser);
      console.log('✅ Email de suppression envoyé avec succès');
    } catch (emailError) {
      console.log('⚠️ Erreur lors de l\'envoi de l\'email:', emailError.message);
    }

    // Test de suppression
    console.log('\n🗑️ Test de suppression de l\'utilisateur...');
    try {
      const deleteResult = await UserService.deleteUserAdmin(testUser.id);
      console.log('✅ Utilisateur supprimé avec succès:', deleteResult);
    } catch (deleteError) {
      console.log('❌ Erreur lors de la suppression:', deleteError.message);
    }

    // Vérifier que l'utilisateur n'existe plus
    console.log('\n🔍 Vérification que l\'utilisateur n\'existe plus...');
    try {
      const userCheck = await UserService.getUserById(testUser.id);
      if (!userCheck) {
        console.log('✅ Utilisateur supprimé avec succès - plus trouvé en base');
      } else {
        console.log('❌ Utilisateur toujours présent en base');
      }
    } catch (checkError) {
      console.log('⚠️ Erreur lors de la vérification:', checkError.message);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Test de la route de suppression (simulation)
async function testDeleteRoute() {
  console.log('\n🧪 Test de la route de suppression...\n');

  const emailService = new EmailService();

  // Simuler les données d'un utilisateur existant
  const existingUser = {
    id: 999,
    username: 'existing_user',
    email: 'existing@example.com',
    full_name: 'Existing User'
  };

  try {
    // Simuler l'envoi d'email AVANT suppression
    console.log('📧 Envoi d\'email de notification...');
    await emailService.sendAccountDeletedNotification(existingUser);
    console.log('✅ Email envoyé avec succès');

    // Simuler la suppression (sans vraiment supprimer)
    console.log('🗑️ Simulation de suppression...');
    console.log('✅ Suppression simulée avec succès');

    console.log('\n🎉 Test de route terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test de route:', error.message);
  }
}

// Exécuter les tests
if (require.main === module) {
  console.log('🚀 Test de suppression d\'utilisateur PigeonFarm\n');
  
  testDeleteRoute();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  testDeleteUser();
}

module.exports = {
  testDeleteUser,
  testDeleteRoute
};
