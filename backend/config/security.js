// Configuration de sécurité centralisée
export const securityConfig = {
  // Configuration Helmet
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        workerSrc: ["'self'"],
        manifestSrc: ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    frameguard: {
      action: 'deny'
    },
    xssFilter: true,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    }
  },

  // Configuration CSRF
  csrf: {
    secret: process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
    tokenExpiry: 30 * 60 * 1000, // 30 minutes
    maxTokensPerUser: 5,
    cleanupInterval: 60 * 60 * 1000 // 1 heure
  },

  // Configuration Rate Limiting
  rateLimit: {
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requêtes par fenêtre
      message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 tentatives de connexion
      message: 'Trop de tentatives de connexion, veuillez réessayer plus tard.'
    },
    dos: {
      windowMs: 60 * 1000, // 1 minute
      max: 100, // 100 requêtes par minute
      blockDuration: 15 * 60 * 1000 // 15 minutes
    }
  },

  // Configuration DoS Protection
  dosProtection: {
    maxRequestSize: 10 * 1024 * 1024, // 10 MB
    slowRequestThreshold: 5000, // 5 secondes
    timingAttackThreshold: 30000, // 30 secondes
    maxAttackAttempts: 10, // 10 tentatives avant blocage
    attackWindow: 5 * 60 * 1000, // 5 minutes
    cleanupInterval: 60 * 60 * 1000 // 1 heure
  },

  // Configuration Validation
  validation: {
    maxStringLength: 1000,
    maxObjectDepth: 10,
    allowedFileTypes: [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'application/pdf',
      'text/csv'
    ],
    maxFileNameLength: 255
  },

  // Configuration CORS
  cors: {
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173', 
      'http://localhost:3000',
      'http://localhost:3002'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'X-Requested-With'
    ]
  },

  // Configuration JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
    expiresIn: '24h',
    refreshExpiresIn: '7d',
    algorithm: 'HS256'
  },

  // Configuration Session
  session: {
    secret: process.env.SESSION_SECRET || 'default-session-secret-change-in-production',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 heures
    },
    resave: false,
    saveUninitialized: false
  },

  // Configuration Password
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    saltRounds: 12
  },

  // Configuration Logging
  logging: {
    security: {
      enabled: true,
      level: 'info',
      format: 'json'
    },
    attacks: {
      enabled: true,
      alertThreshold: 5,
      alertEmail: process.env.SECURITY_ALERT_EMAIL
    }
  },

  // Configuration Headers
  headers: {
    security: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'X-Permitted-Cross-Domain-Policies': 'none',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    }
  },

  // Configuration Database
  database: {
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    charset: 'utf8mb4'
  },

  // Configuration Environment
  environment: {
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test'
  }
};

// Fonction pour valider la configuration
export const validateSecurityConfig = () => {
  const errors = [];

  // Vérifier les secrets en production
  if (securityConfig.environment.isProduction) {
    if (securityConfig.csrf.secret === 'default-csrf-secret-change-in-production') {
      errors.push('CSRF_SECRET doit être défini en production');
    }
    if (securityConfig.jwt.secret === 'default-jwt-secret-change-in-production') {
      errors.push('JWT_SECRET doit être défini en production');
    }
    if (securityConfig.session.secret === 'default-session-secret-change-in-production') {
      errors.push('SESSION_SECRET doit être défini en production');
    }
  }

  // Vérifier les URLs CORS
  if (securityConfig.cors.origin.length === 0) {
    errors.push('Au moins une origine CORS doit être configurée');
  }

  // Vérifier les limites de rate limiting
  if (securityConfig.rateLimit.general.max <= 0) {
    errors.push('Le rate limit général doit être supérieur à 0');
  }

  if (errors.length > 0) {
    console.error('Erreurs de configuration de sécurité:');
    errors.forEach(error => console.error(`- ${error}`));
    throw new Error('Configuration de sécurité invalide');
  }

  console.log('Configuration de sécurité validée avec succès');
  return true;
};

// Fonction pour obtenir la configuration selon l'environnement
export const getSecurityConfig = (environment = process.env.NODE_ENV) => {
  const config = { ...securityConfig };

  if (environment === 'production') {
    // Renforcer la sécurité en production
    config.helmet.contentSecurityPolicy.directives.styleSrc = ["'self'"];
    config.helmet.contentSecurityPolicy.directives.scriptSrc = ["'self'"];
    config.session.cookie.secure = false; // HTTP pour le développement
    config.cors.origin = process.env.ALLOWED_ORIGINS?.split(',') || [];
  }

  return config;
};

export default securityConfig; 