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

const router = express.Router();

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
        message: 'Nom d\'utilisateur ou mot de passe incorrect',
        code: 'INVALID_CREDENTIALS'
      }
    });
  }
  
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
  
  // Créer une session
  const sessionId = createSession(user);
  
  // Définir le cookie de session
  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  });
  
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

module.exports = router; 