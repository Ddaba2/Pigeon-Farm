// Gestionnaire d'erreurs centralisé pour PigeonFarm

// Classes d'erreurs personnalisées
class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentification requise') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Permissions insuffisantes') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Ressource') {
    super(`${resource} non trouvé(e)`, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflit de données') {
    super(message, 409, 'CONFLICT');
  }
}

// Gestionnaire d'erreurs global
const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log de l'erreur
  console.error('❌ Erreur:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Erreur de validation Mongoose (si on utilise MongoDB plus tard)
  if (err.name === 'ValidationError') {
    const message = 'Erreur de validation des données';
    const details = Object.values(err.errors).map(val => val.message);
    error = new ValidationError(message, details);
  }
  
  // Erreur de cast Mongoose (ID invalide)
  if (err.name === 'CastError') {
    const message = 'ID de ressource invalide';
    error = new ValidationError(message);
  }
  
  // Erreur de duplication (clé unique)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} existe déjà`;
    error = new ConflictError(message);
  }
  
  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token invalide';
    error = new AuthenticationError(message);
  }
  
  // Erreur JWT expiré
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expiré';
    error = new AuthenticationError(message);
  }
  
  // Réponse d'erreur
  const response = {
    success: false,
    error: {
      message: error.message || 'Erreur interne du serveur',
      code: error.errorCode || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  };
  
  // Ajouter les détails de validation si disponibles
  if (error.details) {
    response.error.details = error.details;
  }
  
  // Ajouter l'URL et la méthode pour le débogage
  if (process.env.NODE_ENV === 'development') {
    response.error.url = req.url;
    response.error.method = req.method;
    response.error.timestamp = new Date().toISOString();
  }
  
  res.status(error.statusCode || 500).json(response);
};

// Gestionnaire d'erreurs asynchrones
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Gestionnaire d'erreurs 404
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
};

// Gestionnaire d'erreurs de validation des données
const validationErrorHandler = (validationResult) => {
  return (req, res, next) => {
    const { isValid, errors } = validationResult(req.body);
    
    if (!isValid) {
      const error = new ValidationError('Données invalides', errors);
      return next(error);
    }
    
    next();
  };
};

// Fonction utilitaire pour créer des erreurs avec contexte
const createError = (type, context = {}) => {
  const errorMessages = {
    VALIDATION_ERROR: 'Données invalides',
    AUTHENTICATION_ERROR: 'Authentification requise',
    AUTHORIZATION_ERROR: 'Permissions insuffisantes',
    NOT_FOUND: 'Ressource non trouvée',
    CONFLICT: 'Conflit de données',
    INTERNAL_ERROR: 'Erreur interne du serveur'
  };
  
  const message = context.message || errorMessages[type] || 'Erreur inconnue';
  const statusCode = context.statusCode || 500;
  
  return new AppError(message, statusCode, type);
};

// Middleware de gestion des erreurs de parsing JSON
const jsonErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    const error = new ValidationError('JSON invalide dans le corps de la requête');
    return next(error);
  }
  next();
};

// Middleware de gestion des erreurs de limite de taille
const limitErrorHandler = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    const error = new ValidationError('Fichier trop volumineux');
    return next(error);
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const error = new ValidationError('Champ de fichier inattendu');
    return next(error);
  }
  next();
};

// Fonction pour formater les erreurs de base de données
const formatDatabaseError = (dbError) => {
  if (dbError.code === 'ER_DUP_ENTRY') {
    return new ConflictError('Cette ressource existe déjà');
  }
  
  if (dbError.code === 'ER_NO_REFERENCED_ROW_2') {
    return new ValidationError('Référence invalide dans la base de données');
  }
  
  if (dbError.code === 'ER_ROW_IS_REFERENCED_2') {
    return new ConflictError('Impossible de supprimer cette ressource car elle est référencée ailleurs');
  }
  
  return new AppError('Erreur de base de données', 500, 'DATABASE_ERROR');
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  globalErrorHandler,
  asyncHandler,
  notFoundHandler,
  validationErrorHandler,
  createError,
  jsonErrorHandler,
  limitErrorHandler,
  formatDatabaseError
}; 