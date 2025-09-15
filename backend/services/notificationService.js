const { executeQuery } = require('../config/database.js');

class NotificationService {
  // Récupérer toutes les notifications d'un utilisateur
  static async getUserNotifications(userId, limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT id, user_id, title, message, type, is_read, created_at, updated_at
        FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;
      const notifications = await executeQuery(sql, [userId, limit, offset]);
      return notifications;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  }

  // Récupérer les notifications non lues d'un utilisateur
  static async getUnreadNotifications(userId) {
    try {
      const sql = `
        SELECT id, user_id, title, message, type, is_read, created_at, updated_at
        FROM notifications 
        WHERE user_id = ? AND is_read = FALSE
        ORDER BY created_at DESC
      `;
      const notifications = await executeQuery(sql, [userId]);
      return notifications;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications non lues:', error);
      throw error;
    }
  }

  // Compter les notifications non lues
  static async getUnreadCount(userId) {
    try {
      const sql = `
        SELECT COUNT(*) as count
        FROM notifications 
        WHERE user_id = ? AND is_read = FALSE
      `;
      const result = await executeQuery(sql, [userId]);
      return result[0].count;
    } catch (error) {
      console.error('Erreur lors du comptage des notifications non lues:', error);
      throw error;
    }
  }

  // Marquer une notification comme lue
  static async markAsRead(notificationId, userId) {
    try {
      const sql = `
        UPDATE notifications 
        SET is_read = TRUE, updated_at = NOW()
        WHERE id = ? AND user_id = ?
      `;
      const result = await executeQuery(sql, [notificationId, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
      throw error;
    }
  }

  // Marquer toutes les notifications comme lues
  static async markAllAsRead(userId) {
    try {
      const sql = `
        UPDATE notifications 
        SET is_read = TRUE, updated_at = NOW()
        WHERE user_id = ? AND is_read = FALSE
      `;
      const result = await executeQuery(sql, [userId]);
      return result.affectedRows;
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
      throw error;
    }
  }

  // Créer une nouvelle notification
  static async createNotification(userId, title, message, type = 'info') {
    try {
      const sql = `
        INSERT INTO notifications (user_id, title, message, type, is_read)
        VALUES (?, ?, ?, ?, FALSE)
      `;
      const result = await executeQuery(sql, [userId, title, message, type]);
      return result.insertId;
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error;
    }
  }

  // Supprimer une notification
  static async deleteNotification(notificationId, userId) {
    try {
      const sql = `
        DELETE FROM notifications 
        WHERE id = ? AND user_id = ?
      `;
      const result = await executeQuery(sql, [notificationId, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      throw error;
    }
  }

  // Supprimer toutes les notifications lues
  static async deleteReadNotifications(userId) {
    try {
      const sql = `
        DELETE FROM notifications 
        WHERE user_id = ? AND is_read = TRUE
      `;
      const result = await executeQuery(sql, [userId]);
      return result.affectedRows;
    } catch (error) {
      console.error('Erreur lors de la suppression des notifications lues:', error);
      throw error;
    }
  }

  // Créer des notifications automatiques
  static async createSystemNotifications(userId) {
    try {
      const systemNotifications = [
        {
          title: 'Bienvenue sur PigeonFarm',
          message: 'Bienvenue dans votre tableau de bord PigeonFarm ! Explorez toutes les fonctionnalités disponibles.',
          type: 'info'
        },
        {
          title: 'Nouvelle mise à jour disponible',
          message: 'Une nouvelle version de PigeonFarm est disponible avec des améliorations de sécurité et de performance.',
          type: 'update'
        }
      ];

      for (const notification of systemNotifications) {
        await this.createNotification(userId, notification.title, notification.message, notification.type);
      }

      return systemNotifications.length;
    } catch (error) {
      console.error('Erreur lors de la création des notifications système:', error);
      throw error;
    }
  }

  // Créer une notification de santé
  static async createHealthNotification(userId, pigeonId, message) {
    try {
      const title = `Alerte santé - Pigeon #${pigeonId}`;
      return await this.createNotification(userId, title, message, 'health');
    } catch (error) {
      console.error('Erreur lors de la création de la notification de santé:', error);
      throw error;
    }
  }

  // Créer une notification de mise à jour
  static async createUpdateNotification(userId, version, features) {
    try {
      const title = `Mise à jour ${version} disponible`;
      const message = `Nouvelle version disponible avec les fonctionnalités suivantes: ${features.join(', ')}`;
      return await this.createNotification(userId, title, message, 'update');
    } catch (error) {
      console.error('Erreur lors de la création de la notification de mise à jour:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
