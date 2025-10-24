const express = require('express');
const router = express.Router();
const { authenticateUser, requireAdmin } = require('../middleware/auth.js');
const { asyncHandler } = require('../utils/errorHandler.js');
const ArchiveService = require('../services/archiveService.js');

// GET /api/archive/stats - Obtenir les statistiques d'archivage
router.get('/stats', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const stats = await ArchiveService.getArchiveStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques d\'archivage:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des statistiques d\'archivage',
        code: 'ARCHIVE_STATS_ERROR'
      }
    });
  }
}));

// POST /api/archive/run - Exécuter l'archivage complet (admin seulement)
router.post('/run', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    console.log('🔔 Déclenchement manuel de l\'archivage par l\'admin');
    
    const results = await ArchiveService.runFullArchive();
    
    res.json({
      success: true,
      message: 'Archivage exécuté avec succès',
      data: results
    });
  } catch (error) {
    console.error('Erreur lors de l\'exécution de l\'archivage:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de l\'exécution de l\'archivage',
        code: 'ARCHIVE_EXECUTION_ERROR'
      }
    });
  }
}));

// POST /api/archive/notifications - Archiver les anciennes notifications (admin seulement)
router.post('/notifications', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const results = await ArchiveService.archiveOldNotifications();
    
    res.json({
      success: true,
      message: 'Archivage des notifications exécuté avec succès',
      data: results
    });
  } catch (error) {
    console.error('Erreur lors de l\'archivage des notifications:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de l\'archivage des notifications',
        code: 'NOTIFICATIONS_ARCHIVE_ERROR'
      }
    });
  }
}));

// POST /api/archive/push-notifications - Archiver les anciennes notifications push (admin seulement)
router.post('/push-notifications', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const results = await ArchiveService.archiveOldPushNotifications();
    
    res.json({
      success: true,
      message: 'Archivage des notifications push exécuté avec succès',
      data: results
    });
  } catch (error) {
    console.error('Erreur lors de l\'archivage des notifications push:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de l\'archivage des notifications push',
        code: 'PUSH_NOTIFICATIONS_ARCHIVE_ERROR'
      }
    });
  }
}));

// POST /api/archive/clean-logs - Nettoyer les anciens logs (admin seulement)
router.post('/clean-logs', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const auditResults = await ArchiveService.cleanOldAuditLogs();
    const codesResults = await ArchiveService.cleanExpiredResetCodes();
    
    res.json({
      success: true,
      message: 'Nettoyage des logs exécuté avec succès',
      data: {
        auditLogs: auditResults,
        resetCodes: codesResults
      }
    });
  } catch (error) {
    console.error('Erreur lors du nettoyage des logs:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors du nettoyage des logs',
        code: 'LOGS_CLEANUP_ERROR'
      }
    });
  }
}));

// GET /api/archive/archived-notifications - Récupérer les notifications archivées (admin seulement)
router.get('/archived-notifications', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { limit = 50, offset = 0, userId } = req.query;
    
    let sql = `
      SELECT 
        an.id,
        an.original_id,
        an.user_id,
        an.title,
        an.message,
        an.type,
        an.read_status,
        an.created_at,
        an.archived_at,
        an.archive_reason,
        u.username,
        u.email
      FROM archived_notifications an
      JOIN users u ON an.user_id = u.id
    `;
    
    const params = [];
    
    if (userId) {
      sql += ' WHERE an.user_id = ?';
      params.push(userId);
    }
    
    sql += ' ORDER BY an.archived_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const notifications = await require('../config/database.js').executeQuery(sql, params);
    
    // Compter le total
    let countSql = 'SELECT COUNT(*) as total FROM archived_notifications an';
    const countParams = [];
    
    if (userId) {
      countSql += ' WHERE an.user_id = ?';
      countParams.push(userId);
    }
    
    const countResult = await require('../config/database.js').executeQuery(countSql, countParams);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: notifications,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: total
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications archivées:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des notifications archivées',
        code: 'ARCHIVED_NOTIFICATIONS_FETCH_ERROR'
      }
    });
  }
}));

// POST /api/archive/restore-notifications - Restaurer des notifications archivées (admin seulement)
router.post('/restore-notifications', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Liste d\'IDs de notifications requise',
          code: 'MISSING_NOTIFICATION_IDS'
        }
      });
    }
    
    const results = await ArchiveService.restoreArchivedNotifications(notificationIds);
    
    res.json({
      success: true,
      message: `${results.restored} notifications restaurées avec succès`,
      data: results
    });
  } catch (error) {
    console.error('Erreur lors de la restauration des notifications:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la restauration des notifications',
        code: 'NOTIFICATIONS_RESTORE_ERROR'
      }
    });
  }
}));

// GET /api/archive/logs - Récupérer les logs d'archivage (admin seulement)
router.get('/logs', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const sql = `
      SELECT 
        al.id,
        al.archive_type,
        al.items_archived,
        al.items_deleted,
        al.execution_time_ms,
        al.status,
        al.error_message,
        al.executed_at,
        u.username as executed_by_username
      FROM archive_logs al
      LEFT JOIN users u ON al.executed_by = u.id
      ORDER BY al.executed_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const logs = await require('../config/database.js').executeQuery(sql, [parseInt(limit), parseInt(offset)]);
    
    // Compter le total
    const countResult = await require('../config/database.js').executeQuery('SELECT COUNT(*) as total FROM archive_logs');
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: logs,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: total
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des logs d\'archivage:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des logs d\'archivage',
        code: 'ARCHIVE_LOGS_FETCH_ERROR'
      }
    });
  }
}));

module.exports = router;
