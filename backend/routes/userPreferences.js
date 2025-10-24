const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { asyncHandler } = require('../utils/errorHandler.js');
const UserPreferencesService = require('../services/userPreferencesService.js');

// GET /api/user-preferences - Récupérer les préférences de l'utilisateur connecté
router.get('/', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const preferences = await UserPreferencesService.getUserPreferences(req.user.id);
    
    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des préférences:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des préférences',
        code: 'PREFERENCES_FETCH_ERROR'
      }
    });
  }
}));

// PUT /api/user-preferences - Mettre à jour les préférences de l'utilisateur connecté
router.put('/', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const {
      pushNotifications,
      emailNotifications,
      smsNotifications,
      criticalAlertsOnly,
      quietHoursStart,
      quietHoursEnd,
      timezone
    } = req.body;
    
    // Validation des données (plus flexible)
    const validationErrors = [];
    
    if (pushNotifications !== undefined && typeof pushNotifications !== 'boolean') {
      validationErrors.push('pushNotifications doit être un booléen');
    }
    
    if (emailNotifications !== undefined && typeof emailNotifications !== 'boolean') {
      validationErrors.push('emailNotifications doit être un booléen');
    }
    
    if (smsNotifications !== undefined && typeof smsNotifications !== 'boolean') {
      validationErrors.push('smsNotifications doit être un booléen');
    }
    
    if (criticalAlertsOnly !== undefined && typeof criticalAlertsOnly !== 'boolean') {
      validationErrors.push('criticalAlertsOnly doit être un booléen');
    }
    
    // Accept both HH:MM and HH:MM:SS formats
    if (quietHoursStart && !/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(quietHoursStart)) {
      validationErrors.push('quietHoursStart doit être au format HH:MM ou HH:MM:SS');
    }
    
    if (quietHoursEnd && !/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(quietHoursEnd)) {
      validationErrors.push('quietHoursEnd doit être au format HH:MM ou HH:MM:SS');
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Données de validation invalides',
          code: 'VALIDATION_ERROR',
          details: validationErrors
        }
      });
    }
    
    const preferences = {
      pushNotifications: pushNotifications !== undefined ? Boolean(pushNotifications) : true,
      emailNotifications: emailNotifications !== undefined ? Boolean(emailNotifications) : true,
      smsNotifications: smsNotifications !== undefined ? Boolean(smsNotifications) : false,
      criticalAlertsOnly: criticalAlertsOnly !== undefined ? Boolean(criticalAlertsOnly) : true,
      quietHoursStart: quietHoursStart || '22:00:00',
      quietHoursEnd: quietHoursEnd || '07:00:00',
      timezone: timezone || 'Europe/Paris'
    };
    
    console.log('🔍 Préférences à sauvegarder:', JSON.stringify(preferences, null, 2));
    
    const updatedPreferences = await UserPreferencesService.updateUserPreferences(req.user.id, preferences);
    
    res.json({
      success: true,
      message: 'Préférences mises à jour avec succès',
      data: updatedPreferences
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des préférences:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour des préférences',
        code: 'PREFERENCES_UPDATE_ERROR'
      }
    });
  }
}));

// POST /api/user-preferences/reset - Réinitialiser les préférences de l'utilisateur connecté
router.post('/reset', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const defaultPreferences = await UserPreferencesService.resetUserPreferences(req.user.id);
    
    res.json({
      success: true,
      message: 'Préférences réinitialisées avec succès',
      data: defaultPreferences
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des préférences:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la réinitialisation des préférences',
        code: 'PREFERENCES_RESET_ERROR'
      }
    });
  }
}));

// GET /api/user-preferences/stats - Obtenir les statistiques des préférences (admin seulement)
router.get('/stats', authenticateUser, asyncHandler(async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Accès non autorisé. Seuls les administrateurs peuvent voir les statistiques.',
          code: 'UNAUTHORIZED'
        }
      });
    }
    
    const stats = await UserPreferencesService.getPreferencesStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des statistiques',
        code: 'STATS_FETCH_ERROR'
      }
    });
  }
}));

// POST /api/user-preferences/migrate - Migrer les préférences d'un utilisateur (admin seulement)
router.post('/migrate/:userId', authenticateUser, asyncHandler(async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Accès non autorisé. Seuls les administrateurs peuvent migrer les préférences.',
          code: 'UNAUTHORIZED'
        }
      });
    }
    
    const { userId } = req.params;
    
    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'ID utilisateur invalide',
          code: 'INVALID_USER_ID'
        }
      });
    }
    
    const preferences = await UserPreferencesService.migrateUserPreferences(parseInt(userId));
    
    res.json({
      success: true,
      message: 'Préférences migrées avec succès',
      data: preferences
    });
  } catch (error) {
    console.error('Erreur lors de la migration des préférences:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la migration des préférences',
        code: 'PREFERENCES_MIGRATION_ERROR'
      }
    });
  }
}));

// GET /api/user-preferences/test - Tester les préférences de notification
router.get('/test', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const { type = 'push', priority = 'medium' } = req.query;
    
    const canSend = await UserPreferencesService.canSendNotification(req.user.id, type, priority);
    
    res.json({
      success: true,
      data: {
        canSend,
        type,
        priority,
        message: canSend 
          ? `Les notifications ${type} de priorité ${priority} sont autorisées`
          : `Les notifications ${type} de priorité ${priority} ne sont pas autorisées`
      }
    });
  } catch (error) {
    console.error('Erreur lors du test des préférences:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors du test des préférences',
        code: 'PREFERENCES_TEST_ERROR'
      }
    });
  }
}));

module.exports = router;
