const express = require('express');
const passport = require('passport');
const { createSession, destroySession } = require('../middleware/auth');
const { asyncHandler } = require('../utils/errorHandler');

const router = express.Router();

// Route d'initiation Google OAuth
router.get('/google', (req, res, next) => {
    // Vérifier si Google OAuth est configuré
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.status(501).json({
            success: false,
            error: {
                message: 'Google OAuth non configuré - Variables d\'environnement manquantes',
                code: 'OAUTH_NOT_CONFIGURED',
                details: {
                    required: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
                    missing: [
                        !process.env.GOOGLE_CLIENT_ID ? 'GOOGLE_CLIENT_ID' : null,
                        !process.env.GOOGLE_CLIENT_SECRET ? 'GOOGLE_CLIENT_SECRET' : null
                    ].filter(Boolean)
                }
            }
        });
    }
    
    // Utiliser la stratégie Google OAuth si elle est configurée
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })(req, res, next);
});

// Callback Google OAuth
router.get('/google/callback', 
    (req, res, next) => {
        passport.authenticate('google', (err, user, info) => {
            console.log('🔍 Callback OAuth - État:', { err: err?.message, user: user?.username, info });
            
            if (err) {
                console.error('❌ Erreur Passport dans le callback:', err);
                console.error('Stack trace:', err.stack);
                return res.redirect(`${process.env.FRONTEND_ERROR_URI}?error=oauth_auth_failed&message=${encodeURIComponent(err.message)}`);
            }
            
            if (!user) {
                console.error('❌ Pas d\'utilisateur retourné par Passport');
                return res.redirect(`${process.env.FRONTEND_ERROR_URI}?error=no_user_from_passport`);
            }
            
            // Attacher l'utilisateur à la requête pour le handler suivant
            req.user = user;
            next();
        })(req, res, next);
    },
    asyncHandler(async (req, res) => {
        try {
            const user = req.user;
            
            if (!user) {
                console.log('❌ Aucun utilisateur dans la session OAuth');
                return res.redirect(`${process.env.FRONTEND_ERROR_URI}?error=no_user`);
            }

            // Vérifier que les champs essentiels sont présents
            if (!user.id || !user.username || !user.email) {
                console.error('❌ Données utilisateur incomplètes:', user);
                return res.redirect(`${process.env.FRONTEND_ERROR_URI}?error=incomplete_user_data`);
            }

            console.log('✅ OAuth Google réussi pour:', user.username);
            console.log('📋 Données utilisateur reçues:', {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                full_name: user.full_name,
                role: user.role,
                avatar_url: user.avatar_url
            });

            // Créer une session pour l'utilisateur
            const sessionId = await createSession(user);
            
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
                fullName: user.fullName || user.full_name || user.displayName || '',
                role: user.role,
                avatar_url: user.avatar_url || user.avatarUrl || null,
                google_id: user.google_id
            };

            // Encoder les données utilisateur pour l'URL
            const encodedUserData = encodeURIComponent(JSON.stringify(userData));
            const redirectUrl = `${process.env.FRONTEND_SUCCESS_URI}?user=${encodedUserData}&sessionId=${sessionId}`;
            
            console.log('🔄 Redirection vers:', redirectUrl);
            res.redirect(redirectUrl);

        } catch (error) {
            console.error('❌ Erreur dans le callback OAuth:', error);
            console.error('Stack trace:', error.stack);
            res.redirect(`${process.env.FRONTEND_ERROR_URI}?error=callback_error&message=${encodeURIComponent(error.message)}`);
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
            googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Configuré' : 'Manquant',
            redirectUri: process.env.GOOGLE_REDIRECT_URI,
            frontendSuccessUri: process.env.FRONTEND_SUCCESS_URI,
            frontendErrorUri: process.env.FRONTEND_ERROR_URI
        }
    });
});

module.exports = router;
