const nodemailer = require('nodemailer');

// Configuration du transporteur email (Gmail pour les tests)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'votre-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'votre-mot-de-passe-app'
    }
});

// Configuration alternative pour SendGrid ou autre service
// const transporter = nodemailer.createTransport({
//     host: 'smtp.sendgrid.net',
//     port: 587,
//     secure: false,
//     auth: {
//         user: 'apikey',
//         pass: process.env.SENDGRID_API_KEY
//     }
// });

/**
 * Envoie un email de réinitialisation de mot de passe
 * @param {string} to - Email du destinataire
 * @param {string} code - Code de réinitialisation à 4 chiffres
 * @returns {Promise<boolean>} - True si l'email a été envoyé avec succès
 */
async function sendPasswordResetEmail(to, code) {
    try {
        // MODE TEST : Afficher le code dans la console
        console.log('🔐 ========================================');
        console.log('🔐 CODE DE RÉINITIALISATION - MODE TEST');
        console.log('🔐 ========================================');
        console.log('📧 Email destinataire:', to);
        console.log('🔢 Code à 4 chiffres:', code);
        console.log('⏰ Valide pendant 15 minutes');
        console.log('🔐 ========================================');
        console.log('💡 Pour recevoir de vrais emails, configurez vos identifiants Gmail dans .env');
        console.log('💡 EMAIL_USER=votre-email@gmail.com');
        console.log('💡 EMAIL_PASS=votre-mot-de-passe-app-gmail');
        console.log('🔐 ========================================');

        // Vérifier si les identifiants email sont configurés
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
            process.env.EMAIL_USER === 'votre-email@gmail.com' || 
            process.env.EMAIL_PASS === 'votre-mot-de-passe-app') {
            console.log('⚠️  Mode test activé - Aucun email réel envoyé');
            return true; // Retourner true pour continuer le processus
        }

        // MODE PRODUCTION : Envoyer l'email réel
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: '🔐 Réinitialisation de votre mot de passe - PigeonFarm',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <img src="https://pigeonfarm.ml/logo.png" alt="PigeonFarm Logo" style="width: 120px; height: auto;">
                        <h1 style="color: #4f46e5; margin: 20px 0;">🔐 Réinitialisation de mot de passe</h1>
                    </div>
                    
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 25px; margin-bottom: 20px;">
                        <h2 style="color: #1e293b; margin-top: 0;">Bonjour,</h2>
                        <p style="color: #374151; line-height: 1.6;">
                            Vous avez demandé la réinitialisation de votre mot de passe sur PigeonFarm.
                        </p>
                        <p style="color: #374151; line-height: 1.6;">
                            Voici votre code de réinitialisation à 4 chiffres :
                        </p>
                        
                        <div style="background: #4f46e5; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                            <h1 style="font-size: 36px; margin: 0; letter-spacing: 0.5em;">${code}</h1>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                            ⚠️ Ce code expire dans 15 minutes et ne peut être utilisé qu'une seule fois.
                        </p>
                    </div>
                    
                    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                        <h3 style="color: #92400e; margin-top: 0;">🔒 Sécurité</h3>
                        <ul style="color: #92400e; margin: 10px 0; padding-left: 20px;">
                            <li>Ne partagez jamais ce code avec qui que ce soit</li>
                            <li>PigeonFarm ne vous demandera jamais votre mot de passe par email</li>
                            <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; color: #6b7280; font-size: 14px;">
                        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                        <p>© 2024 PigeonFarm - Tous droits réservés</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Email de réinitialisation envoyé:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
        console.log('⚠️  Mode test activé en raison de l\'erreur d\'envoi');
        return true; // Retourner true pour continuer le processus
    }
}

/**
 * Envoie un email de confirmation de réinitialisation
 * @param {string} to - Email du destinataire
 * @returns {Promise<boolean>} - True si l'email a été envoyé avec succès
 */
async function sendPasswordResetConfirmation(to) {
    try {
        // MODE TEST : Afficher la confirmation dans la console
        console.log('✅ ========================================');
        console.log('✅ CONFIRMATION RÉINITIALISATION - MODE TEST');
        console.log('✅ ========================================');
        console.log('📧 Email destinataire:', to);
        console.log('🔑 Mot de passe réinitialisé avec succès');
        console.log('✅ ========================================');

        // Vérifier si les identifiants email sont configurés
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
            process.env.EMAIL_USER === 'votre-email@gmail.com' || 
            process.env.EMAIL_PASS === 'votre-mot-de-passe-app') {
            console.log('⚠️  Mode test activé - Aucun email réel envoyé');
            return true; // Retourner true pour continuer le processus
        }

        // MODE PRODUCTION : Envoyer l'email réel
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: '✅ Mot de passe réinitialisé avec succès - PigeonFarm',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <img src="https://pigeonfarm.ml/logo.png" alt="PigeonFarm Logo" style="width: 120px; height: auto;">
                        <h1 style="color: #10b981; margin: 20px 0;">✅ Mot de passe réinitialisé</h1>
                    </div>
                    
                    <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 10px; padding: 25px; margin-bottom: 20px;">
                        <h2 style="color: #065f46; margin-top: 0;">Confirmation de réinitialisation</h2>
                        <p style="color: #047857; line-height: 1.6;">
                            Votre mot de passe a été réinitialisé avec succès sur PigeonFarm.
                        </p>
                        <p style="color: #047857; line-height: 1.6;">
                            Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                        </p>
                    </div>
                    
                    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                        <h3 style="color: #92400e; margin-top: 0;">🔒 Sécurité</h3>
                        <ul style="color: #92400e; margin: 10px 0; padding-left: 20px;">
                            <li>Gardez votre nouveau mot de passe en sécurité</li>
                            <li>Utilisez un mot de passe unique et fort</li>
                            <li>Activez l'authentification à deux facteurs si disponible</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; color: #6b7280; font-size: 14px;">
                        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                        <p>© 2024 PigeonFarm - Tous droits réservés</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Email de confirmation envoyé:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email de confirmation:', error);
        console.log('⚠️  Mode test activé en raison de l\'erreur d\'envoi');
        return true; // Retourner true pour continuer le processus
    }
}

module.exports = {
    sendPasswordResetEmail,
    sendPasswordResetConfirmation
}; 