const express = require('express');
const bcrypt = require('bcryptjs');
const EmailService = require('../services/emailService.js');
const { executeQuery } = require('../config/database.js');

const router = express.Router();
const emailService = new EmailService();

// Fonction pour envoyer l'email de réinitialisation
async function sendPasswordResetEmail(email, code) {
    try {
        const subject = '🔑 Code de réinitialisation PigeonFarm';
        const text = `
Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe pour votre compte PigeonFarm.

Votre code de réinitialisation est : ${code}

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
                <div class="code">${code}</div>
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

        await emailService.sendEmail(email, subject, text, html);
        console.log(`📧 Email de réinitialisation envoyé à ${email}`);
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
        return false;
    }
}

// Fonction pour envoyer l'email de confirmation
async function sendPasswordResetConfirmation(email) {
    try {
        const subject = '✅ Mot de passe réinitialisé - PigeonFarm';
        const text = `
Bonjour,

Nous vous confirmons que votre mot de passe PigeonFarm a été réinitialisé avec succès.

✅ Réinitialisation confirmée
Votre nouveau mot de passe est maintenant actif et vous pouvez vous connecter à votre compte.

🔒 Détails de sécurité :
- Email : ${email}
- Date : ${new Date().toLocaleDateString('fr-FR')}
- Heure : ${new Date().toLocaleTimeString('fr-FR')}
- Statut : Mot de passe réinitialisé

🛡️ Conseils de sécurité :
- Utilisez un mot de passe fort et unique
- Ne partagez jamais vos identifiants
- Déconnectez-vous après chaque session
- Signalez toute activité suspecte

Se connecter maintenant : ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login

Si vous n'avez pas effectué cette réinitialisation, contactez immédiatement notre équipe de support.

Cordialement,
L'équipe PigeonFarm

---
Cet email a été envoyé automatiquement suite à la réinitialisation de votre mot de passe.
Si vous n'avez pas effectué cette réinitialisation, contactez immédiatement notre support.
        `;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Mot de passe réinitialisé - PigeonFarm</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background-color: #f8f9fa; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background-color: #e9ecef; border-radius: 0 0 10px 10px; }
        .success { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Mot de passe réinitialisé</h1>
            <p>Confirmation de sécurité</p>
        </div>
        <div class="content">
            <h2>Bonjour,</h2>
            <p>Nous vous confirmons que votre mot de passe PigeonFarm a été réinitialisé avec succès.</p>
            
            <div class="success">
                <h4>✅ Réinitialisation confirmée</h4>
                <p>Votre nouveau mot de passe est maintenant actif et vous pouvez vous connecter à votre compte.</p>
            </div>

            <h3>🔒 Détails de sécurité :</h3>
            <ul>
                <li><strong>Email :</strong> ${email}</li>
                <li><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
                <li><strong>Heure :</strong> ${new Date().toLocaleTimeString('fr-FR')}</li>
                <li><strong>Statut :</strong> Mot de passe réinitialisé</li>
            </ul>

            <h3>🛡️ Conseils de sécurité :</h3>
            <ul>
                <li>Utilisez un mot de passe fort et unique</li>
                <li>Ne partagez jamais vos identifiants</li>
                <li>Déconnectez-vous après chaque session</li>
                <li>Signalez toute activité suspecte</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">Se connecter maintenant</a>
            </div>

            <p>Si vous n'avez pas effectué cette réinitialisation, contactez immédiatement notre équipe de support.</p>
            
            <p>Cordialement,<br><strong>L'équipe PigeonFarm</strong></p>
        </div>
        <div class="footer">
            <p>Cet email a été envoyé automatiquement suite à la réinitialisation de votre mot de passe.</p>
            <p>Si vous n'avez pas effectué cette réinitialisation, contactez immédiatement notre support.</p>
        </div>
    </div>
</body>
</html>
        `;

        await emailService.sendEmail(email, subject, text, html);
        console.log(`📧 Email de confirmation de réinitialisation envoyé à ${email}`);
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
        return false;
    }
}

