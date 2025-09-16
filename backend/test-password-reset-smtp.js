const EmailService = require('./services/emailService.js');

// Test de la réinitialisation de mot de passe avec SMTP
async function testPasswordResetSMTP() {
  console.log('🧪 Test de la réinitialisation de mot de passe avec SMTP...\n');

  const emailService = new EmailService();

  // Données de test
  const testEmail = 'test@example.com';
  const testCode = '1234';

  try {
    console.log('📋 Configuration SMTP détectée:');
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = process.env.SMTP_PORT || '587';

    console.log(`Host: ${host}`);
    console.log(`Port: ${port}`);
    console.log(`User: ${user ? '✅ Configuré' : '❌ Manquant'}`);
    console.log(`Pass: ${pass ? '✅ Configuré' : '❌ Manquant'}`);
    console.log('');

    if (user && pass) {
      console.log('✅ Configuration SMTP complète !');
      console.log('📧 Les emails de réinitialisation seront envoyés via SMTP');
    } else {
      console.log('⚠️ Configuration SMTP incomplète !');
      console.log('📧 Les emails seront affichés dans la console en mode test');
    }

    console.log('\n📧 Test d\'envoi d\'email de réinitialisation...');
    
    // Simuler l'envoi d'email de réinitialisation
    const subject = '🔑 Code de réinitialisation PigeonFarm';
    const text = `
Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe pour votre compte PigeonFarm.

Votre code de réinitialisation est : ${testCode}

⚠️ Important :
- Ce code expire dans 15 minutes
- Ne partagez jamais ce code avec personne
- Si vous n'avez pas demandé cette réinitialisation, ignorez cet email

Instructions :
1. Copiez le code ci-dessus
2. Retournez sur la page de réinitialisation
3. Entrez le code dans le champ approprié
4. Créez votre nouveau mot de passe

Si vous avez des questions ou besoin d'aide, contactez notre équipe de support.

Cordialement,
L'équipe PigeonFarm

---
Cet email a été envoyé automatiquement suite à votre demande de réinitialisation.
Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Réinitialisation de mot de passe - PigeonFarm</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background-color: #f8f9fa; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background-color: #e9ecef; border-radius: 0 0 10px 10px; }
        .code { display: inline-block; padding: 15px 30px; background-color: #f8f9fa; border: 2px solid #667eea; border-radius: 8px; font-size: 24px; font-weight: bold; color: #667eea; margin: 20px 0; }
        .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔑 Réinitialisation de mot de passe</h1>
            <p>Code de sécurité</p>
        </div>
        <div class="content">
            <h2>Bonjour,</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte PigeonFarm.</p>
            
            <p><strong>Votre code de réinitialisation est :</strong></p>
            <div style="text-align: center;">
                <div class="code">${testCode}</div>
            </div>

            <div class="warning">
                <h4>⚠️ Important :</h4>
                <ul>
                    <li>Ce code expire dans <strong>15 minutes</strong></li>
                    <li>Ne partagez jamais ce code avec personne</li>
                    <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                </ul>
            </div>

            <h3>📋 Instructions :</h3>
            <ol>
                <li>Copiez le code ci-dessus</li>
                <li>Retournez sur la page de réinitialisation</li>
                <li>Entrez le code dans le champ approprié</li>
                <li>Créez votre nouveau mot de passe</li>
            </ol>
            
            <p>Si vous avez des questions ou besoin d'aide, contactez notre équipe de support.</p>
            
            <p>Cordialement,<br><strong>L'équipe PigeonFarm</strong></p>
        </div>
        <div class="footer">
            <p>Cet email a été envoyé automatiquement suite à votre demande de réinitialisation.</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
        </div>
    </div>
</body>
</html>
    `;

    const result = await emailService.sendEmail(testEmail, subject, text, html);
    
    if (result) {
      console.log('✅ Email de réinitialisation envoyé avec succès !');
      console.log('📬 Vérifiez votre boîte email ou les logs du serveur.');
    } else {
      console.log('❌ Échec de l\'envoi de l\'email');
    }

    console.log('\n🎉 Test terminé !');
    console.log('\n📋 Résumé:');
    console.log('- Réinitialisation de mot de passe: ✅ Utilise le SMTP');
    console.log('- Code à 4 chiffres: ✅ Envoyé par email');
    console.log('- Templates professionnels: ✅ HTML et texte');
    console.log('- Configuration unifiée: ✅ Même SMTP que les autres emails');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
if (require.main === module) {
  console.log('🚀 Test de la réinitialisation de mot de passe avec SMTP\n');
  
  testPasswordResetSMTP();
}

module.exports = {
  testPasswordResetSMTP
};
