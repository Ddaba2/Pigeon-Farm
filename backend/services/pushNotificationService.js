const { executeQuery } = require('../config/database.js');

/**
 * Service de notifications push pour les alertes critiques
 * Utilise l'API Web Notifications du navigateur
 */
class PushNotificationService {
  
  /**
   * Envoyer une notification push pour une alerte critique
   */
  static async sendCriticalAlert(userId, alert) {
    try {
      console.log(`🔔 Envoi de notification push critique pour l'utilisateur ${userId}`);
      
      // Vérifier si l'utilisateur a activé les notifications push
      const userPreferences = await this.getUserNotificationPreferences(userId);
      
      if (!userPreferences.pushNotifications) {
        console.log(`📵 Notifications push désactivées pour l'utilisateur ${userId}`);
        return false;
      }
      
      // Déterminer si l'alerte est critique
      const isCritical = this.isCriticalAlert(alert);
      
      if (!isCritical) {
        console.log(`ℹ️ Alerte non critique, pas de notification push`);
        return false;
      }
      
      // Créer la notification push
      const notification = {
        userId: userId,
        title: alert.title,
        message: alert.message,
        type: alert.type,
        priority: alert.priority,
        data: alert.data,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      
      // Enregistrer la notification push
      const notificationId = await this.savePushNotification(notification);
      
      // Marquer comme envoyée
      await this.markNotificationAsSent(notificationId);
      
      console.log(`✅ Notification push critique envoyée (ID: ${notificationId})`);
      return true;
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la notification push:', error);
      return false;
    }
  }
  
  /**
   * Déterminer si une alerte est critique et nécessite une notification push
   */
  static isCriticalAlert(alert) {
    // Alertes de santé avec priorité haute
    if (alert.type === 'health' && alert.priority === 'high') {
      return true;
    }
    
    // Alertes de vaccination en retard
    if (alert.type === 'vaccination' && alert.priority === 'high') {
      return true;
    }
    
    // Alertes d'éclosion imminente (dans les 24h)
    if (alert.type === 'hatching' && alert.data && alert.data.daysSinceLaying >= 17) {
      return true;
    }
    
    // Alertes de santé urgentes (dans les 24h)
    if (alert.type === 'health' && alert.data && alert.data.dueDate) {
      const dueDate = new Date(alert.data.dueDate);
      const now = new Date();
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilDue <= 24) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Récupérer les préférences de notification d'un utilisateur
   */
  static async getUserNotificationPreferences(userId) {
    try {
      const sql = `
        SELECT 
          push_notifications,
          email_notifications,
          sms_notifications,
          critical_alerts_only
        FROM user_notification_preferences 
        WHERE user_id = ?
      `;
      
      const preferences = await executeQuery(sql, [userId]);
      
      if (preferences.length > 0) {
        return {
          pushNotifications: preferences[0].push_notifications,
          emailNotifications: preferences[0].email_notifications,
          smsNotifications: preferences[0].sms_notifications,
          criticalAlertsOnly: preferences[0].critical_alerts_only
        };
      }
      
      // Préférences par défaut
      return {
        pushNotifications: true,
        emailNotifications: true,
        smsNotifications: false,
        criticalAlertsOnly: true
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des préférences:', error);
      return {
        pushNotifications: true,
        emailNotifications: true,
        smsNotifications: false,
        criticalAlertsOnly: true
      };
    }
  }
  
  /**
   * Enregistrer une notification push
   */
  static async savePushNotification(notification) {
    try {
      const sql = `
        INSERT INTO push_notifications (
          user_id, title, message, type, priority, 
          data, timestamp, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const result = await executeQuery(sql, [
        notification.userId,
        notification.title,
        notification.message,
        notification.type,
        notification.priority,
        JSON.stringify(notification.data),
        notification.timestamp,
        notification.status
      ]);
      
      return result.insertId;
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de la notification push:', error);
      throw error;
    }
  }
  
  /**
   * Marquer une notification comme envoyée
   */
  static async markNotificationAsSent(notificationId) {
    try {
      const sql = `
        UPDATE push_notifications 
        SET status = 'sent', sent_at = NOW()
        WHERE id = ?
      `;
      
      await executeQuery(sql, [notificationId]);
      
    } catch (error) {
      console.error('❌ Erreur lors du marquage de la notification:', error);
      throw error;
    }
  }
  
  /**
   * Récupérer les notifications push en attente pour un utilisateur
   */
  static async getPendingPushNotifications(userId) {
    try {
      const sql = `
        SELECT id, title, message, type, priority, data, timestamp
        FROM push_notifications 
        WHERE user_id = ? AND status = 'pending'
        ORDER BY timestamp DESC
        LIMIT 10
      `;
      
      const notifications = await executeQuery(sql, [userId]);
      
      return notifications.map(notif => ({
        id: notif.id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        priority: notif.priority,
        data: JSON.parse(notif.data || '{}'),
        timestamp: notif.timestamp
      }));
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des notifications en attente:', error);
      return [];
    }
  }
  
  /**
   * Marquer une notification comme lue
   */
  static async markNotificationAsRead(notificationId, userId) {
    try {
      const sql = `
        UPDATE push_notifications 
        SET status = 'read', read_at = NOW()
        WHERE id = ? AND user_id = ?
      `;
      
      const result = await executeQuery(sql, [notificationId, userId]);
      return result.affectedRows > 0;
      
    } catch (error) {
      console.error('❌ Erreur lors du marquage de la notification comme lue:', error);
      return false;
    }
  }
  
  /**
   * Nettoyer les anciennes notifications push
   */
  static async cleanupOldNotifications() {
    try {
      // Supprimer les notifications lues de plus de 30 jours
      const sql = `
        DELETE FROM push_notifications 
        WHERE status = 'read' 
        AND read_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
      `;
      
      const result = await executeQuery(sql);
      console.log(`🧹 ${result.affectedRows} anciennes notifications push supprimées`);
      
      return result.affectedRows;
      
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des notifications:', error);
      return 0;
    }
  }
  
  /**
   * Obtenir les statistiques des notifications push
   */
  static async getPushNotificationStats(userId = null) {
    try {
      let sql = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
          SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read,
          SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as critical
        FROM push_notifications
      `;
      
      const params = [];
      if (userId) {
        sql += ' WHERE user_id = ?';
        params.push(userId);
      }
      
      const stats = await executeQuery(sql, params);
      return stats[0];
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      return {
        total: 0,
        pending: 0,
        sent: 0,
        read: 0,
        critical: 0
      };
    }
  }
}

module.exports = PushNotificationService;
