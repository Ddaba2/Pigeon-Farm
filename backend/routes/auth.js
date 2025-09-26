const express = require('express');
const { 
  hashPassword, 
  comparePassword,
  createSession,
  destroySession
} = require('../middleware/auth.js');
const { testDatabaseConnection } = require('../config/database.js');
const { validateUser } = require('../utils/validation.js');
const { asyncHandler } = require('../utils/errorHandler.js');
const UserService = require('../services/userService.js');
const EmailService = require('../services/emailService.js');
const NotificationService = require('../services/notificationService.js');


const router = express.Router();
const emailService = new EmailService();

// Service d'authentification - Base de données MySQL uniquement

// Route d'inscription
router.post('/register', asyncHandler(async (req, res) => {
  const { 
    username, 
    email, 
    password, 
    fullName,
    acceptTerms
  } = req.body;
  
  // Validation des données
  const validation = validateUser({ username, email, password, fullName, acceptTerms });
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Données invalides',
        details: validation.errors
      }
    });
  }
  

  
  // Vérifier si l'utilisateur existe déjà
  const userExists = await UserService.userExists(username, email);
  
  if (userExists) {
    return res.status(409).json({
      success: false,
      error: {
        message: 'Un utilisateur avec ce nom ou cet email existe déjà',
        code: 'USER_EXISTS'
      }
    });
  }
  
  // Créer le nouvel utilisateur dans la base de données
  const newUser = await UserService.createUser({
    username,
    email,
    password,
    fullName: fullName || '',
    role: 'user'
  });

  // Envoyer email de bienvenue
  try {
    await emailService.sendWelcomeEmail(newUser);
    
    // Créer une notification de bienvenue dans la base de données
    await NotificationService.createNotification(
      newUser.id,
      '🐦 Bienvenue sur PigeonFarm !',
      'Votre compte a été créé avec succès. Explorez toutes les fonctionnalités disponibles !',
      'info'
    );
    
    console.log(`📧 Email de bienvenue envoyé à ${newUser.email}`);
  } catch (emailError) {
    console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', emailError);
    // Ne pas faire échouer l'inscription si l'email échoue
  }
  
  res.status(201).json({
    success: true,
    message: 'Inscription réussie',
    user: newUser
  });
}));

// Route de connexion
router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  
  console.log('🔐 Login attempt:', { username, password: '***' });
  
  // Validation des données
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Nom d\'utilisateur et mot de passe requis',
        code: 'MISSING_CREDENTIALS'
      }
    });
  }
  
  try {
    // Rechercher l'utilisateur dans la base de données
    const user = await UserService.getUserByUsername(username) || await UserService.getUserByEmail(username);
    
    if (!user) {
      console.log('❌ User not found:', username);
      return res.status(401).json({
        success: false,
        error: {
          message: 'Nom d\'utilisateur ou mot de passe incorrect',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }
    
    console.log('✅ User found:', user.username);
    
    // Vérifier le mot de passe
    const isPasswordValid = await comparePassword(password, user.password);
  
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Nom d\'utilisateur ou mot de passe incorrect',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }
    
    // Vérifier le statut de l'utilisateur
    if (user.status === 'blocked') {
      console.log('🚫 Blocked user attempted login:', user.username);
      return res.status(403).json({
        success: false,
        error: {
          message: 'Votre compte a été bloqué. Contactez un administrateur.',
          code: 'ACCOUNT_BLOCKED'
        }
      });
    }
    
    if (user.status === 'pending') {
      console.log('⏳ Pending user attempted login:', user.username);
      return res.status(403).json({
        success: false,
        error: {
          message: 'Votre compte est en attente d\'approbation.',
          code: 'ACCOUNT_PENDING'
        }
      });
    }
    
    // Créer une session
    const sessionId = createSession(user);
    
    console.log('🍪 Setting cookie sessionId:', sessionId);
    console.log('🌐 Request origin:', req.headers.origin);
    console.log('🔗 Request host:', req.headers.host);
    
    // Définir le cookie de session (essai avec configuration minimale)
    res.cookie('sessionId', sessionId, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });
    
    // Ajouter aussi le sessionId dans les headers de réponse
    res.set('X-Session-ID', sessionId);
    
    console.log('✅ Cookie set, response headers:', res.getHeaders());
    
    res.json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      sessionId
    });
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// Route de déconnexion
router.post('/logout', (req, res) => {
  const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];
  
  if (sessionId) {
    destroySession(sessionId);
  }
  
  // Supprimer le cookie de session
  res.clearCookie('sessionId');
  
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});



