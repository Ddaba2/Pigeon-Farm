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
        console.log('🔐 Google OAuth Profile:', {
            id: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            photo: profile.photos?.[0]?.value
        });

        // Vérifier si l'utilisateur existe déjà avec cet email Google
        const existingUser = await UserService.getUserByEmail(profile.emails[0].value);
        
        if (existingUser) {
            // Si l'utilisateur existe mais n'a pas de google_id, le lier
            if (!existingUser.google_id) {
                await UserService.linkGoogleAccount(existingUser.id, profile.id, profile.photos?.[0]?.value);
                existingUser.google_id = profile.id;
                existingUser.avatar_url = profile.photos?.[0]?.value || existingUser.avatar_url;
            }
            
            console.log('✅ Utilisateur existant connecté via Google:', existingUser.username);
            return done(null, existingUser);
        }

        // Créer un nouvel utilisateur avec Google
        const newUser = await UserService.createGoogleUser({
            google_id: profile.id,
            email: profile.emails[0].value,
            username: profile.emails[0].value.split('@')[0], // Utiliser la partie avant @ comme username
            fullName: profile.displayName,
            avatar_url: profile.photos?.[0]?.value
        });

        console.log('✅ Nouvel utilisateur créé via Google:', newUser.username);
        return done(null, newUser);

    } catch (error) {
        console.error('❌ Erreur Google OAuth:', error);
        return done(error, null);
    }
  }));
} else {
  console.log('⚠️ Google OAuth non configuré - variables GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET manquantes');
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
