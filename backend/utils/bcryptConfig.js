import bcrypt from 'bcrypt';

// Configuration bcrypt
const SALT_ROUNDS = 12;

// Fonction pour hasher un mot de passe
export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    console.error('Erreur lors du hashage du mot de passe:', error);
    throw new Error('Erreur lors du hashage du mot de passe');
  }
};

// Fonction pour vérifier un mot de passe
export const verifyPassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Erreur lors de la vérification du mot de passe:', error);
    return false;
  }
};

// Fonction pour valider la force du mot de passe
export const validatePasswordStrength = (password) => {
  const errors = [];
  let score = 0;

  // Vérifications de base
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  } else {
    score += 1;
  }

  if (password.length >= 12) {
    score += 1;
  }

  // Vérifier la présence de lettres minuscules
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
  } else {
    score += 1;
  }

  // Vérifier la présence de lettres majuscules
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
  } else {
    score += 1;
  }

  // Vérifier la présence de chiffres
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  } else {
    score += 1;
  }

  // Vérifier la présence de caractères spéciaux
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  } else {
    score += 1;
  }

  // Déterminer si le mot de passe est valide
  const isValid = score >= 4 && errors.length === 0;

  return {
    isValid,
    score,
    errors,
    strength: score < 3 ? 'faible' : score < 5 ? 'moyen' : 'fort'
  };
};

// Fonction pour générer un mot de passe sécurisé
export const generateSecurePassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Assurer au moins un caractère de chaque type
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // minuscule
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // majuscule
  password += '0123456789'[Math.floor(Math.random() * 10)]; // chiffre
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // caractère spécial
  
  // Compléter avec des caractères aléatoires
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Mélanger le mot de passe
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

export default {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  generateSecurePassword
}; 