// Route de vérification de l'utilisateur
router.post('/verify', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Nom d\'utilisateur et mot de passe requis',
        code: 'MISSING_CREDENTIALS'
      }
    });
  }
  
  // Rechercher l'utilisateur dans la base de données
  const user = await UserService.getUserByUsername(username) || await UserService.getUserByEmail(username);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      }
    });
  }
  
  // Vérifier le mot de passe
  const isPasswordValid = await comparePassword(password, user.password);
  
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Mot de passe incorrect',
        code: 'INVALID_PASSWORD'
      }
    });
  }
  
  // Vérifier le statut de l'utilisateur
  if (user.status === 'blocked') {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Votre compte a été bloqué. Contactez un administrateur.',
        code: 'ACCOUNT_BLOCKED'
      }
    });
  }
  
  if (user.status === 'pending') {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Votre compte est en attente d\'approbation.',
        code: 'ACCOUNT_PENDING'
      }
    });
  }
  
  // Retourner la réponse (sans le mot de passe)
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    success: true,
    message: 'Utilisateur vérifié',
    user: userWithoutPassword
  });
}));

// Route de récupération de mot de passe (simulée)
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Email requis',
        code: 'EMAIL_REQUIRED'
      }
    });
  }
  
  // Vérifier si l'utilisateur existe
  const user = await UserService.getUserByEmail(email);
  
  if (!user) {
    // Pour des raisons de sécurité, on ne révèle pas si l'email existe
    return res.json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
    });
  }
  
  // En production, on enverrait un email avec un lien de réinitialisation
  // Pour l'instant, on simule l'envoi
  
  res.json({
    success: true,
    message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
  });
}));



// Route de réinitialisation de mot de passe
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { email, resetCode, newPassword } = req.body;
  
  if (!email || !resetCode || !newPassword) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Email, code de réinitialisation et nouveau mot de passe requis',
        code: 'MISSING_RESET_DATA'
      }
    });
  }
  
  // Validation du nouveau mot de passe
  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères',
        code: 'PASSWORD_TOO_SHORT'
      }
    });
  }
  
  // En production, on vérifierait le code de réinitialisation
  // Pour l'instant, on simule la vérification
  
  // Rechercher l'utilisateur
  const user = await UserService.getUserByEmail(email);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      }
    });
  }
  
  // Hacher le nouveau mot de passe et le mettre à jour dans la base de données
  const hashedPassword = await hashPassword(newPassword);
  await UserService.updatePassword(user.id, hashedPassword);
  
  res.json({
    success: true,
    message: 'Mot de passe réinitialisé avec succès'
  });
}));

// Route pour vérifier le statut d'authentification
router.get('/me', asyncHandler(async (req, res) => {
  console.log('🔍 Route /me appelée');
  console.log('🍪 Cookies reçus:', req.cookies);
  console.log('📋 Headers x-session-id:', req.headers['x-session-id']);
  
  const sessionId = req.cookies.sessionId || req.headers['x-session-id'];
  
  if (!sessionId) {
    console.log('❌ Aucun sessionId trouvé');
    return res.status(401).json({
      success: false,
      error: {
        message: 'Session non trouvée',
        code: 'NO_SESSION'
      }
    });
  }
  
  console.log('✅ SessionId trouvé:', sessionId);

  // Vérifier la session
  console.log('🔍 Vérification de la session:', sessionId);
  const session = await UserService.getSession(sessionId);
  console.log('📋 Session trouvée:', session ? 'Oui' : 'Non');
  
  if (!session) {
    console.log('❌ Session invalide ou expirée');
    return res.status(401).json({
      success: false,
      error: {
        message: 'Session invalide',
        code: 'INVALID_SESSION'
      }
    });
  }

  // Récupérer les données utilisateur
  const userId = session.user_id; // Le champ en base est 'user_id', pas 'userId'
  console.log('👤 Récupération utilisateur ID:', userId);
  console.log('📋 Type de userId:', typeof userId);
  console.log('📋 Session complète:', session);
  
  if (!userId) {
    console.log('❌ user_id est undefined ou null');
    return res.status(401).json({
      success: false,
      error: {
        message: 'Session invalide - userId manquant',
        code: 'INVALID_SESSION_USER_ID'
      }
    });
  }
  
  const user = await UserService.getUserById(userId);
  console.log('📋 Utilisateur trouvé:', user ? 'Oui' : 'Non');
  
  if (!user) {
    console.log('❌ Utilisateur non trouvé pour ID:', userId);
    return res.status(401).json({
      success: false,
      error: {
        message: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      }
    });
  }

  // Retourner les données utilisateur (sans le mot de passe)
  const { password, ...userWithoutPassword } = user;
  console.log('✅ Utilisateur retourné:', userWithoutPassword.email);
  
  res.json({
    success: true,
    user: userWithoutPassword
  });
}));

module.exports = router; 