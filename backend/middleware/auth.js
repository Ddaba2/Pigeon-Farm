const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database.js');

// Cache en mémoire pour performance
let activeSessions = new Map();

// Charger les sessions depuis MySQL
async function loadSessions() {
  try {
    const now = new Date();
    const sessions = await executeQuery(
      'SELECT id, user_id, data, created_at, expires_at FROM sessions WHERE expires_at > ?',
      [now]
    );
    
    let loaded = 0;
    for (const session of sessions) {
      const sessionData = JSON.parse(session.data);
      activeSessions.set(session.id, sessionData);
      loaded++;
    }
    
    console.log(`📂 Sessions chargées depuis MySQL: ${loaded} sessions actives`);
  } catch (error) {
    console.error('❌ Erreur lors du chargement des sessions:', error);
    console.log('⚠️ Continuation avec les sessions existantes en mémoire');
  }
}

// Sauvegarder une session dans MySQL
async function saveSession(sessionId, session) {
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    
    await executeQuery(
      `INSERT INTO sessions (id, user_id, data, expires_at) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE data = ?, expires_at = ?`,
      [
        sessionId,
        session.user.id,
        JSON.stringify(session),
        expiresAt,
        JSON.stringify(session),
        expiresAt
      ]
    );
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde de la session:', error);
  }
}

// Charger les sessions au démarrage
loadSessions();

// Fonction pour créer une session
const createSession = async (user) => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const session = {
    id: sessionId,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      full_name: user.full_name || user.fullName || user.displayName || '',
      avatar_url: user.avatar_url || user.avatarUrl || null
    },
    createdAt: Date.now()
  };
  
  activeSessions.set(sessionId, session);
  await saveSession(sessionId, session); // Sauvegarder dans MySQL!
  
  console.log('✅ Session créée:', sessionId, 'pour utilisateur:', user.username);
  return sessionId;
};

// Fonction pour détruire une session
const destroySession = async (sessionId) => {
  if (activeSessions.has(sessionId)) {
    activeSessions.delete(sessionId);
    // Supprimer de MySQL
    try {
      await executeQuery('DELETE FROM sessions WHERE id = ?', [sessionId]);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la session:', error);
    }
    console.log('🗑️ Session détruite:', sessionId);
    return true;
  }
  return false;
};

// Fonction pour vérifier une session
const verifySession = async (sessionId) => {
  if (!activeSessions.has(sessionId)) {
    return null;
  }
  
  const session = activeSessions.get(sessionId);
  
  // Vérifier si la session n'a pas expiré (24h)
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    activeSessions.delete(sessionId);
    // Supprimer de MySQL
    try {
      await executeQuery('DELETE FROM sessions WHERE id = ?', [sessionId]);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la session expirée:', error);
    }
    return null;
  }
  
  // Mettre à jour les données utilisateur depuis la BDD pour avoir les infos à jour
  try {
    const UserService = require('../services/userService');
    const updatedUser = await UserService.getUserById(session.user.id);
    
    if (!updatedUser) {
      // Utilisateur supprimé de la BDD
      activeSessions.delete(sessionId);
      saveSessions();
      return null;
    }
    
    // Mettre à jour la session avec les nouvelles données
    session.user = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      full_name: updatedUser.fullName || updatedUser.full_name || '',
      avatar_url: updatedUser.avatar_url || updatedUser.avatarUrl || null
    };
    
    activeSessions.set(sessionId, session);
    await saveSession(sessionId, session); // Sauvegarder dans MySQL
    
    return session.user;
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la session:', error);
    // Retourner les données en cache en cas d'erreur BDD
    return session.user;
  }
};

// Fonctions de hachage et comparaison de mots de passe
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Middleware d'authentification simple par session
const authenticateUser = async (req, res, next) => {
  try {
    // Vérifier l'authentification par session
    // Priorité : cookies, puis en-tête x-session-id
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];
    
    console.log('🔍 Vérification de session - Session ID:', sessionId ? 'présent' : 'absent');
    
    if (!sessionId) {
      return res.status(401).json({ 
        error: 'Authentification requise',
        code: 'AUTH_REQUIRED'
      });
    }
    
    // Vérifier si la session existe dans le stockage en mémoire
    if (!activeSessions.has(sessionId)) {
      console.log('❌ Session non trouvée dans activeSessions');
      return res.status(401).json({ 
        error: 'Session invalide',
        code: 'INVALID_SESSION'
      });
    }
    
    const session = activeSessions.get(sessionId);
    
    // Vérifier si la session n'a pas expiré (24h)
    if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
      activeSessions.delete(sessionId);
      // Supprimer de MySQL
      try {
        await executeQuery('DELETE FROM sessions WHERE id = ?', [sessionId]);
      } catch (error) {
        console.error('❌ Erreur lors de la suppression de la session expirée:', error);
      }
      console.log('❌ Session expirée');
      return res.status(401).json({ 
        error: 'Session expirée',
        code: 'SESSION_EXPIRED'
      });
    }
    
    // Ajouter l'utilisateur à la requête directement depuis la session
    req.user = session.user;
    
    console.log('✅ Utilisateur authentifié:', req.user.username);
    next();
    
  } catch (error) {
    console.error('❌ Erreur d\'authentification:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'authentification',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware pour vérifier le rôle admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentification requise',
      code: 'AUTH_REQUIRED'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Accès administrateur requis',
      code: 'ADMIN_REQUIRED'
    });
  }
  
  next();
};

// Nettoyer les sessions expirées toutes les heures
setInterval(async () => {
  try {
    const now = new Date();
    const result = await executeQuery('DELETE FROM sessions WHERE expires_at < ?', [now]);
    
    if (result.affectedRows > 0) {
      console.log(`🧹 Nettoyage MySQL: ${result.affectedRows} sessions expirées supprimées`);
    }
    
    // Nettoyer aussi le cache mémoire
    const memNow = Date.now();
    let cleaned = 0;
    for (const [sessionId, session] of activeSessions.entries()) {
      if (memNow - session.createdAt > 24 * 60 * 60 * 1000) {
        activeSessions.delete(sessionId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Nettoyage mémoire: ${cleaned} sessions expirées supprimées`);
    }
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des sessions:', error);
  }
}, 60 * 60 * 1000); // Toutes les heures

module.exports = {
  authenticateUser,
  createSession,
  destroySession,
  verifySession,
  requireAdmin,
  hashPassword,
  comparePassword
};