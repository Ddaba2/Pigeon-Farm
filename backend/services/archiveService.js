const { executeQuery } = require('../config/database.js');

/**
 * Service d'archivage automatique pour les notifications et alertes
 */
class ArchiveService {
  
  /**
   * Archiver les anciennes notifications
   */
  static async archiveOldNotifications() {
    try {
      console.log('🗄️ Début de l\'archivage des anciennes notifications...');
      
      // Archiver les notifications lues de plus de 30 jours
      const archiveNotificationsSql = `
        INSERT INTO archived_notifications (
          original_id, user_id, title, message, type, read_status, 
          created_at, archived_at, archive_reason
        )
        SELECT 
          id, user_id, title, message, type, read_status, 
          created_at, NOW(), 'auto_archive_30_days'
        FROM notifications 
        WHERE read_status = TRUE 
        AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
      `;
      
      const notificationsResult = await executeQuery(archiveNotificationsSql);
      
      // Supprimer les notifications archivées
      const deleteNotificationsSql = `
        DELETE FROM notifications 
        WHERE read_status = TRUE 
        AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
      `;
      
      const deleteResult = await executeQuery(deleteNotificationsSql);
      
      console.log(`✅ ${notificationsResult.affectedRows} notifications archivées et ${deleteResult.affectedRows} supprimées`);
      
      return {
        notificationsArchived: notificationsResult.affectedRows,
        notificationsDeleted: deleteResult.affectedRows
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'archivage des notifications:', error);
      throw error;
    }
  }
  
  /**
   * Archiver les anciennes notifications push
   */
  static async archiveOldPushNotifications() {
    try {
      console.log('🗄️ Début de l\'archivage des anciennes notifications push...');
      
      // Archiver les notifications push lues de plus de 60 jours
      const archivePushSql = `
        INSERT INTO archived_push_notifications (
          original_id, user_id, title, message, type, priority, 
          data, timestamp, status, sent_at, read_at, archived_at, archive_reason
        )
        SELECT 
          id, user_id, title, message, type, priority, 
          data, timestamp, status, sent_at, read_at, NOW(), 'auto_archive_60_days'
        FROM push_notifications 
        WHERE status = 'read' 
        AND read_at < DATE_SUB(NOW(), INTERVAL 60 DAY)
      `;
      
      const pushResult = await executeQuery(archivePushSql);
      
      // Supprimer les notifications push archivées
      const deletePushSql = `
        DELETE FROM push_notifications 
        WHERE status = 'read' 
        AND read_at < DATE_SUB(NOW(), INTERVAL 60 DAY)
      `;
      
      const deletePushResult = await executeQuery(deletePushSql);
      
      console.log(`✅ ${pushResult.affectedRows} notifications push archivées et ${deletePushResult.affectedRows} supprimées`);
      
      return {
        pushNotificationsArchived: pushResult.affectedRows,
        pushNotificationsDeleted: deletePushResult.affectedRows
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'archivage des notifications push:', error);
      throw error;
    }
  }
  
