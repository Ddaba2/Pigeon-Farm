import bcrypt from 'bcryptjs';
import { config } from '../config/config.js';

// Stockage temporaire des sessions (en production, utilisez Redis ou une base de données)
const activeSessions = new Map();

// Middleware d'authentification par session
export const authenticateUser = (req, res, next) => {
  try {
    // Vérifier l'authentification par session
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];
    
    if (!sessionId || !activeSessions.has(sessionId)) {
      return res.status(401).json({ 
        error: 'Session invalide ou expirée',
        code: 'INVALID_SESSION'
      });
    }
    
    const session = activeSessions.get(sessionId);
    
    // Vérifier si la session n'a pas expiré (24h)
    if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
      activeSessions.delete(sessionId);
      return res.status(401).json({ 
        error: 'Session expirée',
        code: 'SESSION_EXPIRED'
      });
    }
    
    // Ajouter l'utilisateur à la requête
    req.user = session.user;
    next();
  } catch (error) {
    console.error('❌ Erreur d\'authentification:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'authentification',
      code: 'AUTH_ERROR'
    });
  }
};

// Fonction pour créer une session
export const createSession = (user) => {
  const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const session = {
    user: { id: user.id, username: user.username, role: user.role },
    createdAt: Date.now()
  };
  
  activeSessions.set(sessionId, session);
  return sessionId;
};

// Fonction pour supprimer une session
export const destroySession = (sessionId) => {
  activeSessions.delete(sessionId);
};

// Middleware d'autorisation par rôle
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentification requise',
        code: 'AUTH_REQUIRED'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Permissions insuffisantes',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: req.user.role
      });
    }
    
    next();
  };
};

// Middleware d'autorisation admin
export const requireAdmin = requireRole(['admin']);

// Middleware d'autorisation utilisateur ou admin
export const requireUserOrAdmin = requireRole(['user', 'admin']);

// Fonction de hachage des mots de passe
export const hashPassword = async (password) => {
  try {
    const saltRounds = config.security.bcryptRounds;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('❌ Erreur de hachage du mot de passe:', error);
    throw new Error('Erreur lors du hachage du mot de passe');
  }
};

// Fonction de comparaison des mots de passe
export const comparePassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('❌ Erreur de comparaison des mots de passe:', error);
    throw new Error('Erreur lors de la comparaison des mots de passe');
  }
};

// Middleware de vérification des permissions sur les ressources
export const checkResourceOwnership = (resourceType) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentification requise',
          code: 'AUTH_REQUIRED'
        });
      }
      
      // Les admins peuvent accéder à toutes les ressources
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Vérifier la propriété de la ressource
      const resourceId = req.params.id || req.body.id;
      if (!resourceId) {
        return next(); // Pas d'ID, laisser passer
      }
      
      // Ici, vous pourriez vérifier dans la base de données
      // Pour l'instant, on laisse passer (à implémenter plus tard)
      next();
    } catch (error) {
      console.error('❌ Erreur de vérification des permissions:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la vérification des permissions',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

export default {
  authenticateUser,
  requireRole,
  requireAdmin,
  requireUserOrAdmin,
  hashPassword,
  comparePassword,
  checkResourceOwnership
}; 