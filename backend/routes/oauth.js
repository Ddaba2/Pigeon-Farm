const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../config.env') });
const {OAuth2Client} = require('google-auth-library');
const { createSession } = require('../middleware/auth.js');
const UserService = require('../services/userService.js');

// Fonction pour récupérer les données utilisateur depuis Google
async function getUserData(accessToken) {
    try {
        const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
        throw error;
    }
}

// Route pour générer l'URL d'autorisation Google
router.post('/request', function(req, res, next) {
    try {
        const redirectUrl = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3002/api/oauth/callback';

        const client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUrl
        );
        
        // Génération d'un state parameter sécurisé avec timestamp
        const state = Buffer.from(Date.now().toString()).toString('base64');
        console.log('🔐 State parameter généré:', state);
        
        const authorizationUrl = client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
            prompt: 'consent',
            state: state // Protection CSRF
        });

        res.json({url: authorizationUrl});
    } catch (error) {
        console.error('Erreur lors de la génération de l\'URL d\'autorisation:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Erreur lors de la génération de l\'URL d\'autorisation',
                code: 'OAUTH_URL_ERROR'
            }
        });
    }
});

// Route de callback OAuth - appelée après autorisation Google
router.get('/callback', async function(req, res, next) {
    try {
        console.log('🔄 Callback OAuth reçu:', req.query);
        const { code, state } = req.query;
        
        // ✅ Validation du state parameter (protection CSRF)
        if (!state) {
            console.warn('⚠️ Requête OAuth sans state parameter');
            const errorUrl = process.env.FRONTEND_ERROR_URI || 'http://localhost:5174/auth/error';
            return res.redirect(`${errorUrl}?message=${encodeURIComponent('Requête invalide - paramètre state manquant')}`);
        }
        
        // Vérifier que le state est valide (optionnel pour le développement)
        try {
            const decodedState = Buffer.from(state, 'base64').toString();
            const stateTime = parseInt(decodedState);
            const currentTime = Date.now();
            
            // Le state doit être récent (moins de 10 minutes)
            if (currentTime - stateTime > 10 * 60 * 1000) {
                console.warn('⚠️ State parameter expiré');
                const errorUrl = process.env.FRONTEND_ERROR_URI || 'http://localhost:5174/auth/error';
                return res.redirect(`${errorUrl}?message=${encodeURIComponent('Session expirée - veuillez réessayer')}`);
            }
        } catch (error) {
            console.warn('⚠️ State parameter invalide:', error.message);
            const errorUrl = process.env.FRONTEND_ERROR_URI || 'http://localhost:5174/auth/error';
            return res.redirect(`${errorUrl}?message=${encodeURIComponent('Paramètre de sécurité invalide')}`);
        }
        
        if (!code) {
            console.error('❌ Code d\'autorisation manquant');
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Code d\'autorisation manquant',
                    code: 'MISSING_AUTH_CODE'
                }
            });
        }

        console.log('✅ Code d\'autorisation reçu:', code.substring(0, 20) + '...');

        const redirectUrl = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3002/api/oauth/callback';
        console.log('🔧 Configuration OAuth:', {
            redirectUrl,
            clientId: process.env.GOOGLE_CLIENT_ID ? 'Configuré' : 'Manquant',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Configuré' : 'Manquant'
        });
        
        const oAuth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUrl
        );

        // Échanger le code contre les tokens
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        
        console.log('✅ Tokens OAuth acquis');

        // Récupérer les données utilisateur
        const userData = await getUserData(tokens.access_token);
        console.log('👤 Utilisateur Google connecté:', userData.email); // ✅ Logs sécurisés
        console.log('📋 Données utilisateur complètes:', {
            email: userData.email,
            name: userData.name,
            id: userData.id
        });

        // Vérifier si l'utilisateur existe déjà
        console.log('🔍 Recherche utilisateur existant pour:', userData.email);
        const existingUser = await UserService.getUserByEmail(userData.email);
        console.log('👤 Utilisateur existant trouvé:', existingUser ? 'Oui' : 'Non');
        
        let user;
        if (existingUser) {
            // Utilisateur existant - mise à jour des données
            user = existingUser;
            console.log('🔄 Utilisateur existant connecté:', user.username);
        } else {
            // Nouvel utilisateur - création du compte
            console.log('✨ Création nouvel utilisateur...');
            try {
                user = await UserService.createUser({
                    username: userData.email.split('@')[0], // Utiliser la partie avant @ comme username
                    email: userData.email,
                    password: '', // Mot de passe vide pour OAuth (sera NULL en base)
                    fullName: userData.name || '',
                    role: 'user'
                });
                console.log('✅ Nouvel utilisateur créé:', user.username);
            } catch (error) {
                console.error('❌ Erreur création utilisateur:', error);
                throw error;
            }
        }

        // Créer une session
        console.log('🔐 Création session pour utilisateur:', user.id);
        const sessionId = await createSession(user);
        console.log('✅ Session créée:', sessionId);
        
        // Définir le cookie de session sécurisé
        res.cookie('sessionId', sessionId, {
            httpOnly: false,  // ✅ Accessible via JavaScript pour compatibilité
            secure: process.env.NODE_ENV === 'production', // ✅ HTTPS en production
            sameSite: 'lax', // ✅ Compatibilité avec les redirections OAuth
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
            domain: 'localhost' // ✅ Spécifier le domaine pour le développement
        });

        // Rediriger vers le frontend avec succès
        const successUrl = process.env.FRONTEND_SUCCESS_URI || 'http://localhost:5174/auth/success';
        const finalRedirectUrl = `${successUrl}?sessionId=${sessionId}&success=true`;
        console.log('🔄 Redirection vers:', finalRedirectUrl);
        res.redirect(finalRedirectUrl);

    } catch (error) {
        console.error('❌ Erreur de connexion avec le compte Google:', error);
        const errorUrl = process.env.FRONTEND_ERROR_URI || 'http://localhost:5174/auth/error';
        res.redirect(`${errorUrl}?message=${encodeURIComponent('Erreur de connexion Google')}`);
    }
});

module.exports = router;
