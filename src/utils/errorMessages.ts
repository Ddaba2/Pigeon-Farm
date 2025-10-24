/**
 * Messages d'erreur centralisés pour le frontend PigeonFarm
 * Tous les messages sont en français et cohérents
 */

export const ERROR_MESSAGES = {
  // === ERREURS D'AUTHENTIFICATION ===
  AUTH: {
    MISSING_CREDENTIALS: 'Veuillez saisir votre nom d\'utilisateur et votre mot de passe',
    INVALID_CREDENTIALS: 'Nom d\'utilisateur ou mot de passe incorrect',
    ACCOUNT_BLOCKED: 'Votre compte a été bloqué. Contactez un administrateur',
    ACCOUNT_PENDING: 'Votre compte est en attente d\'approbation',
    SESSION_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter',
    LOGIN_FAILED: 'Erreur lors de la connexion. Veuillez réessayer',
    LOGOUT_FAILED: 'Erreur lors de la déconnexion',
  },

  // === ERREURS D'INSCRIPTION ===
  REGISTER: {
    USER_EXISTS: 'Ce nom d\'utilisateur ou cet email est déjà utilisé',
    USERNAME_TAKEN: 'Ce nom d\'utilisateur est déjà pris',
    EMAIL_TAKEN: 'Cet email est déjà utilisé',
    WEAK_PASSWORD: 'Le mot de passe doit contenir au moins 6 caractères',
    PASSWORD_MISMATCH: 'Les mots de passe ne correspondent pas',
    INVALID_EMAIL: 'Adresse email invalide',
    MISSING_FIELDS: 'Veuillez remplir tous les champs obligatoires',
    TERMS_NOT_ACCEPTED: 'Vous devez accepter les conditions d\'utilisation',
    REGISTRATION_FAILED: 'Erreur lors de l\'inscription. Veuillez réessayer',
  },

  // === ERREURS DE MOT DE PASSE ===
  PASSWORD: {
    CURRENT_INCORRECT: 'Le mot de passe actuel est incorrect',
    TOO_SHORT: 'Le mot de passe doit contenir au moins 6 caractères',
    TOO_WEAK: 'Mot de passe trop faible. Ajoutez des chiffres et caractères spéciaux',
    MISMATCH: 'Les mots de passe ne correspondent pas',
    RESET_FAILED: 'Erreur lors de la réinitialisation du mot de passe',
    CODE_INVALID: 'Code de réinitialisation invalide ou expiré',
    SAME_AS_OLD: 'Le nouveau mot de passe doit être différent',
  },

  // === ERREURS UTILISATEURS ===
  USER: {
    NOT_FOUND: 'Utilisateur non trouvé',
    LOAD_FAILED: 'Erreur lors du chargement des utilisateurs',
    UPDATE_FAILED: 'Erreur lors de la mise à jour du profil',
    DELETE_FAILED: 'Erreur lors de la suppression de l\'utilisateur',
    PROFILE_UPDATE_FAILED: 'Erreur lors de la mise à jour du profil',
  },

  // === ERREURS COUPLES ===
  COUPLE: {
    NOT_FOUND: 'Couple non trouvé',
    LOAD_FAILED: 'Erreur lors du chargement des couples',
    CREATE_FAILED: 'Erreur lors de la création du couple',
    UPDATE_FAILED: 'Erreur lors de la mise à jour du couple',
    DELETE_FAILED: 'Erreur lors de la suppression du couple',
    NEST_TAKEN: 'Ce numéro de nid est déjà utilisé',
    MISSING_FIELDS: 'Numéro de nid et race sont obligatoires',
    INVALID_DATE: 'Date de formation invalide',
  },

  // === ERREURS ŒUFS ===
  EGG: {
    NOT_FOUND: 'Enregistrement d\'œuf non trouvé',
    LOAD_FAILED: 'Erreur lors du chargement des œufs',
    CREATE_FAILED: 'Erreur lors de l\'enregistrement de la ponte',
    UPDATE_FAILED: 'Erreur lors de la mise à jour de l\'œuf',
    DELETE_FAILED: 'Erreur lors de la suppression de l\'enregistrement',
    MISSING_FIELDS: 'Couple et date du premier œuf sont obligatoires',
    INVALID_DATE: 'Date de ponte invalide',
    HATCH_BEFORE_LAY: 'La date d\'éclosion ne peut pas être avant la ponte',
  },

  // === ERREURS PIGEONNEAUX ===
  PIGEONNEAU: {
    NOT_FOUND: 'Pigeonneau non trouvé',
    LOAD_FAILED: 'Erreur lors du chargement des pigeonneaux',
    CREATE_FAILED: 'Erreur lors de l\'enregistrement du pigeonneau',
    UPDATE_FAILED: 'Erreur lors de la mise à jour du pigeonneau',
    DELETE_FAILED: 'Erreur lors de la suppression du pigeonneau',
    INVALID_BIRTH_DATE: 'Date de naissance invalide',
    MISSING_SALE_INFO: 'Prix et acheteur requis pour une vente',
    WEAN_BEFORE_BIRTH: 'Date de sevrage invalide',
  },

  // === ERREURS SANTÉ ===
  HEALTH: {
    NOT_FOUND: 'Enregistrement de santé non trouvé',
    LOAD_FAILED: 'Erreur lors du chargement des enregistrements',
    CREATE_FAILED: 'Erreur lors de l\'enregistrement du soin',
    UPDATE_FAILED: 'Erreur lors de la mise à jour',
    DELETE_FAILED: 'Erreur lors de la suppression',
    MISSING_FIELDS: 'Type, cible et produit sont obligatoires',
    INVALID_DATE: 'Date de soin invalide',
  },

  // === ERREURS VENTES ===
  SALE: {
    NOT_FOUND: 'Vente non trouvée',
    LOAD_FAILED: 'Erreur lors du chargement des ventes',
    CREATE_FAILED: 'Erreur lors de l\'enregistrement de la vente',
    UPDATE_FAILED: 'Erreur lors de la mise à jour de la vente',
    DELETE_FAILED: 'Erreur lors de la suppression de la vente',
    INVALID_AMOUNT: 'Montant invalide',
    MISSING_FIELDS: 'Date, quantité et montant sont obligatoires',
  },

  // === ERREURS STATISTIQUES ===
  STATS: {
    LOAD_FAILED: 'Erreur lors du chargement des statistiques',
    NO_DATA: 'Aucune donnée disponible',
    CALCULATION_ERROR: 'Erreur de calcul des statistiques',
  },

  // === ERREURS NOTIFICATIONS ===
  NOTIFICATION: {
    LOAD_FAILED: 'Erreur lors du chargement des notifications',
    MARK_READ_FAILED: 'Erreur lors du marquage',
    DELETE_FAILED: 'Erreur lors de la suppression',
  },

  // === ERREURS EXPORT ===
  EXPORT: {
    PDF_FAILED: 'Erreur lors de la génération du PDF',
    NO_DATA: 'Aucune donnée à exporter',
    LOGO_LOAD_FAILED: 'Erreur lors du chargement du logo',
  },

  // === ERREURS RÉSEAU ===
  NETWORK: {
    NO_CONNECTION: 'Pas de connexion internet',
    TIMEOUT: 'Délai d\'attente dépassé',
    SERVER_ERROR: 'Erreur serveur. Veuillez réessayer',
    UNKNOWN: 'Erreur réseau inconnue',
  },

  // === ERREURS VALIDATION ===
  VALIDATION: {
    INVALID_EMAIL: 'Format d\'email invalide',
    INVALID_DATE: 'Date invalide',
    INVALID_NUMBER: 'Nombre invalide',
    REQUIRED_FIELD: 'Ce champ est obligatoire',
    MIN_LENGTH: 'Trop court (minimum {min} caractères)',
    MAX_LENGTH: 'Trop long (maximum {max} caractères)',
  },

  // === ERREURS GÉNÉRALES ===
  GENERAL: {
    UNEXPECTED_ERROR: 'Une erreur inattendue s\'est produite',
    TRY_AGAIN: 'Veuillez réessayer',
    CONTACT_SUPPORT: 'Si le problème persiste, contactez le support',
    OPERATION_FAILED: 'Échec de l\'opération',
    PERMISSION_DENIED: 'Permission refusée',
    NOT_FOUND: 'Ressource non trouvée',
  },

  // === ERREURS ADMIN ===
  ADMIN: {
    UNAUTHORIZED: 'Accès administrateur requis',
    ACTION_FAILED: 'Action administrative échouée',
    LOAD_METRICS_FAILED: 'Erreur lors du chargement des métriques',
    LOAD_USERS_FAILED: 'Erreur lors du chargement des utilisateurs',
  },
};

