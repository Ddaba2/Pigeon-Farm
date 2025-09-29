const express = require('express');
const passport = require('passport');
const { createSession, destroySession } = require('../middleware/auth');
const { asyncHandler } = require('../utils/errorHandler');

const router = express.Router();

// Route d'initiation Google OAuth
router.get('/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

// Callback Google OAuth
router.get('/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: `${process.env.FRONTEND_ERROR_URI}?error=oauth_failed` 
    }),
    asyncHandler(async (req, res) => {
        try {
            const user = req.user;
            
            if (!user) {
                console.log('❌ Aucun utilisateur dans la session OAuth');
                return res.redirect(`${process.env.FRONTEND_ERROR_URI}?error=no_user`);
            }

            console.log('✅ OAuth Google réussi pour:', user.username);

            // Créer une session pour l'utilisateur
            const sessionId = createSession(user);
            
            // Définir le cookie de session
            res.cookie('sessionId', sessionId, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000, // 24 heures
                path: '/'
            });

            // Rediriger vers le frontend avec les données utilisateur
            const userData = {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                avatar_url: user.avatar_url,
                google_id: user.google_id
            };

            // Encoder les données utilisateur pour l'URL
            const encodedUserData = encodeURIComponent(JSON.stringify(userData));
            const redirectUrl = `${process.env.FRONTEND_SUCCESS_URI}?user=${encodedUserData}&sessionId=${sessionId}`;
            
            console.log('🔄 Redirection vers:', redirectUrl);
            res.redirect(redirectUrl);

        } catch (error) {
            console.error('❌ Erreur dans le callback OAuth:', error);
            res.redirect(`${process.env.FRONTEND_ERROR_URI}?error=callback_error`);
        }
    })
);

// Route de déconnexion OAuth
router.post('/logout', (req, res) => {
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];
    
    if (sessionId) {
        destroySession(sessionId);
    }
    
    // Supprimer le cookie de session
    res.clearCookie('sessionId');
    
    // Déconnexion Passport
    req.logout((err) => {
        if (err) {
            console.error('❌ Erreur lors de la déconnexion Passport:', err);
        }
    });
    
    res.json({
        success: true,
        message: 'Déconnexion réussie'
    });
});

// Route de vérification du statut OAuth
router.get('/status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            success: true,
            authenticated: true,
            user: {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email,
                fullName: req.user.fullName,
                role: req.user.role,
                avatar_url: req.user.avatar_url,
                google_id: req.user.google_id
            }
        });
    } else {
        res.json({
            success: false,
            authenticated: false,
            message: 'Non authentifié'
        });
    }
});

// Route de test OAuth (pour le développement)
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Routes OAuth configurées',
        endpoints: {
            google: '/api/oauth/google',
            callback: '/api/oauth/google/callback',
            logout: '/api/oauth/logout',
            status: '/api/oauth/status'
        },
        config: {
            clientId: process.env.GOOGLE_CLIENT_ID ? 'Configuré' : 'Manquant',
            redirectUri: process.env.GOOGLE_REDIRECT_URI,
            frontendSuccessUri: process.env.FRONTEND_SUCCESS_URI,
            frontendErrorUri: process.env.FRONTEND_ERROR_URI
        }
    });
});

module.exports = router;