  /**
   * Nettoyer les logs d'audit anciens
   */
  static async cleanOldAuditLogs() {
    try {
      console.log('🗄️ Début du nettoyage des anciens logs d\'audit...');
      
      // Supprimer les logs d'audit de plus de 1 an
      const deleteAuditSql = `
        DELETE FROM audit_logs 
        WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR)
      `;
      
      const auditResult = await executeQuery(deleteAuditSql);
      
      console.log(`✅ ${auditResult.affectedRows} logs d'audit supprimés`);
      
      return {
        auditLogsDeleted: auditResult.affectedRows
      };
      
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des logs d\'audit:', error);
      throw error;
    }
  }
  
  /**
   * Nettoyer les codes de réinitialisation expirés
   */
  static async cleanExpiredResetCodes() {
    try {
      console.log('🗄️ Début du nettoyage des codes de réinitialisation expirés...');
      
      // Supprimer les codes expirés ou utilisés
      const deleteCodesSql = `
        DELETE FROM password_reset_codes 
        WHERE expires_at < NOW() OR used = TRUE
      `;
      
      const codesResult = await executeQuery(deleteCodesSql);
      
      console.log(`✅ ${codesResult.affectedRows} codes de réinitialisation supprimés`);
      
      return {
        resetCodesDeleted: codesResult.affectedRows
      };
      
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des codes de réinitialisation:', error);
      throw error;
    }
  }
  
  /**
   * Exécuter l'archivage complet
   */
  static async runFullArchive() {
    try {
      console.log('🚀 Démarrage de l\'archivage complet...');
      
      const results = {
        notifications: { archived: 0, deleted: 0 },
        pushNotifications: { archived: 0, deleted: 0 },
        auditLogs: { deleted: 0 },
        resetCodes: { deleted: 0 }
      };
      
      // Archiver les notifications
      const notificationsResult = await this.archiveOldNotifications();
      results.notifications = notificationsResult;
      
      // Archiver les notifications push
      const pushResult = await this.archiveOldPushNotifications();
      results.pushNotifications = pushResult;
      
      // Nettoyer les logs d'audit
      const auditResult = await this.cleanOldAuditLogs();
      results.auditLogs = auditResult;
      
      // Nettoyer les codes de réinitialisation
      const codesResult = await this.cleanExpiredResetCodes();
      results.resetCodes = codesResult;
      
      // Calculer le total
      const totalArchived = results.notifications.archived + results.pushNotifications.archived;
      const totalDeleted = results.notifications.deleted + results.pushNotifications.deleted + 
                          results.auditLogs.deleted + results.resetCodes.deleted;
      
      console.log('📊 Résumé de l\'archivage:');
      console.log(`   - Notifications archivées: ${results.notifications.archived}`);
      console.log(`   - Notifications supprimées: ${results.notifications.deleted}`);
      console.log(`   - Notifications push archivées: ${results.pushNotifications.archived}`);
      console.log(`   - Notifications push supprimées: ${results.pushNotifications.deleted}`);
      console.log(`   - Logs d'audit supprimés: ${results.auditLogs.deleted}`);
      console.log(`   - Codes de réinitialisation supprimés: ${results.resetCodes.deleted}`);
      console.log(`   - Total archivé: ${totalArchived}`);
      console.log(`   - Total supprimé: ${totalDeleted}`);
      
      return {
        ...results,
        totalArchived,
        totalDeleted,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'archivage complet:', error);
      throw error;
    }
  }
  
  /**
   * Obtenir les statistiques d'archivage
   */
  static async getArchiveStats() {
    try {
      const stats = await Promise.all([
        // Compter les notifications actives
        executeQuery('SELECT COUNT(*) as count FROM notifications'),
        
        // Compter les notifications archivées
        executeQuery('SELECT COUNT(*) as count FROM archived_notifications'),
        
        // Compter les notifications push actives
        executeQuery('SELECT COUNT(*) as count FROM push_notifications'),
        
        // Compter les notifications push archivées
        executeQuery('SELECT COUNT(*) as count FROM archived_push_notifications'),
        
        // Compter les logs d'audit
        executeQuery('SELECT COUNT(*) as count FROM audit_logs'),
        
        // Compter les codes de réinitialisation
        executeQuery('SELECT COUNT(*) as count FROM password_reset_codes')
      ]);
      
      return {
        activeNotifications: stats[0][0].count,
        archivedNotifications: stats[1][0].count,
        activePushNotifications: stats[2][0].count,
        archivedPushNotifications: stats[3][0].count,
        auditLogs: stats[4][0].count,
        resetCodes: stats[5][0].count
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques d\'archivage:', error);
      return {
        activeNotifications: 0,
        archivedNotifications: 0,
        activePushNotifications: 0,
        archivedPushNotifications: 0,
        auditLogs: 0,
        resetCodes: 0
      };
    }
  }
  
  /**
   * Restaurer des notifications archivées (admin seulement)
   */
  static async restoreArchivedNotifications(notificationIds) {
    try {
      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        throw new Error('Liste d\'IDs de notifications invalide');
      }
      
      const placeholders = notificationIds.map(() => '?').join(',');
      
      // Restaurer les notifications
      const restoreSql = `
        INSERT INTO notifications (user_id, title, message, type, read_status, created_at)
        SELECT user_id, title, message, type, read_status, created_at
        FROM archived_notifications 
        WHERE original_id IN (${placeholders})
      `;
      
      const restoreResult = await executeQuery(restoreSql, notificationIds);
      
      // Supprimer les notifications restaurées de l'archive
      const deleteSql = `
        DELETE FROM archived_notifications 
        WHERE original_id IN (${placeholders})
      `;
      
      await executeQuery(deleteSql, notificationIds);
      
      console.log(`✅ ${restoreResult.affectedRows} notifications restaurées`);
      
      return {
        restored: restoreResult.affectedRows
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de la restauration des notifications:', error);
      throw error;
    }
  }
}

module.exports = ArchiveService;
