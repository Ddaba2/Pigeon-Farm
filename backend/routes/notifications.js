const express = require('express');
const router = express.Router();
const NotificationService = require('../services/notificationService');
const { authenticateUser } = require('../middleware/auth');
const { asyncHandler } = require('../utils/errorHandler');

// GET /api/notifications - Récupérer toutes les notifications de l'utilisateur
router.get('/', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const notifications = await NotificationService.getUserNotifications(
      req.user.id, 
      parseInt(limit), 
      parseInt(offset)
    );

    res.json({
      success: true,
      data: notifications,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: notifications.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des notifications',
        code: 'NOTIFICATIONS_FETCH_ERROR'
      }
    });
  }
}));

// GET /api/notifications/unread - Récupérer les notifications non lues
router.get('/unread', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const notifications = await NotificationService.getUnreadNotifications(req.user.id);
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications non lues:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des notifications non lues',
        code: 'UNREAD_NOTIFICATIONS_FETCH_ERROR'
      }
    });
  }
}));

// GET /api/notifications/count - Compter les notifications non lues
router.get('/count', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user.id);
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Erreur lors du comptage des notifications:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors du comptage des notifications',
        code: 'NOTIFICATIONS_COUNT_ERROR'
      }
    });
  }
}));

// PUT /api/notifications/:id/read - Marquer une notification comme lue
router.put('/:id/read', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const success = await NotificationService.markAsRead(id, req.user.id);
    
    if (success) {
      res.json({
        success: true,
        message: 'Notification marquée comme lue'
      });
    } else {
      res.status(404).json({
        success: false,
        error: {
          message: 'Notification non trouvée',
          code: 'NOTIFICATION_NOT_FOUND'
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors du marquage de la notification:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors du marquage de la notification',
        code: 'NOTIFICATION_MARK_ERROR'
      }
    });
  }
}));

// PUT /api/notifications/read-all - Marquer toutes les notifications comme lues
router.put('/read-all', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const count = await NotificationService.markAllAsRead(req.user.id);
    
    res.json({
      success: true,
      message: `${count} notifications marquées comme lues`,
      data: { count }
    });
  } catch (error) {
    console.error('Erreur lors du marquage de toutes les notifications:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors du marquage de toutes les notifications',
        code: 'NOTIFICATIONS_MARK_ALL_ERROR'
      }
    });
  }
}));

// POST /api/notifications - Créer une nouvelle notification (admin seulement)
router.post('/', authenticateUser, asyncHandler(async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Accès non autorisé. Seuls les administrateurs peuvent créer des notifications.',
          code: 'UNAUTHORIZED'
        }
      });
    }

    const { userId, title, message, type = 'info' } = req.body;
    
    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'userId, title et message sont requis',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      });
    }

    const notificationId = await NotificationService.createNotification(userId, title, message, type);
    
    res.status(201).json({
      success: true,
      message: 'Notification créée avec succès',
      data: { id: notificationId }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la création de la notification',
        code: 'NOTIFICATION_CREATE_ERROR'
      }
    });
  }
}));

// DELETE /api/notifications/:id - Supprimer une notification
router.delete('/:id', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const success = await NotificationService.deleteNotification(id, req.user.id);
    
    if (success) {
      res.json({
        success: true,
        message: 'Notification supprimée avec succès'
      });
    } else {
      res.status(404).json({
        success: false,
        error: {
          message: 'Notification non trouvée',
          code: 'NOTIFICATION_NOT_FOUND'
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la suppression de la notification',
        code: 'NOTIFICATION_DELETE_ERROR'
      }
    });
  }
}));

// DELETE /api/notifications/read - Supprimer toutes les notifications lues
router.delete('/read', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const count = await NotificationService.deleteReadNotifications(req.user.id);
    
    res.json({
      success: true,
      message: `${count} notifications lues supprimées`,
      data: { count }
    });
  } catch (error) {
    console.error('Erreur lors de la suppression des notifications lues:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la suppression des notifications lues',
        code: 'NOTIFICATIONS_DELETE_READ_ERROR'
      }
    });
  }
}));

// POST /api/notifications/system - Créer des notifications système (admin seulement)
router.post('/system', authenticateUser, asyncHandler(async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Accès non autorisé. Seuls les administrateurs peuvent créer des notifications système.',
          code: 'UNAUTHORIZED'
        }
      });
    }

    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'userId est requis',
          code: 'MISSING_USER_ID'
        }
      });
    }

    const count = await NotificationService.createSystemNotifications(userId);
    
    res.status(201).json({
      success: true,
      message: `${count} notifications système créées`,
      data: { count }
    });
  } catch (error) {
    console.error('Erreur lors de la création des notifications système:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la création des notifications système',
        code: 'SYSTEM_NOTIFICATIONS_CREATE_ERROR'
      }
    });
  }
}));

module.exports = router;
