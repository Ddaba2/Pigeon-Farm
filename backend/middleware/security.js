import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';

// Configuration Helmet avec CSP plus permissive pour le développement
export const helmetConfig = helmet({
  contentSecurityPolicy: false, // Désactiver CSP en développement
  hsts: false, // Désactiver HSTS en développement
  referrerPolicy: { policy: 'no-referrer-when-downgrade' }
});

// Rate limiter général - très permissif pour le développement
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Très permissif pour le développement
  message: 'Trop de requêtes depuis cette IP',
  skipSuccessfulRequests: true, // Ne pas compter les requêtes réussies
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pour l'authentification - plus permissif
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Augmenter la limite à 20 tentatives de connexion
  message: 'Trop de tentatives de connexion',
  standardHeaders: true,
  legacyHeaders: false,
});

// Protection XSS
export const xssProtection = xss();

// Logger de sécurité
export const securityLogger = (req, res, next) => {
  console.log(`[SECURITY] ${req.method} ${req.url} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent')}`);
  next();
};

// Headers de sécurité de base
export const basicSecurity = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};

// Fonction de nettoyage XSS - plus permissive
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Supprimer seulement les balises script
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Supprimer seulement les iframes
    .replace(/data:text\/html/gi, '') // Supprimer les protocoles data HTML
    .replace(/javascript:/gi, '') // Supprimer les protocoles javascript
    .replace(/vbscript:/gi, ''); // Supprimer les protocoles vbscript
};

// Middleware de nettoyage des données - plus permissif
export const sanitizeData = (req, res, next) => {
  // Nettoyer les données d'entrée seulement si nécessaire
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string' && req.body[key].length > 0) {
        // Ne pas nettoyer les champs sensibles comme les mots de passe
        if (!['password', 'token', 'csrfToken'].includes(key)) {
          req.body[key] = sanitizeString(req.body[key]);
        }
      }
    }
  }
  
  // Nettoyer les paramètres de requête seulement si nécessaire
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string' && req.query[key].length > 0) {
        req.query[key] = sanitizeString(req.query[key]);
      }
    }
  }
  
  // Nettoyer les paramètres d'URL seulement si nécessaire
  if (req.params && typeof req.params === 'object') {
    for (const key in req.params) {
      if (typeof req.params[key] === 'string' && req.params[key].length > 0) {
        req.params[key] = sanitizeString(req.params[key]);
      }
    }
  }
  
  next();
};

// Validation des headers - plus permissive
export const validateHeaders = (req, res, next) => {
  // Ne pas exiger Content-Type pour les requêtes GET, OPTIONS, HEAD
  if (['GET', 'OPTIONS', 'HEAD'].includes(req.method)) {
    return next();
  }
  
  // Ne pas exiger Content-Type pour les requêtes avec body vide
  if (!req.body || Object.keys(req.body).length === 0) {
    return next();
  }
  
  // Ne pas exiger Content-Type pour les requêtes multipart (uploads)
  const contentType = req.headers['content-type'];
  if (contentType && contentType.includes('multipart/form-data')) {
    return next();
  }
  
  // Vérifier Content-Type seulement pour les requêtes JSON
  if (!contentType && req.body && Object.keys(req.body).length > 0) {
    console.warn('Content-Type manquant pour requête avec body');
    // Ne pas bloquer, juste avertir
  }
  
  // Vérifier les headers de sécurité seulement pour les requêtes suspectes
  const userAgent = req.get('User-Agent');
  if (userAgent && userAgent.includes('curl')) {
    console.warn('Requête curl détectée:', req.method, req.url);
    // Ne pas bloquer, juste avertir
  }
  
  next();
};

// Validation JSON - plus permissive
export const validateJSON = (req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    try {
      JSON.stringify(req.body);
    } catch (error) {
      console.warn('JSON invalide détecté:', error.message);
      // Ne pas bloquer, juste avertir
    }
  }
  next();
};

// Protection contre l'injection SQL - plus permissive
export const sqlInjectionProtection = (req, res, next) => {
  const patterns = [
    /(\b(UNION|SCRIPT)\b)/i,
    /(\b(DROP|DELETE|INSERT|UPDATE)\b.*\b(TABLE|DATABASE)\b)/i,
    /(\b(EXEC|EXECUTE)\b)/i,
    /(\b(WAITFOR|DELAY)\b)/i
  ];
  
  const checkString = JSON.stringify(req.body) + JSON.stringify(req.query) + JSON.stringify(req.params);
  
  for (const pattern of patterns) {
    if (pattern.test(checkString)) {
      console.log(`[SECURITY WARNING] Pattern SQL suspect détecté: ${req.ip}`);
      // Ne pas bloquer, juste avertir
    }
  }
  
  next();
};

// Détection d'attaques par pattern - plus permissive
export const detectAttackPatterns = (req, res, next) => {
  const suspiciousPatterns = [
    /\.\.\//g, // Directory traversal
    /<script/i, // XSS
    /javascript:/i, // XSS
    /union.*select/i, // SQL injection
    /exec.*\(/i // Command injection
  ];
  
  const requestString = req.url + JSON.stringify(req.body) + JSON.stringify(req.query);
  let attackScore = 0;
  
  suspiciousPatterns.forEach(pattern => {
    const matches = requestString.match(pattern);
    if (matches) {
      attackScore += matches.length;
    }
  });
  
  if (attackScore > 5) { // Augmenter le seuil
    console.warn(`[SECURITY WARNING] Pattern d'attaque détecté (score: ${attackScore}) - IP: ${req.ip}`);
    // Ne pas bloquer, juste avertir
  }
  
  next();
};

// Limitation de la taille des requêtes - plus permissive
export const limitRequestSize = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    console.warn(`[SECURITY WARNING] Requête trop volumineuse: ${contentLength} bytes`);
    // Ne pas bloquer, juste avertir
  }
  
  next();
};

// Détection des requêtes lentes - plus permissive
export const detectSlowRequests = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 5000) { // Augmenter le seuil à 5 secondes
      console.warn(`[SECURITY WARNING] Requête lente détectée: ${duration}ms - ${req.method} ${req.url}`);
    }
  });
  
  next();
};