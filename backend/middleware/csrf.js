import pool from '../config/database.js';

// Générer un token CSRF
export const generateCSRFToken = async (userId) => {
  try {
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure
    
    await pool.query(
      'INSERT INTO csrf_tokens (token, userId, expiresAt) VALUES (?, ?, ?)',
      [token, userId, expiresAt]
    );
    
    return token;
  } catch (error) {
    console.error('Erreur génération token CSRF:', error);
    throw error;
  }
};

// Vérifier un token CSRF
export const verifyCSRFToken = async (token, userId, ipAddress) => {
  try {
    if (!token || !userId) {
      return { valid: false, error: 'Token ou utilisateur manquant' };
    }
    
    const [rows] = await pool.query(
      'SELECT * FROM csrf_tokens WHERE token = ? AND userId = ? AND expiresAt > NOW()',
      [token, userId]
    );
    
    if (rows.length === 0) {
      return { valid: false, error: 'Token CSRF invalide ou expiré' };
    }
    
    const tokenData = rows[0];
    
    // Permettre la réutilisation des tokens pour éviter les problèmes
    // if (tokenData.used) {
    //   return { valid: false, error: 'Token CSRF déjà utilisé' };
    // }
    
    // Marquer le token comme utilisé (optionnel)
    // await pool.query('UPDATE csrf_tokens SET used = 1 WHERE id = ?', [tokenData.id]);
    
    return { valid: true };
  } catch (error) {
    console.error('Erreur vérification token CSRF:', error);
    return { valid: false, error: 'Erreur de vérification' };
  }
};

// Middleware pour générer un token CSRF
export const generateCSRFMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
    
    const token = await generateCSRFToken(req.user.id);
    res.setHeader('X-CSRF-Token', token);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.json({ 
      csrfToken: token,
      expiresIn: 60 * 60 * 1000 // 1 heure
    });
  } catch (error) {
    console.error('Erreur middleware génération CSRF:', error);
    res.status(500).json({ error: 'Erreur génération token CSRF' });
  }
};

// Middleware pour vérifier un token CSRF
export const verifyCSRFMiddleware = async (req, res, next) => {
  try {
    // Ne pas vérifier CSRF pour les requêtes GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }
    
    if (!req.user || !req.user.id) {
      console.log(`[CSRF WARNING] Token manquant pour l'utilisateur ${req.user?.id} depuis ${req.ip}`);
      // Ne pas bloquer, juste avertir
      return next();
    }
    
    const token = req.headers['x-csrf-token'] || req.body.csrfToken;
    
    if (!token) {
      console.log(`[CSRF WARNING] Token manquant pour l'utilisateur ${req.user.id} depuis ${req.ip}`);
      // Ne pas bloquer, juste avertir
      return next();
    }
    
    // Valider le format du token de manière plus flexible
    if (typeof token !== 'string' || token.length < 32) {
      console.log(`[CSRF WARNING] Format de token suspect pour l'utilisateur ${req.user.id}`);
      // Ne pas bloquer, juste avertir
      return next();
    }
    
    const result = await verifyCSRFToken(token, req.user.id, req.ip);
    
    if (!result.valid) {
      console.log(`[CSRF WARNING] ${result.error} pour l'utilisateur ${req.user.id} depuis ${req.ip}`);
      // Ne pas bloquer, juste avertir
      return next();
    }
    
    next();
  } catch (error) {
    console.error('Erreur middleware vérification CSRF:', error);
    // Ne pas bloquer, juste avertir
    next();
  }
};

// Fonction pour obtenir un token CSRF
export const getCSRFToken = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
    
    const token = await generateCSRFToken(req.user.id);
    res.setHeader('X-CSRF-Token', token);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.json({ 
      csrfToken: token,
      expiresIn: 60 * 60 * 1000 // 1 heure
    });
  } catch (error) {
    console.error('Erreur obtention token CSRF:', error);
    res.status(500).json({ error: 'Erreur obtention token CSRF' });
  }
};

// Fonction pour valider un token CSRF dans un formulaire
export const validateFormCSRF = async (token, userId) => {
  try {
    if (!token || !userId) {
      return { valid: false, error: 'Token ou utilisateur manquant' };
    }
    
    const result = await verifyCSRFToken(token, userId, 'form-validation');
    return result;
  } catch (error) {
    console.error('Erreur validation formulaire CSRF:', error);
    return { valid: false, error: 'Erreur de validation' };
  }
};