/**
 * POST /api/forgot-password
 * Demande de réinitialisation de mot de passe
 * Vérifie d'abord si l'email existe dans la base de données
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Validation de l'email
        if (!email || !email.includes('@')) {
            return res.status(400).json({
                success: false,
                message: 'Email invalide'
            });
        }

        console.log('🔍 Vérification de l\'email:', email);

        // 1. Vérifier si l'email existe dans la base de données
        const users = await executeQuery(
            'SELECT id, email, username FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            console.log('❌ Email non trouvé dans la base de données:', email);
            return res.status(404).json({
                success: false,
                message: 'Aucun compte associé à cet email'
            });
        }

        const user = users[0];
        console.log('✅ Email trouvé pour l\'utilisateur:', user.username);

        // 2. Supprimer les anciens codes de réinitialisation pour cet email
        await executeQuery(
            'DELETE FROM password_reset_codes WHERE email = ?',
            [email]
        );

        // 3. Générer un nouveau code à 4 chiffres
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        console.log('🔢 Code généré:', code, 'pour l\'email:', email);

        // 4. Sauvegarder le code dans la base de données
        await executeQuery(
            'INSERT INTO password_reset_codes (email, code, expires_at) VALUES (?, ?, ?)',
            [email, code, expiresAt]
        );

        // 5. Envoyer l'email avec le code
        const emailSent = await sendPasswordResetEmail(email, code);

        if (!emailSent) {
            // Si l'email n'a pas pu être envoyé, supprimer le code
            await executeQuery(
                'DELETE FROM password_reset_codes WHERE email = ? AND code = ?',
                [email, code]
            );
            
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.'
            });
        }

        console.log('✅ Code de réinitialisation envoyé avec succès à:', email);

        res.json({
            success: true,
            message: 'Code de réinitialisation envoyé à votre email',
            email: email // Retourner l'email pour confirmation
        });

    } catch (error) {
        console.error('❌ Erreur lors de la demande de réinitialisation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
});

/**
 * POST /api/verify-reset-code
 * Vérification du code de réinitialisation
 */
router.post('/verify-reset-code', async (req, res) => {
    try {
        const { email, code } = req.body;

        // Validation des paramètres
        if (!email || !code || code.length !== 4) {
            return res.status(400).json({
                success: false,
                message: 'Email et code à 4 chiffres requis'
            });
        }

        console.log('🔍 Vérification du code:', code, 'pour l\'email:', email);

        // Vérifier le code dans la base de données
        const codes = await executeQuery(
            'SELECT * FROM password_reset_codes WHERE email = ? AND code = ? AND expires_at > NOW() AND used = FALSE',
            [email, code]
        );

        if (codes.length === 0) {
            console.log('❌ Code invalide ou expiré pour l\'email:', email);
            return res.status(400).json({
                success: false,
                message: 'Code invalide ou expiré. Veuillez demander un nouveau code.'
            });
        }

        const resetCode = codes[0];
        console.log('✅ Code vérifié avec succès pour l\'email:', email);

        // Marquer le code comme utilisé
        await executeQuery(
            'UPDATE password_reset_codes SET used = TRUE WHERE id = ?',
            [resetCode.id]
        );

        res.json({
            success: true,
            message: 'Code vérifié avec succès',
            email: email
        });

    } catch (error) {
        console.error('❌ Erreur lors de la vérification du code:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
});

/**
 * POST /api/reset-password
 * Réinitialisation du mot de passe
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        // Validation des paramètres
        if (!email || !code || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Le mot de passe doit contenir au moins 6 caractères'
            });
        }

        console.log('🔑 Réinitialisation du mot de passe pour l\'email:', email);

        // 1. Vérifier que le code est valide et a été vérifié (used = TRUE)
        const codes = await executeQuery(
            'SELECT * FROM password_reset_codes WHERE email = ? AND code = ? AND used = TRUE',
            [email, code]
        );

        if (codes.length === 0) {
            console.log('❌ Code invalide ou non vérifié pour l\'email:', email);
            return res.status(400).json({
                success: false,
                message: 'Code invalide ou non vérifié. Veuillez d\'abord vérifier le code.'
            });
        }

        // 2. Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // 3. Mettre à jour le mot de passe de l'utilisateur
        const result = await executeQuery(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, email]
        );

        if (result.affectedRows === 0) {
            console.log('❌ Utilisateur non trouvé pour l\'email:', email);
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // 4. Supprimer tous les codes de réinitialisation pour cet email
        await executeQuery(
            'DELETE FROM password_reset_codes WHERE email = ?',
            [email]
        );

        // 5. Envoyer un email de confirmation
        await sendPasswordResetConfirmation(email);

        console.log('✅ Mot de passe réinitialisé avec succès pour l\'email:', email);

        res.json({
            success: true,
            message: 'Mot de passe réinitialisé avec succès'
        });

    } catch (error) {
        console.error('❌ Erreur lors de la réinitialisation du mot de passe:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
});

/**
 * GET /api/password-reset-status
 * Vérifier le statut d'une demande de réinitialisation
 */
router.get('/password-reset-status/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // Vérifier s'il y a des codes actifs pour cet email
        const codes = await executeQuery(
            'SELECT * FROM password_reset_codes WHERE email = ? AND expires_at > NOW() AND used = FALSE',
            [email]
        );

        res.json({
            success: true,
            hasActiveCode: codes.length > 0,
            expiresAt: codes.length > 0 ? codes[0].expires_at : null
        });

    } catch (error) {
        console.error('❌ Erreur lors de la vérification du statut:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
});

module.exports = router; 