/**
 * Messages de succès centralisés
 */
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN: 'Connexion réussie',
    LOGOUT: 'Déconnexion réussie',
    REGISTER: 'Inscription réussie',
    PASSWORD_CHANGED: 'Mot de passe modifié avec succès',
    PASSWORD_RESET: 'Mot de passe réinitialisé',
  },

  USER: {
    CREATED: 'Utilisateur créé avec succès',
    UPDATED: 'Profil mis à jour',
    DELETED: 'Utilisateur supprimé',
    BLOCKED: 'Utilisateur bloqué',
    UNBLOCKED: 'Utilisateur débloqué',
  },

  COUPLE: {
    CREATED: 'Couple créé avec succès',
    UPDATED: 'Couple mis à jour',
    DELETED: 'Couple supprimé',
  },

  EGG: {
    CREATED: 'Ponte enregistrée avec succès',
    UPDATED: 'Enregistrement mis à jour',
    DELETED: 'Enregistrement supprimé',
  },

  PIGEONNEAU: {
    CREATED: 'Pigeonneau enregistré avec succès',
    UPDATED: 'Pigeonneau mis à jour',
    DELETED: 'Pigeonneau supprimé',
    SOLD: 'Vente enregistrée avec succès',
  },

  HEALTH: {
    CREATED: 'Soin enregistré avec succès',
    UPDATED: 'Enregistrement mis à jour',
    DELETED: 'Enregistrement supprimé',
  },

  SALE: {
    CREATED: 'Vente enregistrée avec succès',
    UPDATED: 'Vente mise à jour',
    DELETED: 'Vente supprimée',
  },

  NOTIFICATION: {
    MARKED_READ: 'Notification marquée comme lue',
    DELETED: 'Notification supprimée',
    ALL_READ: 'Toutes les notifications marquées comme lues',
    ALL_DELETED: 'Toutes les notifications supprimées',
  },

  EXPORT: {
    PDF_SUCCESS: 'PDF généré avec succès',
  },

  GENERAL: {
    SAVED: 'Enregistré avec succès',
    OPERATION_SUCCESS: 'Opération réussie',
  },
};

