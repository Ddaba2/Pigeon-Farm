const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserService = require('../services/userService');

// Configuration de la stratégie Google OAuth (seulement si les variables sont définies)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5174/oauth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('🔐 Google OAuth - Profil complet reçu:', JSON.stringify(profile, null, 2));
        
        // Vérifier que l'email est disponible dans le profil Google
        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
            console.error('❌ Email non disponible dans le profil Google');
            console.error('Profile reçu:', profile);
            return done(new Error('Email non disponible dans votre compte Google. Veuillez vérifier les permissions accordées.'), null);
        }

        const email = profile.emails[0].value;
        const googleId = profile.id;
        const displayName = profile.displayName || email.split('@')[0];
        const avatarUrl = profile.photos?.[0]?.value;

        console.log('🔐 Google OAuth Profile extrait:', {
            id: googleId,
            email: email,
            name: displayName,
            photo: avatarUrl
        });

        // Vérifier si l'utilisateur existe déjà avec cet email Google
        console.log('🔍 Recherche de l\'utilisateur existant par email:', email);
        const existingUser = await UserService.getUserByEmail(email);
        
        if (existingUser) {
            console.log('✅ Utilisateur existant trouvé:', existingUser.username);
            // Si l'utilisateur existe mais n'a pas de google_id, le lier
            if (!existingUser.google_id) {
                console.log('🔗 Liaison du compte Google à l\'utilisateur existant');
                await UserService.linkGoogleAccount(existingUser.id, googleId, avatarUrl);
                existingUser.google_id = googleId;
                existingUser.avatar_url = avatarUrl || existingUser.avatar_url;
            }
            
            console.log('✅ Utilisateur existant connecté via Google:', existingUser.username);
            return done(null, existingUser);
        }

        // Créer un nouvel utilisateur avec Google
        console.log('➕ Création d\'un nouvel utilisateur Google');
        const newUser = await UserService.createGoogleUser({
            google_id: googleId,
            email: email,
            username: email.split('@')[0], // Utiliser la partie avant @ comme username
            fullName: displayName,
            avatar_url: avatarUrl
        });

        console.log('✅ Nouvel utilisateur créé via Google:', newUser.username);
        return done(null, newUser);

    } catch (error) {
        console.error('❌ Erreur Google OAuth:', error);
        console.error('Stack trace:', error.stack);
        return done(error, null);
    }
  }));
} else {
  console.log('⚠️ Google OAuth non configuré - variables GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET manquantes');
  
  // Ajouter une stratégie Google OAuth de test pour éviter l'erreur "Unknown authentication strategy"
  passport.use('google', {
    authenticate: (req, res, next) => {
      res.status(501).json({
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
  });
}

// Sérialisation de l'utilisateur pour la session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Désérialisation de l'utilisateur depuis la session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserService.getUserById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
