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
  
  if (!userData.password || userData.password.length < 6) {
    errors.push('Le mot de passe doit contenir au moins 6 caractères');
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
  
  if (!coupleData.name || coupleData.name.trim().length < 2) {
    errors.push('Le nom du couple doit contenir au moins 2 caractères');
  }
  
  if (!coupleData.male || coupleData.male.trim().length < 2) {
    errors.push('Le nom du mâle doit contenir au moins 2 caractères');
  }
  
  if (!coupleData.female || coupleData.female.trim().length < 2) {
    errors.push('Le nom de la femelle doit contenir au moins 2 caractères');
  }
  
  if (coupleData.status && !['actif', 'inactif', 'reproduction'].includes(coupleData.status)) {
    errors.push('Le statut doit être "actif", "inactif" ou "reproduction"');
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
  validateData
}; 