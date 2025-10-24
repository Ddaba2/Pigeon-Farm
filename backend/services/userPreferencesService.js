const { executeQuery } = require('../config/database.js');

/**
 * Service de gestion des préférences utilisateur pour les notifications
 */
class UserPreferencesService {
  
  /**
   * Récupérer les préférences d'un utilisateur
   */
  static async getUserPreferences(userId) {
    try {
      const sql = `
        SELECT 
          push_notifications,
          email_notifications,
          sms_notifications,
          critical_alerts_only,
          quiet_hours_start,
          quiet_hours_end,
          timezone,
          created_at,
          updated_at
        FROM user_preferences 
        WHERE user_id = ?
      `;
      
      const preferences = await executeQuery(sql, [userId]);
      
      if (preferences.length > 0) {
        return {
          userId: userId,
          pushNotifications: Boolean(preferences[0].push_notifications),
          emailNotifications: Boolean(preferences[0].email_notifications),
          smsNotifications: Boolean(preferences[0].sms_notifications),
          criticalAlertsOnly: Boolean(preferences[0].critical_alerts_only),
          quietHoursStart: preferences[0].quiet_hours_start,
          quietHoursEnd: preferences[0].quiet_hours_end,
          timezone: preferences[0].timezone,
          createdAt: preferences[0].created_at,
          updatedAt: preferences[0].updated_at
        };
      }
      
      // Créer les préférences par défaut si elles n'existent pas
      return await this.createDefaultPreferences(userId);
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des préférences:', error);
      throw error;
    }
  }
  
  /**
   * Créer les préférences par défaut pour un utilisateur
   */
  static async createDefaultPreferences(userId) {
    try {
      const defaultPreferences = {
        userId: userId,
        pushNotifications: true,
        emailNotifications: true,
        smsNotifications: false,
        criticalAlertsOnly: true,
        quietHoursStart: '22:00:00',
        quietHoursEnd: '07:00:00',
        timezone: 'Europe/Paris'
      };
      
      const sql = `
        INSERT INTO user_preferences (
          user_id, push_notifications, email_notifications, sms_notifications,
          critical_alerts_only, quiet_hours_start, quiet_hours_end, timezone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await executeQuery(sql, [
        userId,
        defaultPreferences.pushNotifications,
        defaultPreferences.emailNotifications,
        defaultPreferences.smsNotifications,
        defaultPreferences.criticalAlertsOnly,
        defaultPreferences.quietHoursStart,
        defaultPreferences.quietHoursEnd,
        defaultPreferences.timezone
      ]);
      
      console.log(`✅ Préférences par défaut créées pour l'utilisateur ${userId}`);
      return defaultPreferences;
      
    } catch (error) {
      console.error('❌ Erreur lors de la création des préférences par défaut:', error);
      throw error;
    }
  }
  
  /**
   * Mettre à jour les préférences d'un utilisateur
   */
  static async updateUserPreferences(userId, preferences) {
    try {
      // Vérifier que l'utilisateur existe
      const userCheck = await executeQuery(
        'SELECT id FROM users WHERE id = ?',
        [userId]
      );
      
      if (userCheck.length === 0) {
        throw new Error("Utilisateur non trouvé");
      }
      
      const sql = `
        UPDATE user_preferences 
        SET 
          push_notifications = ?,
          email_notifications = ?,
          sms_notifications = ?,
          critical_alerts_only = ?,
          quiet_hours_start = ?,
          quiet_hours_end = ?,
          timezone = ?,
          updated_at = NOW()
        WHERE user_id = ?
      `;
      
      const result = await executeQuery(sql, [
        preferences.pushNotifications !== undefined ? preferences.pushNotifications : true,
        preferences.emailNotifications !== undefined ? preferences.emailNotifications : true,
        preferences.smsNotifications !== undefined ? preferences.smsNotifications : false,
        preferences.criticalAlertsOnly !== undefined ? preferences.criticalAlertsOnly : true,
        preferences.quietHoursStart || '22:00:00',
        preferences.quietHoursEnd || '07:00:00',
        preferences.timezone || 'Europe/Paris',
        userId
      ]);
      
      if (result.affectedRows === 0) {
        // Créer les préférences si elles n'existent pas
        return await this.createDefaultPreferences(userId);
      }
      
      console.log("✅ Préférences mises à jour pour l'utilisateur " + userId);
      return await this.getUserPreferences(userId);
      
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour des préférences:", error);
      throw error;
    }
  }
  
