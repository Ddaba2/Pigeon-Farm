// Schémas de validation pour les données PigeonFarm
// Note: Ces schémas utilisent une validation simple pour l'instant
// Plus tard, on pourra utiliser Joi ou Yup pour une validation plus robuste

// Validation des données d'utilisateur
export const validateUser = (userData) => {
  const errors = [];
  
  if (!userData.username || userData.username.trim().length < 3) {
    errors.push('Le nom d\'utilisateur doit contenir au moins 3 caractères');
  }
  
  if (!userData.email || !isValidEmail(userData.email)) {
    errors.push('L\'email doit être valide');
  }
  
  if (!userData.password) {
    errors.push('Le mot de passe est requis');
  } else {
    const passwordValidation = validatePasswordStrength(userData.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }
  
  if (!userData.fullName || userData.fullName.trim().length < 2) {
    errors.push('Le nom complet doit contenir au moins 2 caractères');
  }
  
  if (!userData.acceptTerms) {
    errors.push('Vous devez accepter la politique d\'utilisation et les conditions générales');
  }
  
  if (userData.role && !['user', 'admin'].includes(userData.role)) {
    errors.push('Le rôle doit être "user" ou "admin"');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation des données de couple
export const validateCouple = (coupleData) => {
  const errors = [];
  
  // Accepter nestNumber ou name
  const name = coupleData.nestNumber || coupleData.name;
  if (!name || name.trim().length < 2) {
    errors.push('Le nom du couple doit contenir au moins 2 caractères');
  }
  
  // Accepter race ou breed
  const breed = coupleData.race || coupleData.breed;
  if (!breed || breed.trim().length < 2) {
    errors.push('La race doit contenir au moins 2 caractères');
  }
  
  const male = coupleData.male || coupleData.maleId || coupleData.maleName;
  if (!male || male.trim().length < 2) {
    errors.push('Le nom du mâle doit contenir au moins 2 caractères');
  }
  
  const female = coupleData.female || coupleData.femaleId || coupleData.femaleName;
  if (!female || female.trim().length < 2) {
    errors.push('Le nom de la femelle doit contenir au moins 2 caractères');
  }
  
  if (coupleData.status && !['active', 'inactive', 'actif', 'inactif', 'reproduction'].includes(coupleData.status)) {
    errors.push('Le statut doit être "active", "inactive", "actif", "inactif" ou "reproduction"');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation des données d'œuf
export const validateEgg = (eggData) => {
  const errors = [];
  
  if (!eggData.coupleId || !Number.isInteger(Number(eggData.coupleId))) {
    errors.push('L\'ID du couple doit être un nombre entier valide');
  }
  
  if (!eggData.date || !isValidDate(eggData.date)) {
    errors.push('La date doit être valide');
  }
  
  if (eggData.status && !['incubation', 'éclos', 'abandonné'].includes(eggData.status)) {
    errors.push('Le statut doit être "incubation", "éclos" ou "abandonné"');
  }
  
  if (eggData.expectedHatch && !isValidDate(eggData.expectedHatch)) {
    errors.push('La date d\'éclosion prévue doit être valide');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation des données de pigeonneau
export const validatePigeonneau = (pigeonneauData) => {
  const errors = [];
  
  if (!pigeonneauData.name || pigeonneauData.name.trim().length < 2) {
    errors.push('Le nom du pigeonneau doit contenir au moins 2 caractères');
  }
  
  if (!pigeonneauData.coupleId || !Number.isInteger(Number(pigeonneauData.coupleId))) {
    errors.push('L\'ID du couple doit être un nombre entier valide');
  }
  
  if (pigeonneauData.status && !['sain', 'malade', 'en traitement'].includes(pigeonneauData.status)) {
    errors.push('Le statut doit être "sain", "malade" ou "en traitement"');
  }
  
  if (pigeonneauData.age && !isValidAge(pigeonneauData.age)) {
    errors.push('L\'âge doit être une valeur valide');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation des données de santé
export const validateHealthRecord = (healthData) => {
  const errors = [];
  
  if (!healthData.pigeonId || !Number.isInteger(Number(healthData.pigeonId))) {
    errors.push('L\'ID du pigeon doit être un nombre entier valide');
  }
  
  if (!healthData.date || !isValidDate(healthData.date)) {
    errors.push('La date doit être valide');
  }
  
  if (!healthData.status || !['sain', 'malade', 'en traitement', 'guéri'].includes(healthData.status)) {
    errors.push('Le statut doit être "sain", "malade", "en traitement" ou "guéri"');
  }
  
  if (healthData.notes && healthData.notes.trim().length > 500) {
    errors.push('Les notes ne doivent pas dépasser 500 caractères');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation des données de vente
export const validateSale = (saleData) => {
  const errors = [];
  
  if (!saleData.pigeonId || !Number.isInteger(Number(saleData.pigeonId))) {
    errors.push('L\'ID du pigeon doit être un nombre entier valide');
  }
  
  if (!saleData.date || !isValidDate(saleData.date)) {
    errors.push('La date doit être valide');
  }
  
  if (!saleData.price || !Number.isFinite(Number(saleData.price)) || Number(saleData.price) <= 0) {
    errors.push('Le prix doit être un nombre positif');
  }
  
  if (saleData.buyerName && saleData.buyerName.trim().length < 2) {
    errors.push('Le nom de l\'acheteur doit contenir au moins 2 caractères');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation de la force du mot de passe
export const validatePasswordStrength = (password) => {
  const errors = [];
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    noCommonPatterns: !isCommonPassword(password),
    noUserInfo: true // À implémenter si on a accès aux infos utilisateur
  };

  if (!requirements.minLength) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!requirements.hasUppercase) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!requirements.hasLowercase) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  
  if (!requirements.hasNumbers) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  if (!requirements.hasSpecialChar) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*...)');
  }
  
  if (!requirements.noCommonPatterns) {
    errors.push('Ce mot de passe est trop commun, veuillez en choisir un autre');
  }

  return {
    isValid: errors.length === 0,
    errors,
    requirements,
    strength: calculatePasswordStrength(password, requirements)
  };
};

// Calculer la force du mot de passe (0-100)
function calculatePasswordStrength(password, requirements) {
  let score = 0;
  const weights = {
    length: 25,
    complexity: 25,
    variety: 25,
    uniqueness: 25
  };

  // Score basé sur la longueur
  if (password.length >= 8) score += weights.length * 0.5;
  if (password.length >= 12) score += weights.length * 0.3;
  if (password.length >= 16) score += weights.length * 0.2;

  // Score basé sur la complexité
  const complexityScore = Object.values(requirements).filter(req => req === true).length;
  score += (complexityScore / 6) * weights.complexity;

  // Score basé sur la variété des caractères
  const charTypes = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  ].filter(Boolean).length;
  score += (charTypes / 4) * weights.variety;

  // Score basé sur l'unicité (éviter les patterns communs)
  if (requirements.noCommonPatterns) {
    score += weights.uniqueness;
  }

  return Math.min(100, Math.round(score));
}

// Vérifier si le mot de passe est commun
function isCommonPassword(password) {
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    '1234567890', 'password1', 'qwerty123', 'dragon', 'master',
    'hello', 'freedom', 'whatever', 'qazwsx', 'trustno1',
    '654321', 'jordan23', 'harley', 'password', 'shadow',
    'superman', 'qazwsx', 'michael', 'football', 'baseball',
    'welcome', 'ninja', 'azerty', '123123', 'princess',
    'daniel', 'mustang', 'access', 'flower', '555555',
    'pass', 'shadow', 'michael', 'jordan', 'superman',
    'harley', 'ranger', 'hunter', 'buster', 'soccer',
    'hockey', 'killer', 'george', 'sexy', 'andrew',
    'charlie', 'superman', 'asshole', 'fuckyou', 'dallas',
    'jessica', 'panties', 'pepper', '1234', 'zxcvbn',
    '555555', 'qwertyui', '121212', '000000', 'qweasd',
    'killer', 'trustno1', 'jordan', 'jennifer', 'zxcvbnm',
    'asdfgh', 'hunter', 'buster', 'soccer', 'hockey',
    'killer', 'george', 'sexy', 'andrew', 'charlie',
    'superman', 'asshole', 'fuckyou', 'dallas', 'jessica',
    'panties', 'pepper', '1234', 'zxcvbn', '555555',
    'qwertyui', '121212', '000000', 'qweasd', 'killer',
    'trustno1', 'jordan', 'jennifer', 'zxcvbnm', 'asdfgh'
  ];
  
  return commonPasswords.includes(password.toLowerCase());
}

// Fonctions utilitaires de validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

function isValidAge(age) {
  if (typeof age === 'string') {
    // Format: "30 jours", "2 mois", "1 an"
    const ageRegex = /^(\d+)\s+(jour|jours|mois|an|ans)$/;
    return ageRegex.test(age);
  }
  return Number.isInteger(Number(age)) && Number(age) >= 0;
}

// Validation générique pour les données
export const validateData = (data, validationRules) => {
  const errors = [];
  
  for (const [field, rule] of Object.entries(validationRules)) {
    if (rule.required && (!data[field] || data[field].toString().trim() === '')) {
      errors.push(`${rule.label || field} est requis`);
      continue;
    }
    
    if (data[field] && rule.minLength && data[field].toString().length < rule.minLength) {
      errors.push(`${rule.label || field} doit contenir au moins ${rule.minLength} caractères`);
    }
    
    if (data[field] && rule.maxLength && data[field].toString().length > rule.maxLength) {
      errors.push(`${rule.label || field} ne doit pas dépasser ${rule.maxLength} caractères`);
    }
    
    if (data[field] && rule.pattern && !rule.pattern.test(data[field])) {
      errors.push(`${rule.label || field} n'est pas au bon format`);
    }
    
    if (data[field] && rule.enum && !rule.enum.includes(data[field])) {
      errors.push(`${rule.label || field} doit être l'une des valeurs: ${rule.enum.join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  validateUser,
  validateCouple,
  validateEgg,
  validatePigeonneau,
  validateHealthRecord,
  validateSale,
  validateData,
  validatePasswordStrength
}; 