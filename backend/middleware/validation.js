import { body, param, query, validationResult } from 'express-validator';

// Validation pour les couples
export const validateCouple = [
  body('nestNumber')
    .isInt({ min: 1 })
    .withMessage('Le numéro de nid doit être un nombre entier positif'),
  body('maleId')
    .isLength({ min: 1, max: 50 })
    .withMessage('L\'identifiant du mâle doit contenir entre 1 et 50 caractères')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('L\'identifiant du mâle contient des caractères non autorisés'),
  body('femaleId')
    .isLength({ min: 1, max: 50 })
    .withMessage('L\'identifiant de la femelle doit contenir entre 1 et 50 caractères')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('L\'identifiant de la femelle contient des caractères non autorisés'),
  body('breed')
    .isLength({ min: 1, max: 100 })
    .withMessage('La race doit contenir entre 1 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s\-_]+$/)
    .withMessage('La race contient des caractères non autorisés'),
  body('status')
    .isIn(['active', 'inactive', 'breeding', 'resting'])
    .withMessage('Le statut doit être actif, inactif, en reproduction ou en repos')
];

// Validation pour les œufs
export const validateEgg = [
  body('coupleId')
    .isInt({ min: 1 })
    .withMessage('L\'ID du couple doit être un nombre entier positif'),
  body('layDate')
    .isISO8601()
    .withMessage('La date de ponte doit être au format ISO 8601'),
  body('expectedHatchDate')
    .isISO8601()
    .withMessage('La date d\'éclosion prévue doit être au format ISO 8601'),
  body('status')
    .isIn(['laid', 'incubating', 'hatched', 'broken', 'infertile'])
    .withMessage('Le statut doit être pondu, en incubation, éclos, cassé ou stérile')
];

// Validation pour les pigeonneaux
export const validatePigeonneau = [
  body('eggId')
    .isInt({ min: 1 })
    .withMessage('L\'ID de l\'œuf doit être un nombre entier positif'),
  body('hatchDate')
    .isISO8601()
    .withMessage('La date d\'éclosion doit être au format ISO 8601'),
  body('sex')
    .isIn(['male', 'female', 'unknown'])
    .withMessage('Le sexe doit être mâle, femelle ou inconnu'),
  body('weight')
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Le poids doit être un nombre entre 0 et 1000'),
  body('status')
    .isIn(['alive', 'dead', 'sold', 'released'])
    .withMessage('Le statut doit être vivant, mort, vendu ou relâché')
];

// Validation pour les enregistrements de santé
export const validateHealthRecord = [
  body('coupleId')
    .isInt({ min: 1 })
    .withMessage('L\'ID du couple doit être un nombre entier positif'),
  body('type')
    .isIn(['vaccination', 'treatment', 'prophylaxis'])
    .withMessage('Le type doit être vaccination, traitement ou prophylaxie'),
  body('interventionDate')
    .isISO8601()
    .withMessage('La date d\'intervention doit être au format ISO 8601'),
  body('observations')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Les observations ne peuvent pas dépasser 1000 caractères')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-_.,!?()]+$/)
    .withMessage('Les observations contiennent des caractères non autorisés')
];

// Validation pour les utilisateurs
export const validateUser = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Le nom d\'utilisateur doit contenir entre 3 et 50 caractères')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores'),
  body('email')
    .isEmail()
    .withMessage('L\'email doit être au format valide')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Le rôle doit être utilisateur ou administrateur')
];

// Validation pour l'authentification
export const validateLogin = [
  body('username')
    .isLength({ min: 1 })
    .withMessage('Le nom d\'utilisateur est requis'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Le mot de passe est requis')
];

// Validation pour les ventes
export const validateSale = [
  body('date')
    .isISO8601()
    .withMessage('La date doit être au format ISO 8601'),
  body('quantity')
    .isInt({ min: 1, max: 1000 })
    .withMessage('La quantité doit être un nombre entier entre 1 et 1000'),
  body('unitPrice')
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Le prix unitaire doit être un nombre entre 0 et 1 000 000'),
  body('client')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Le nom du client ne peut pas dépasser 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s\-_]+$/)
    .withMessage('Le nom du client contient des caractères non autorisés'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-_.,!?()]+$/)
    .withMessage('La description contient des caractères non autorisés')
];

// Validation pour les paramètres d'URL
export const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('L\'ID doit être un nombre entier positif')
];

// Validation pour les paramètres de requête
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un nombre entier positif'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être un nombre entier entre 1 et 100')
];

// Validation pour les dates
export const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('La date de début doit être au format ISO 8601'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('La date de fin doit être au format ISO 8601')
];

// Middleware pour gérer les erreurs de validation
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Données de validation invalides',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validation personnalisée pour les données JSON
export const validateJSON = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    // Vérifier la profondeur de l'objet
    const checkDepth = (obj, depth = 0) => {
      if (depth > 10) {
        throw new Error('Objet trop profond');
      }
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            checkDepth(obj[key], depth + 1);
          }
        }
      }
    };
    
    try {
      checkDepth(req.body);
    } catch (error) {
      return res.status(400).json({
        error: 'Structure de données invalide',
        message: error.message
      });
    }
  }
  next();
};

// Validation pour les fichiers uploadés
export const validateFileUpload = [
  body('filename')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Le nom du fichier ne peut pas dépasser 255 caractères')
    .matches(/^[a-zA-Z0-9\s\-_.]+$/)
    .withMessage('Le nom du fichier contient des caractères non autorisés'),
  body('fileType')
    .optional()
    .isIn(['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/csv'])
    .withMessage('Type de fichier non autorisé')
]; 