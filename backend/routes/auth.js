const express = require('express');
const { 
  hashPassword, 
  comparePassword,
  createSession,
  destroySession,
  verifySession
} = require('../middleware/auth.js');
const { testDatabaseConnection } = require('../config/database.js');
const { validateUser } = require('../utils/validation.js');
const { asyncHandler } = require('../utils/errorHandler.js');
const { getErrorMessage, createErrorResponse } = require('../utils/errorMessages.js');
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
        message: getErrorMessage('VALIDATION', 'INVALID_DATA'),
        code: 'VALIDATION_INVALID_DATA',
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
        message: getErrorMessage('REGISTER', 'USER_EXISTS'),
        code: 'REGISTER_USER_EXISTS'
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
  
  // Validation des données
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: {
        message: getErrorMessage('AUTH', 'MISSING_CREDENTIALS'),
        code: 'AUTH_MISSING_CREDENTIALS'
      }
    });
  }
  
  try {
    // Rechercher l'utilisateur dans la base de données
    const user = await UserService.getUserByUsername(username) || await UserService.getUserByEmail(username);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: getErrorMessage('AUTH', 'INVALID_CREDENTIALS'),
          code: 'AUTH_INVALID_CREDENTIALS'
        }
      });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await comparePassword(password, user.password);
  
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: getErrorMessage('AUTH', 'INVALID_CREDENTIALS'),
          code: 'AUTH_INVALID_CREDENTIALS'
        }
      });
    }
    
    // Vérifier le statut de l'utilisateur
    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        error: {
          message: getErrorMessage('AUTH', 'ACCOUNT_BLOCKED'),
          code: 'AUTH_ACCOUNT_BLOCKED'
        }
      });
    }
    
    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        error: {
          message: getErrorMessage('AUTH', 'ACCOUNT_PENDING'),
          code: 'AUTH_ACCOUNT_PENDING'
        }
      });
    }
    
    // Créer une session
    const sessionId = await createSession(user);
    
    // Définir le cookie de session
    res.cookie('sessionId', sessionId, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });
    
    // Ajouter aussi le sessionId dans les headers de réponse
    res.set('X-Session-ID', sessionId);
    
    res.json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        last_login: user.last_login,
        avatar_url: user.avatar_url
      },
      sessionId
    });
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      error: {
        message: getErrorMessage('GENERAL', 'INTERNAL_ERROR'),
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// Route de déconnexion
router.post('/logout', asyncHandler(async (req, res) => {
  const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];
  
  if (sessionId) {
    await destroySession(sessionId);
  }
  
  // Supprimer le cookie de session
  res.clearCookie('sessionId');
  
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
}));



// Route de vérification de l'utilisateur
router.post('/verify', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: {
        message: getErrorMessage('AUTH', 'MISSING_CREDENTIALS'),
        code: 'AUTH_MISSING_CREDENTIALS'
      }
    });
  }
  
  // Rechercher l'utilisateur dans la base de données
  const user = await UserService.getUserByUsername(username) || await UserService.getUserByEmail(username);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        message: getErrorMessage('USER', 'NOT_FOUND'),
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
        message: getErrorMessage('AUTH', 'INVALID_CREDENTIALS'),
        code: 'AUTH_INVALID_CREDENTIALS'
      }
    });
  }
  
  // Vérifier le statut de l'utilisateur
  if (user.status === 'blocked') {
    return res.status(403).json({
      success: false,
      error: {
        message: getErrorMessage('AUTH', 'ACCOUNT_BLOCKED'),
        code: 'AUTH_ACCOUNT_BLOCKED'
      }
    });
  }
  
  if (user.status === 'pending') {
    return res.status(403).json({
      success: false,
      error: {
        message: getErrorMessage('AUTH', 'ACCOUNT_PENDING'),
        code: 'AUTH_ACCOUNT_PENDING'
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
        message: getErrorMessage('VALIDATION', 'MISSING_REQUIRED'),
        code: 'VALIDATION_EMAIL_REQUIRED'
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
        message: getErrorMessage('VALIDATION', 'MISSING_REQUIRED'),
        code: 'VALIDATION_MISSING_REQUIRED'
      }
    });
  }
  
  // Validation du nouveau mot de passe
  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: {
        message: getErrorMessage('PASSWORD', 'TOO_SHORT'),
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
        message: getErrorMessage('USER', 'NOT_FOUND'),
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

// Route de vérification de session
router.get('/verify-session', asyncHandler(async (req, res) => {
  // Check both cookies and headers like authenticateUser middleware
  const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];
  
  if (!sessionId) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Session ID manquant',
        code: 'MISSING_SESSION_ID'
      }
    });
  }
  
  try {
    // Vérifier la session
    const user = await verifySession(sessionId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Session invalide ou expirée',
          code: 'INVALID_SESSION'
        }
      });
    }
    
    // Récupérer les données utilisateur à jour
    const userData = await UserService.getUserById(user.id);
    
    if (!userData) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        }
      });
    }
    
    res.json({
      success: true,
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        status: userData.status,
        created_at: userData.created_at,
        last_login: userData.last_login
      },
      sessionId: sessionId
    });
    
  } catch (error) {
    console.error('Erreur lors de la vérification de session:', error);
    res.status(401).json({
      success: false,
      error: {
        message: 'Erreur lors de la vérification de session',
        code: 'SESSION_VERIFICATION_ERROR'
      }
    });
  }
}));

module.exports = router; 