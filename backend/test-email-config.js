const EmailService = require('./services/emailService.js');

// Test de la configuration email
async function testEmailConfiguration() {
  console.log('🧪 Test de la configuration email...\n');

  // Afficher les variables d'environnement
  console.log('📋 Variables d\'environnement détectées:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Configuré' : '❌ Manquant');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Configuré' : '❌ Manquant');
  console.log('SMTP_USER:', process.env.SMTP_USER ? '✅ Configuré' : '❌ Manquant');
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ Configuré' : '❌ Manquant');
  console.log('SMTP_HOST:', process.env.SMTP_HOST || 'smtp.gmail.com');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || '587');
  console.log('');

  const emailService = new EmailService();

  // Test avec un utilisateur fictif
  const testUser = {
    id: 999,
    username: 'testuser',
    email: 'test@example.com',
    full_name: 'Test User'
  };

  try {
    console.log('📧 Test d\'envoi d\'email de bienvenue...');
    const result = await emailService.sendWelcomeEmail(testUser);
    
    if (result) {
      console.log('✅ Email envoyé avec succès !');
      console.log('📬 Vérifiez votre boîte email ou les logs du serveur.');
    } else {
      console.log('❌ Échec de l\'envoi de l\'email');
    }

    console.log('\n📧 Test d\'envoi d\'email de blocage...');
    const blockResult = await emailService.sendAccountBlockedNotification(testUser);
    
    if (blockResult) {
      console.log('✅ Email de blocage envoyé avec succès !');
    } else {
      console.log('❌ Échec de l\'envoi de l\'email de blocage');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Solution: Vérifiez vos identifiants Gmail et activez l\'authentification à 2 facteurs');
      console.log('   puis générez un mot de passe d\'application.');
    } else if (error.message.includes('Connection timeout')) {
      console.log('\n💡 Solution: Vérifiez votre connexion internet et les paramètres de pare-feu.');
    }
  }
}

// Test de la configuration SMTP
function testSMTPConfig() {
  console.log('🔧 Configuration SMTP détectée:');
  
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT || '587';

  console.log(`Host: ${host}`);
  console.log(`Port: ${port}`);
  console.log(`User: ${user ? '✅ Configuré' : '❌ Manquant'}`);
  console.log(`Pass: ${pass ? '✅ Configuré' : '❌ Manquant'}`);
  
  if (user && pass) {
    console.log('\n✅ Configuration SMTP complète !');
    console.log('📧 Les emails devraient être envoyés normalement.');
  } else {
    console.log('\n⚠️ Configuration SMTP incomplète !');
    console.log('📧 Les emails seront affichés dans la console en mode test.');
  }
}

// Exécuter les tests
if (require.main === module) {
  console.log('🚀 Test de la configuration email PigeonFarm\n');
  
  testSMTPConfig();
  console.log('\n' + '='.repeat(50) + '\n');
  
  testEmailConfiguration();
}

module.exports = {
  testEmailConfiguration,
  testSMTPConfig
};
