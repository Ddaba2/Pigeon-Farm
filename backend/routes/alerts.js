const express = require('express');
const router = express.Router();
const { authenticateUser, requireAdmin } = require('../middleware/auth.js');
const { asyncHandler } = require('../utils/errorHandler.js');
const AlertService = require('../services/alertService.js');
const UnifiedAlertService = require('../services/unifiedAlertService.js');
const PushNotificationService = require('../services/pushNotificationService.js');

// GET /api/alerts/run - Exécuter toutes les vérifications d'alertes (admin seulement)
router.get('/run', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    console.log('🔔 Déclenchement manuel des alertes par l\'admin');
    
    const results = await AlertService.runAllAlerts();
    
    if (results) {
      res.json({
        success: true,
        message: 'Vérifications d\'alertes exécutées avec succès',
        data: results
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          message: 'Erreur lors de l\'exécution des vérifications d\'alertes',
          code: 'ALERTS_EXECUTION_ERROR'
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'exécution des alertes:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de l\'exécution des alertes',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// POST /api/alerts/custom - Créer une alerte personnalisée
router.post('/custom', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const { title, message, type, targetUserId } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Titre et message requis',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      });
    }
    
    // Si targetUserId n'est pas fourni, utiliser l'utilisateur actuel
    const userId = targetUserId || req.user.id;
    
    // Vérifier que l'utilisateur peut créer une alerte pour cet utilisateur
    if (targetUserId && req.user.role !== 'admin' && req.user.id !== targetUserId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Non autorisé à créer une alerte pour cet utilisateur',
          code: 'UNAUTHORIZED'
        }
      });
    }
    
    const success = await AlertService.createCustomAlert(
      userId,
      title,
      message,
      type || 'info',
      { createdBy: req.user.id, createdAt: new Date().toISOString() }
    );
    
    if (success) {
      res.json({
        success: true,
        message: 'Alerte personnalisée créée avec succès'
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          message: 'Erreur lors de la création de l\'alerte',
          code: 'ALERT_CREATION_ERROR'
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'alerte personnalisée:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la création de l\'alerte personnalisée',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// GET /api/alerts/test - Tester les alertes (admin seulement)
router.get('/test', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    // Créer une alerte de test pour l'admin
    const success = await AlertService.createCustomAlert(
      req.user.id,
      '🧪 Test d\'alerte',
      'Ceci est une alerte de test pour vérifier le système de notifications.',
      'info',
      { type: 'test', timestamp: new Date().toISOString() }
    );
    
    if (success) {
      res.json({
        success: true,
        message: 'Alerte de test créée avec succès'
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          message: 'Erreur lors de la création de l\'alerte de test',
          code: 'TEST_ALERT_ERROR'
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors du test d\'alerte:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors du test d\'alerte',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// GET /api/alerts/user - Récupérer les alertes pour l'utilisateur connecté
router.get('/user', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const alerts = await UnifiedAlertService.getUserAlerts(req.user.id);
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes utilisateur:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des alertes',
        code: 'USER_ALERTS_FETCH_ERROR'
      }
    });
  }
}));

// GET /api/alerts/global - Exécuter l'analyse globale des alertes (admin seulement)
router.get('/global', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const results = await UnifiedAlertService.runGlobalAlertAnalysis();
    
    if (results) {
      res.json({
        success: true,
        message: 'Analyse globale des alertes exécutée avec succès',
        data: results
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          message: 'Erreur lors de l\'analyse globale des alertes',
          code: 'GLOBAL_ALERTS_ANALYSIS_ERROR'
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'analyse globale des alertes:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de l\'analyse globale des alertes',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// GET /api/alerts/push/pending - Récupérer les notifications push en attente
router.get('/push/pending', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const notifications = await PushNotificationService.getPendingPushNotifications(req.user.id);
    
    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications push:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des notifications push',
        code: 'PUSH_NOTIFICATIONS_FETCH_ERROR'
      }
    });
  }
}));

// PUT /api/alerts/push/:id/read - Marquer une notification push comme lue
router.put('/push/:id/read', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const success = await PushNotificationService.markNotificationAsRead(id, req.user.id);
    
    if (success) {
      res.json({
        success: true,
        message: 'Notification push marquée comme lue'
      });
    } else {
      res.status(404).json({
        success: false,
        error: {
          message: 'Notification push non trouvée',
          code: 'PUSH_NOTIFICATION_NOT_FOUND'
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors du marquage de la notification push:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors du marquage de la notification push',
        code: 'PUSH_NOTIFICATION_MARK_ERROR'
      }
    });
  }
}));

// GET /api/alerts/push/stats - Obtenir les statistiques des notifications push
router.get('/push/stats', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const stats = await PushNotificationService.getPushNotificationStats(req.user.id);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques push:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des statistiques push',
        code: 'PUSH_STATS_FETCH_ERROR'
      }
    });
  }
}));

// POST /api/alerts/send-health-alert - Envoyer une alerte santé par email
router.post('/send-health-alert', asyncHandler(async (req, res) => {
  try {
    const { subject, text, to } = req.body;
    
    if (!text || !to) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Le texte de l\'alerte et l\'email destinataire sont requis',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      });
    }

    // Valider l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Format d\'email invalide',
          code: 'INVALID_EMAIL_FORMAT'
        }
      });
    }

    const emailService = require('../services/emailService');
    const emailServiceInstance = new emailService();
    
    const success = await emailServiceInstance.sendHealthAlert(text, to);
    
    if (success) {
      res.json({
        success: true,
        message: 'Alerte santé envoyée avec succès',
        data: {
          to: to,
          subject: subject || '🏥 Alerte Santé PigeonFarm - Action requise',
          sentAt: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          message: 'Erreur lors de l\'envoi de l\'alerte santé',
          code: 'HEALTH_ALERT_SEND_ERROR'
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'alerte santé:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de l\'envoi de l\'alerte santé',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

module.exports = router;
