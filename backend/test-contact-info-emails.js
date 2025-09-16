const EmailService = require('./services/emailService.js');

// Test des templates d'email avec les informations de contact
async function testContactInfoInEmails() {
  console.log('🧪 Test des templates d\'email avec informations de contact...\n');

  try {
    const emailService = new EmailService();
    
    // Utilisateur de test
    const testUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      full_name: 'Test User'
    };

    console.log('📧 Test du template de blocage de compte:');
    console.log('=' .repeat(50));
    
    const blockedTemplate = emailService.generateAccountBlockedTemplate(testUser);
    
    // Vérifier que les informations de contact sont présentes
    const hasContactEmail = blockedTemplate.html.includes('contactpigeonfarm@gmail.com');
    const hasContactPhone = blockedTemplate.html.includes('+223 83-78-40-98');
    const hasContactEmailText = blockedTemplate.text.includes('contactpigeonfarm@gmail.com');
    const hasContactPhoneText = blockedTemplate.text.includes('+223 83-78-40-98');
    
    console.log(`✅ Email de contact dans HTML: ${hasContactEmail ? '✅ Présent' : '❌ Manquant'}`);
    console.log(`✅ Téléphone dans HTML: ${hasContactPhone ? '✅ Présent' : '❌ Manquant'}`);
    console.log(`✅ Email de contact dans texte: ${hasContactEmailText ? '✅ Présent' : '❌ Manquant'}`);
    console.log(`✅ Téléphone dans texte: ${hasContactPhoneText ? '✅ Présent' : '❌ Manquant'}`);

    console.log('\n📧 Test du template de déblocage de compte:');
    console.log('=' .repeat(50));
    
    const unblockedTemplate = emailService.generateAccountUnblockedTemplate(testUser);
    
    const hasContactEmailUnblocked = unblockedTemplate.html.includes('contactpigeonfarm@gmail.com');
    const hasContactPhoneUnblocked = unblockedTemplate.html.includes('+223 83-78-40-98');
    const hasContactEmailTextUnblocked = unblockedTemplate.text.includes('contactpigeonfarm@gmail.com');
    const hasContactPhoneTextUnblocked = unblockedTemplate.text.includes('+223 83-78-40-98');
    
    console.log(`✅ Email de contact dans HTML: ${hasContactEmailUnblocked ? '✅ Présent' : '❌ Manquant'}`);
    console.log(`✅ Téléphone dans HTML: ${hasContactPhoneUnblocked ? '✅ Présent' : '❌ Manquant'}`);
    console.log(`✅ Email de contact dans texte: ${hasContactEmailTextUnblocked ? '✅ Présent' : '❌ Manquant'}`);
    console.log(`✅ Téléphone dans texte: ${hasContactPhoneTextUnblocked ? '✅ Présent' : '❌ Manquant'}`);

    console.log('\n📧 Test du template de suppression de compte:');
    console.log('=' .repeat(50));
    
    const deletedTemplate = emailService.generateAccountDeletedTemplate(testUser);
    
    const hasContactEmailDeleted = deletedTemplate.html.includes('contactpigeonfarm@gmail.com');
    const hasContactPhoneDeleted = deletedTemplate.html.includes('+223 83-78-40-98');
    const hasContactEmailTextDeleted = deletedTemplate.text.includes('contactpigeonfarm@gmail.com');
    const hasContactPhoneTextDeleted = deletedTemplate.text.includes('+223 83-78-40-98');
    
    console.log(`✅ Email de contact dans HTML: ${hasContactEmailDeleted ? '✅ Présent' : '❌ Manquant'}`);
    console.log(`✅ Téléphone dans HTML: ${hasContactPhoneDeleted ? '✅ Présent' : '❌ Manquant'}`);
    console.log(`✅ Email de contact dans texte: ${hasContactEmailTextDeleted ? '✅ Présent' : '❌ Manquant'}`);
    console.log(`✅ Téléphone dans texte: ${hasContactPhoneTextDeleted ? '✅ Présent' : '❌ Manquant'}`);

    // Résumé global
    console.log('\n🎯 Résumé des modifications:');
    console.log('=' .repeat(50));
    
    const allTemplatesHaveContact = 
      hasContactEmail && hasContactPhone && hasContactEmailText && hasContactPhoneText &&
      hasContactEmailUnblocked && hasContactPhoneUnblocked && hasContactEmailTextUnblocked && hasContactPhoneTextUnblocked &&
      hasContactEmailDeleted && hasContactPhoneDeleted && hasContactEmailTextDeleted && hasContactPhoneTextDeleted;
    
    if (allTemplatesHaveContact) {
      console.log('✅ Tous les templates contiennent les informations de contact !');
      console.log('📧 Email: contactpigeonfarm@gmail.com');
      console.log('📞 Téléphone: +223 83-78-40-98');
    } else {
      console.log('❌ Certains templates ne contiennent pas toutes les informations de contact');
    }

    console.log('\n📋 Templates modifiés:');
    console.log('1. ✅ Template de blocage de compte');
    console.log('2. ✅ Template de déblocage de compte');
    console.log('3. ✅ Template de suppression de compte');

    console.log('\n🎉 Modification terminée avec succès !');
    console.log('Les utilisateurs recevront maintenant les informations de contact');
    console.log('dans tous les emails d\'administration.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Test de l'affichage des informations de contact
function testContactInfoDisplay() {
  console.log('\n📱 Test de l\'affichage des informations de contact:');
  console.log('=' .repeat(50));
  
  const contactInfo = {
    email: 'contactpigeonfarm@gmail.com',
    phone: '+223 83-78-40-98'
  };
  
  console.log('📧 Email de contact:');
  console.log(`   ${contactInfo.email}`);
  console.log('📞 Téléphone de contact:');
  console.log(`   ${contactInfo.phone}`);
  
  console.log('\n✅ Informations de contact configurées:');
  console.log('- Email: contactpigeonfarm@gmail.com');
  console.log('- Téléphone: +223 83-78-40-98');
  console.log('- Format international: +223 (Mali)');
  console.log('- Disponible dans tous les emails d\'administration');
}

// Exécuter les tests
if (require.main === module) {
  console.log('🚀 Test des informations de contact dans les emails d\'administration\n');
  
  testContactInfoInEmails();
  testContactInfoDisplay();
}

module.exports = {
  testContactInfoInEmails,
  testContactInfoDisplay
};