/**
 * Obtenir un message d'erreur avec contexte
 */
export function getErrorMessage(
  category: keyof typeof ERROR_MESSAGES,
  type: string,
  context: Record<string, any> = {}
): string {
  const message = (ERROR_MESSAGES[category] as any)?.[type] || ERROR_MESSAGES.GENERAL.UNEXPECTED_ERROR;
  
  // Remplacer les variables dans le message
  return Object.entries(context).reduce((msg, [key, value]) => {
    return msg.replace(`{${key}}`, String(value));
  }, message);
}

/**
 * Obtenir un message de succès
 */
export function getSuccessMessage(
  category: keyof typeof SUCCESS_MESSAGES,
  type: string
): string {
  return (SUCCESS_MESSAGES[category] as any)?.[type] || SUCCESS_MESSAGES.GENERAL.OPERATION_SUCCESS;
}

/**
 * Formater un message d'erreur API
 */
export function formatApiError(error: any): string {
  // Si c'est une erreur réseau
  if (!error.response) {
    return ERROR_MESSAGES.NETWORK.NO_CONNECTION;
  }

  // Si le serveur a renvoyé un message d'erreur
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  // Erreurs HTTP standard
  const status = error.response?.status;
  switch (status) {
    case 400:
      return ERROR_MESSAGES.VALIDATION.INVALID_DATA;
    case 401:
      return ERROR_MESSAGES.AUTH.SESSION_EXPIRED;
    case 403:
      return ERROR_MESSAGES.GENERAL.PERMISSION_DENIED;
    case 404:
      return ERROR_MESSAGES.GENERAL.NOT_FOUND;
    case 409:
      return ERROR_MESSAGES.REGISTER.USER_EXISTS;
    case 500:
      return ERROR_MESSAGES.NETWORK.SERVER_ERROR;
    default:
      return ERROR_MESSAGES.GENERAL.UNEXPECTED_ERROR;
  }
}

