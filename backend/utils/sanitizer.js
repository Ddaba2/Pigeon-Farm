import xss from 'xss';

// Configuration XSS personnalisée
const xssOptions = {
  whiteList: {
    // Permettre certains tags HTML sécurisés si nécessaire
    p: [],
    br: [],
    strong: [],
    em: [],
    u: [],
    ol: [],
    ul: [],
    li: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: []
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed']
};

// Fonction de sanitisation pour les chaînes de caractères
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return xss(str, xssOptions);
};

// Fonction de sanitisation pour les objets
export const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
};

// Fonction de validation des emails
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Fonction de validation des URLs
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Fonction de validation des noms d'utilisateur
export const validateUsername = (username) => {
  // Alphanumérique + underscore, 3-30 caractères
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

// Fonction de validation des mots de passe
export const validatePassword = (password) => {
  // Au moins 8 caractères, avec majuscule, minuscule, chiffre
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Fonction de nettoyage des caractères spéciaux dangereux
export const cleanSpecialChars = (str) => {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/[<>]/g, '') // Supprimer < et >
    .replace(/javascript:/gi, '') // Supprimer javascript:
    .replace(/on\w+\s*=/gi, '') // Supprimer les event handlers
    .replace(/eval\s*\(/gi, '') // Supprimer eval()
    .replace(/document\./gi, '') // Supprimer document.
    .replace(/window\./gi, '') // Supprimer window.
    .trim();
};

// Fonction de validation des données de formulaire
export const validateFormData = (data, schema) => {
  const errors = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    if (rules.required && (!value || value.trim() === '')) {
      errors[field] = `${field} est requis`;
      continue;
    }
    
    if (value && rules.type === 'email' && !validateEmail(value)) {
      errors[field] = 'Email invalide';
    }
    
    if (value && rules.type === 'username' && !validateUsername(value)) {
      errors[field] = 'Nom d\'utilisateur invalide (3-30 caractères, alphanumérique + _)';
    }
    
    if (value && rules.type === 'password' && !validatePassword(value)) {
      errors[field] = 'Mot de passe trop faible (min 8 caractères, majuscule, minuscule, chiffre)';
    }
    
    if (value && rules.minLength && value.length < rules.minLength) {
      errors[field] = `${field} doit contenir au moins ${rules.minLength} caractères`;
    }
    
    if (value && rules.maxLength && value.length > rules.maxLength) {
      errors[field] = `${field} ne peut pas dépasser ${rules.maxLength} caractères`;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Schémas de validation prédéfinis
export const validationSchemas = {
  user: {
    username: { required: true, type: 'username', minLength: 3, maxLength: 30 },
    email: { required: true, type: 'email' },
    password: { required: true, type: 'password', minLength: 8 },
    full_name: { required: true, minLength: 2, maxLength: 50 }
  },
  
  couple: {
    nestNumber: { required: true, minLength: 1, maxLength: 20 },
    race: { required: true, minLength: 2, maxLength: 50 },
    maleId: { required: false, maxLength: 20 },
    femaleId: { required: false, maxLength: 20 },
    observations: { required: false, maxLength: 500 }
  },
  
  egg: {
    coupleId: { required: true },
    egg1Date: { required: true },
    observations: { required: false, maxLength: 500 }
  },
  
  pigeonneau: {
    coupleId: { required: true },
    eggRecordId: { required: true },
    birthDate: { required: true },
    weight: { required: false },
    observations: { required: false, maxLength: 500 }
  },
  
  healthRecord: {
    type: { required: true, minLength: 2, maxLength: 50 },
    targetType: { required: true, minLength: 2, maxLength: 20 },
    product: { required: true, minLength: 2, maxLength: 100 },
    date: { required: true },
    observations: { required: false, maxLength: 500 }
  }
}; 