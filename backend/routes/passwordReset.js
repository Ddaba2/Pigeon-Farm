const express = require('express');
const bcrypt = require('bcryptjs');
const { sendPasswordResetEmail, sendPasswordResetConfirmation } = require('../services/emailService.js');
const { executeQuery } = require('../config/database.js');

const router = express.Router();

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

        // 1. Vérifier que le code est valide et non utilisé
        const codes = await executeQuery(
            'SELECT * FROM password_reset_codes WHERE email = ? AND code = ? AND expires_at > NOW() AND used = TRUE',
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