  /**
   * Vérifier si les notifications sont autorisées selon les préférences
   */
  static async canSendNotification(userId, notificationType, priority = 'medium') {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      // Vérifier si les notifications sont activées pour ce type
      switch (notificationType) {
        case 'push':
          if (!preferences.pushNotifications) return false;
          break;
        case 'email':
          if (!preferences.emailNotifications) return false;
          break;
        case 'sms':
          if (!preferences.smsNotifications) return false;
          break;
        default:
          return false;
      }
      
      // Vérifier si seules les alertes critiques sont autorisées
      if (preferences.criticalAlertsOnly && priority !== 'high') {
        return false;
      }
      
      // Vérifier les heures silencieuses
      if (this.isQuietHours(preferences)) {
        // Autoriser seulement les alertes critiques pendant les heures silencieuses
        return priority === 'high';
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des préférences:', error);
      return false;
    }
  }
  
  /**
   * Vérifier si nous sommes dans les heures silencieuses
   */
  static isQuietHours(preferences) {
    try {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS
      
      const startTime = preferences.quietHoursStart;
      const endTime = preferences.quietHoursEnd;
      
      // Si les heures silencieuses ne traversent pas minuit
      if (startTime <= endTime) {
        return currentTime >= startTime && currentTime <= endTime;
      }
      
      // Si les heures silencieuses traversent minuit (ex: 22:00 - 07:00)
      return currentTime >= startTime || currentTime <= endTime;
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des heures silencieuses:', error);
      return false;
    }
  }
  
  /**
   * Obtenir les statistiques des préférences
   */
  static async getPreferencesStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_users,
          SUM(push_notifications) as push_enabled,
          SUM(email_notifications) as email_enabled,
          SUM(sms_notifications) as sms_enabled,
          SUM(critical_alerts_only) as critical_only_enabled
        FROM user_preferences
      `;
      
      const stats = await executeQuery(sql);
      return stats[0];
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      return {
        total_users: 0,
        push_enabled: 0,
        email_enabled: 0,
        sms_enabled: 0,
        critical_only_enabled: 0
      };
    }
  }
  
  /**
   * Réinitialiser les préférences d'un utilisateur
   */
  static async resetUserPreferences(userId) {
    try {
      const sql = `
        DELETE FROM user_preferences 
        WHERE user_id = ?
      `;
      
      await executeQuery(sql, [userId]);
      
      // Recréer les préférences par défaut
      return await this.createDefaultPreferences(userId);
      
    } catch (error) {
      console.error('❌ Erreur lors de la réinitialisation des préférences:', error);
      throw error;
    }
  }
  
  /**
   * Migrer les préférences d'un utilisateur existant
   */
  static async migrateUserPreferences(userId) {
    try {
      // Vérifier si l'utilisateur a déjà des préférences
      const existingPreferences = await this.getUserPreferences(userId);
      
      if (existingPreferences.createdAt) {
        console.log(`ℹ️ L'utilisateur ${userId} a déjà des préférences`);
        return existingPreferences;
      }
      
      // Créer les préférences par défaut
      return await this.createDefaultPreferences(userId);
      
    } catch (error) {
      console.error('❌ Erreur lors de la migration des préférences:', error);
      throw error;
    }
  }
}

module.exports = UserPreferencesService;
