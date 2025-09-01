const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { config } = require('../config/config.js');

// Configuration Helmet pour la sécurité
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Rate limiting général
const rateLimiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
    retryAfter: Math.ceil(config.security.rateLimitWindowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting pour l'authentification
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  message: {
    error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Logger de sécurité
const securityLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent');
  
  console.log(`🔒 [${timestamp}] ${ip} ${method} ${url} - ${userAgent}`);
  next();
};

// Middleware de sécurité de base
const basicSecurity = (req, res, next) => {
  // Headers de sécurité supplémentaires
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Désactiver la mise en cache pour les routes sensibles
  if (req.path.startsWith('/api/auth/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
};

// Middleware de validation des données
const validateData = (schema) => {
  return (req, res, next) => {
    try {
      if (schema) {
        const { error } = schema.validate(req.body);
        if (error) {
          return res.status(400).json({
            error: 'Données invalides',
            details: error.details.map(detail => detail.message)
          });
        }
      }
      next();
    } catch (error) {
      console.error('❌ Erreur de validation:', error);
      res.status(500).json({ error: 'Erreur de validation des données' });
    }
  };
};

module.exports = {
  helmetConfig,
  rateLimiter,
  authRateLimiter,
  securityLogger,
  basicSecurity,
  validateData
}; 