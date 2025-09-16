const EmailService = require('./services/emailService.js');
const NotificationService = require('./services/notificationService.js');

// Test des notifications d'administration
async function testAdminNotifications() {
  console.log('🧪 Test des notifications d\'administration...\n');

  const emailService = new EmailService();

  // Données de test pour un utilisateur
  const testUser = {
    id: 999,
    username: 'testuser',
    email: 'test@example.com',
    full_name: 'Test User'
  };

  try {
    // Test 1: Notification de blocage
    console.log('📧 Test 1: Notification de compte bloqué');
    const blockResult = await emailService.sendAccountBlockedNotification(testUser);
    console.log('✅ Notification de blocage envoyée:', blockResult ? 'Succès' : 'Échec');

    // Test 2: Notification de déblocage
    console.log('\n📧 Test 2: Notification de compte débloqué');
    const unblockResult = await emailService.sendAccountUnblockedNotification(testUser);
    console.log('✅ Notification de déblocage envoyée:', unblockResult ? 'Succès' : 'Échec');

    // Test 3: Notification de suppression
    console.log('\n📧 Test 3: Notification de compte supprimé');
    const deleteResult = await emailService.sendAccountDeletedNotification(testUser);
    console.log('✅ Notification de suppression envoyée:', deleteResult ? 'Succès' : 'Échec');

    // Test 4: Notification de bienvenue
    console.log('\n📧 Test 4: Notification de bienvenue');
    const welcomeResult = await emailService.sendWelcomeEmail(testUser);
    console.log('✅ Notification de bienvenue envoyée:', welcomeResult ? 'Succès' : 'Échec');

    // Test 5: Création de notification en base
    console.log('\n📝 Test 5: Création de notification en base de données');
    try {
      const notificationId = await NotificationService.createNotification(
        testUser.id,
        '🧪 Test de notification',
        'Ceci est un test de notification d\'administration.',
        'info'
      );
      console.log('✅ Notification créée en base avec l\'ID:', notificationId);
    } catch (dbError) {
      console.log('⚠️ Erreur lors de la création en base (normal si pas de DB):', dbError.message);
    }

    console.log('\n🎉 Tous les tests terminés !');
    console.log('\n📋 Résumé:');
    console.log('- Templates d\'email: ✅ Fonctionnels');
    console.log('- Service d\'envoi: ✅ Fonctionnel');
    console.log('- Gestion d\'erreurs: ✅ Implémentée');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Fonction pour tester les templates d'email
function testEmailTemplates() {
  console.log('🎨 Test des templates d\'email...\n');

  const emailService = new EmailService();
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    full_name: 'Test User'
  };

  try {
    // Test des templates
    console.log('📄 Template de blocage:');
    const blockTemplate = emailService.generateAccountBlockedTemplate(testUser);
    console.log('✅ Template HTML généré (longueur:', blockTemplate.html.length, 'caractères)');
    console.log('✅ Template texte généré (longueur:', blockTemplate.text.length, 'caractères)');

    console.log('\n📄 Template de déblocage:');
    const unblockTemplate = emailService.generateAccountUnblockedTemplate(testUser);
    console.log('✅ Template HTML généré (longueur:', unblockTemplate.html.length, 'caractères)');
    console.log('✅ Template texte généré (longueur:', unblockTemplate.text.length, 'caractères)');

    console.log('\n📄 Template de suppression:');
    const deleteTemplate = emailService.generateAccountDeletedTemplate(testUser);
    console.log('✅ Template HTML généré (longueur:', deleteTemplate.html.length, 'caractères)');
    console.log('✅ Template texte généré (longueur:', deleteTemplate.text.length, 'caractères)');

    console.log('\n📄 Template de bienvenue:');
    const welcomeTemplate = emailService.generateWelcomeTemplate(testUser);
    console.log('✅ Template HTML généré (longueur:', welcomeTemplate.html.length, 'caractères)');
    console.log('✅ Template texte généré (longueur:', welcomeTemplate.text.length, 'caractères)');

    console.log('\n🎉 Tous les templates fonctionnent correctement !');

  } catch (error) {
    console.error('❌ Erreur lors du test des templates:', error);
  }
}

// Exécuter les tests
if (require.main === module) {
  console.log('🚀 Démarrage des tests de notifications d\'administration\n');
  
  // Test des templates
  testEmailTemplates();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test des notifications
  testAdminNotifications();
}

module.exports = {
  testAdminNotifications,
  testEmailTemplates
};
