/**
 * Messages d'erreur centralisés pour PigeonFarm
 * Tous les messages sont en français et cohérents
 */

const ERROR_MESSAGES = {
  // === ERREURS D'AUTHENTIFICATION ===
  AUTH: {
    MISSING_CREDENTIALS: 'Veuillez fournir un nom d\'utilisateur et un mot de passe',
    INVALID_CREDENTIALS: 'Nom d\'utilisateur ou mot de passe incorrect',
    ACCOUNT_BLOCKED: 'Votre compte a été bloqué par un administrateur. Contactez support@pigeonfarm.com',
    ACCOUNT_PENDING: 'Votre compte est en attente d\'approbation par un administrateur',
    SESSION_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter',
    SESSION_INVALID: 'Session invalide. Veuillez vous reconnecter',
    UNAUTHORIZED: 'Vous devez être connecté pour accéder à cette ressource',
    FORBIDDEN: 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action',
    TOKEN_EXPIRED: 'Votre jeton d\'authentification a expiré',
    TOKEN_INVALID: 'Jeton d\'authentification invalide',
  },

  // === ERREURS D'INSCRIPTION ===
  REGISTER: {
    USER_EXISTS: 'Un utilisateur avec ce nom d\'utilisateur ou cet email existe déjà',
    USERNAME_TAKEN: 'Ce nom d\'utilisateur est déjà utilisé',
    EMAIL_TAKEN: 'Cet email est déjà utilisé',
    WEAK_PASSWORD: 'Le mot de passe doit contenir au moins 6 caractères',
    INVALID_EMAIL: 'Format d\'email invalide',
    MISSING_FIELDS: 'Tous les champs obligatoires doivent être remplis',
    TERMS_NOT_ACCEPTED: 'Vous devez accepter les conditions d\'utilisation',
    REGISTRATION_FAILED: 'Erreur lors de l\'inscription. Veuillez réessayer',
  },

  // === ERREURS DE MOT DE PASSE ===
  PASSWORD: {
    RESET_TOKEN_INVALID: 'Le code de réinitialisation est invalide ou a expiré',
    RESET_FAILED: 'Erreur lors de la réinitialisation du mot de passe',
    CURRENT_INCORRECT: 'Le mot de passe actuel est incorrect',
    TOO_SHORT: 'Le mot de passe doit contenir au moins 6 caractères',
    TOO_WEAK: 'Le mot de passe est trop faible. Utilisez des lettres, chiffres et caractères spéciaux',
    MISMATCH: 'Les mots de passe ne correspondent pas',
    SAME_AS_OLD: 'Le nouveau mot de passe doit être différent de l\'ancien',
  },

  // === ERREURS UTILISATEURS ===
  USER: {
    NOT_FOUND: 'Utilisateur non trouvé',
    ALREADY_EXISTS: 'Cet utilisateur existe déjà',
    CANNOT_DELETE_SELF: 'Vous ne pouvez pas supprimer votre propre compte',
    CANNOT_DELETE_ADMIN: 'Impossible de supprimer un compte administrateur',
    CANNOT_BLOCK_SELF: 'Vous ne pouvez pas bloquer votre propre compte',
    UPDATE_FAILED: 'Erreur lors de la mise à jour du profil',
    INVALID_ROLE: 'Rôle utilisateur invalide',
  },

  // === ERREURS COUPLES ===
  COUPLE: {
    NOT_FOUND: 'Couple non trouvé',
    NEST_TAKEN: 'Ce numéro de nid est déjà utilisé',
    INVALID_DATE: 'Date de formation invalide',
    DELETE_FAILED: 'Impossible de supprimer ce couple car il a des données associées',
    MISSING_FIELDS: 'Numéro de nid et race sont obligatoires',
    UNAUTHORIZED: 'Vous n\'êtes pas autorisé à modifier ce couple',
  },

  // === ERREURS ŒUFS ===
  EGG: {
    NOT_FOUND: 'Enregistrement d\'œuf non trouvé',
    INVALID_DATE: 'Date de ponte invalide',
    HATCH_BEFORE_LAY: 'La date d\'éclosion ne peut pas être antérieure à la date de ponte',
    COUPLE_NOT_FOUND: 'Couple non trouvé pour cet enregistrement',
    DELETE_FAILED: 'Impossible de supprimer cet enregistrement car il a des pigeonneaux associés',
    MISSING_FIELDS: 'Couple et date du premier œuf sont obligatoires',
  },

  // === ERREURS PIGEONNEAUX ===
  PIGEONNEAU: {
    NOT_FOUND: 'Pigeonneau non trouvé',
    INVALID_BIRTH_DATE: 'Date de naissance invalide',
    WEAN_BEFORE_BIRTH: 'La date de sevrage ne peut pas être antérieure à la date de naissance',
    SALE_BEFORE_BIRTH: 'La date de vente ne peut pas être antérieure à la date de naissance',
    MISSING_SALE_INFO: 'Prix et acheteur sont requis pour une vente',
    ALREADY_SOLD: 'Ce pigeonneau a déjà été vendu',
    ALREADY_DEAD: 'Ce pigeonneau est déjà marqué comme décédé',
    INVALID_STATUS: 'Statut invalide (alive, sold, dead)',
  },

  // === ERREURS SANTÉ ===
  HEALTH: {
    NOT_FOUND: 'Enregistrement de santé non trouvé',
    INVALID_TYPE: 'Type de soin invalide',
    INVALID_TARGET: 'Cible invalide (couple ou pigeonneau)',
    MISSING_FIELDS: 'Type, cible et produit sont obligatoires',
    FUTURE_DATE: 'La date du soin ne peut pas être dans le futur',
    NEXT_DUE_BEFORE_DATE: 'La prochaine échéance ne peut pas être antérieure à la date du soin',
  },

  // === ERREURS VENTES ===
  SALE: {
    NOT_FOUND: 'Vente non trouvée',
    INVALID_AMOUNT: 'Montant de vente invalide',
    INVALID_QUANTITY: 'Quantité invalide',
    NEGATIVE_AMOUNT: 'Le montant ne peut pas être négatif',
    MISSING_FIELDS: 'Date, quantité et montant sont obligatoires',
    FUTURE_DATE: 'La date de vente ne peut pas être dans le futur',
  },

  // === ERREURS STATISTIQUES ===
  STATS: {
    INVALID_PERIOD: 'Période invalide',
    NO_DATA: 'Aucune donnée disponible pour cette période',
    CALCULATION_ERROR: 'Erreur lors du calcul des statistiques',
  },

  // === ERREURS NOTIFICATIONS ===
  NOTIFICATION: {
    NOT_FOUND: 'Notification non trouvée',
    MARK_READ_FAILED: 'Erreur lors du marquage de la notification',
    DELETE_FAILED: 'Erreur lors de la suppression de la notification',
    SEND_FAILED: 'Erreur lors de l\'envoi de la notification',
  },

  // === ERREURS EMAIL ===
  EMAIL: {
    SEND_FAILED: 'Erreur lors de l\'envoi de l\'email',
    INVALID_ADDRESS: 'Adresse email invalide',
    SERVICE_UNAVAILABLE: 'Service d\'email temporairement indisponible',
  },

  // === ERREURS OAUTH ===
  OAUTH: {
    GOOGLE_ERROR: 'Erreur lors de la connexion avec Google',
    TOKEN_EXCHANGE_FAILED: 'Échec de l\'échange de jeton OAuth',
    PROFILE_FETCH_FAILED: 'Impossible de récupérer le profil Google',
    ACCOUNT_LINKING_FAILED: 'Erreur lors de la liaison du compte Google',
    ALREADY_LINKED: 'Ce compte Google est déjà lié à un autre utilisateur',
  },

  // === ERREURS VALIDATION ===
  VALIDATION: {
    INVALID_DATA: 'Données invalides',
    MISSING_REQUIRED: 'Champ(s) obligatoire(s) manquant(s)',
    INVALID_FORMAT: 'Format de données invalide',
    INVALID_JSON: 'JSON invalide',
    FILE_TOO_LARGE: 'Fichier trop volumineux (max 10MB)',
    INVALID_FILE_TYPE: 'Type de fichier non supporté',
  },

  // === ERREURS BASE DE DONNÉES ===
  DATABASE: {
    CONNECTION_FAILED: 'Impossible de se connecter à la base de données',
    QUERY_FAILED: 'Erreur lors de l\'exécution de la requête',
    DUPLICATE_ENTRY: 'Cette entrée existe déjà',
    FOREIGN_KEY_CONSTRAINT: 'Impossible de supprimer : des données dépendantes existent',
    TRANSACTION_FAILED: 'Erreur lors de la transaction',
  },

  // === ERREURS GÉNÉRALES ===
  GENERAL: {
    INTERNAL_ERROR: 'Erreur interne du serveur. Veuillez réessayer plus tard',
    NOT_FOUND: 'Ressource non trouvée',
    METHOD_NOT_ALLOWED: 'Méthode HTTP non autorisée',
    RATE_LIMIT: 'Trop de requêtes. Veuillez réessayer dans quelques minutes',
    MAINTENANCE: 'Service en maintenance. Réessayez plus tard',
    NETWORK_ERROR: 'Erreur réseau. Vérifiez votre connexion internet',
  },

  // === ERREURS ADMIN ===
  ADMIN: {
    UNAUTHORIZED: 'Accès réservé aux administrateurs',
    ACTION_FAILED: 'Action administrative échouée',
    INVALID_ACTION: 'Action administrative invalide',
    CANNOT_MODIFY_ADMIN: 'Impossible de modifier un autre administrateur',
  },
};

/**
 * Récupérer un message d'erreur
 * @param {string} category - Catégorie (AUTH, USER, etc.)
 * @param {string} type - Type d'erreur
 * @param {object} context - Contexte additionnel pour personnaliser le message
 */
function getErrorMessage(category, type, context = {}) {
  const message = ERROR_MESSAGES[category]?.[type] || ERROR_MESSAGES.GENERAL.INTERNAL_ERROR;
  
  // Remplacer les variables dans le message si nécessaire
  return Object.entries(context).reduce((msg, [key, value]) => {
    return msg.replace(`{${key}}`, value);
  }, message);
}

/**
 * Créer une réponse d'erreur standardisée
 */
function createErrorResponse(category, type, statusCode = 500, details = null) {
  return {
    success: false,
    error: {
      message: getErrorMessage(category, type),
      code: `${category}_${type}`,
      ...(details && { details })
    }
  };
}

module.exports = {
  ERROR_MESSAGES,
  getErrorMessage,
  createErrorResponse
};

