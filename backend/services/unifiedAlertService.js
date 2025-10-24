const { executeQuery } = require('../config/database.js');
const NotificationService = require('./notificationService.js');
const EmailService = require('./emailService.js');
const PushNotificationService = require('./pushNotificationService.js');

/**
 * Service unifié de gestion des alertes pour PigeonFarm
 * Remplace la logique côté client par une logique serveur centralisée
 */
class UnifiedAlertService {
  
  /**
   * Analyser toutes les données et générer les alertes appropriées
   */
  static async analyzeAndGenerateAlerts(userId) {
    try {
      console.log(`🔍 Analyse des alertes pour l'utilisateur ${userId}...`);
      
      const alerts = [];
      
      // 1. Alertes de santé
      const healthAlerts = await this.checkHealthAlerts(userId);
      alerts.push(...healthAlerts);
      
      // 2. Alertes d'éclosion
      const hatchingAlerts = await this.checkHatchingAlerts(userId);
      alerts.push(...hatchingAlerts);
      
      // 3. Alertes de sevrage
      const weaningAlerts = await this.checkWeaningAlerts(userId);
      alerts.push(...weaningAlerts);
      
      // 4. Alertes de vaccination
      const vaccinationAlerts = await this.checkVaccinationAlerts(userId);
      alerts.push(...vaccinationAlerts);
      
      // 5. Alertes de vente
      const salesAlerts = await this.checkSalesAlerts(userId);
      alerts.push(...salesAlerts);
      
      console.log(`✅ ${alerts.length} alertes générées pour l'utilisateur ${userId}`);
      return alerts;
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse des alertes:', error);
      return [];
    }
  }
  
  /**
   * Vérifier les alertes de santé (soins à venir dans les 7 prochains jours)
   */
  static async checkHealthAlerts(userId) {
    try {
      const sql = `
        SELECT 
          h.id,
          h.type,
          h.targetType,
          h.targetId,
          h.product,
          h.nextDue,
          CASE 
            WHEN h.targetType = 'couple' THEN c.nestNumber
            WHEN h.targetType = 'pigeonneau' THEN CONCAT('Pigeonneau #', p.id)
            ELSE 'Inconnu'
          END as targetName,
          u.email
        FROM healthRecords h
        LEFT JOIN couples c ON h.targetType = 'couple' AND h.targetId = c.id
        LEFT JOIN pigeonneaux p ON h.targetType = 'pigeonneau' AND h.targetId = p.id
        JOIN users u ON u.id = ?
        WHERE h.nextDue IS NOT NULL 
        AND h.nextDue BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        AND (c.user_id = ? OR p.id IN (
          SELECT p2.id FROM pigeonneaux p2 
          JOIN couples c2 ON p2.coupleId = c2.id 
          WHERE c2.user_id = ?
        ))
        ORDER BY h.nextDue ASC
      `;
      
      const healthRecords = await executeQuery(sql, [userId, userId, userId]);
      const alerts = [];
      
      for (const record of healthRecords) {
        const alert = {
          type: 'health',
          priority: 'high',
          title: '🏥 Rappel sanitaire',
          message: `Rappel sanitaire : ${record.type} pour ${record.targetName} prévu le ${new Date(record.nextDue).toLocaleDateString('fr-FR')}`,
          data: {
            healthRecordId: record.id,
            targetType: record.targetType,
            targetId: record.targetId,
            dueDate: record.nextDue
          }
        };
        
        alerts.push(alert);
        
        // Créer une notification
        await NotificationService.createNotification(
          userId,
          alert.title,
          alert.message,
          'health'
        );
        
        // Envoyer une notification push pour les alertes critiques
        await PushNotificationService.sendCriticalAlert(userId, alert);
        
        // Envoyer un email si configuré
        if (record.email) {
          const emailService = new EmailService();
          await emailService.sendHealthAlert(alert.message, record.email);
        }
      }
      
      return alerts;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des alertes de santé:', error);
      return [];
    }
  }
  
  /**
   * Vérifier les alertes d'éclosion (œufs proches d'éclosion)
   */
  static async checkHatchingAlerts(userId) {
    try {
      const sql = `
        SELECT 
          e.id,
          e.coupleId,
          e.egg1Date,
          e.egg2Date,
          e.hatchDate1,
          e.hatchDate2,
          c.nestNumber as coupleName,
          u.email
        FROM eggs e
        JOIN couples c ON e.coupleId = c.id
        JOIN users u ON u.id = ?
        WHERE c.user_id = ?
        AND e.status = 'incubation'
        AND (
          (e.egg1Date IS NOT NULL AND e.hatchDate1 IS NULL AND DATEDIFF(CURDATE(), e.egg1Date) BETWEEN 16 AND 18) OR
          (e.egg2Date IS NOT NULL AND e.hatchDate2 IS NULL AND DATEDIFF(CURDATE(), e.egg2Date) BETWEEN 16 AND 18)
        )
      `;
      
      const eggs = await executeQuery(sql, [userId, userId]);
      const alerts = [];
      
      for (const egg of eggs) {
        const egg1Days = egg.egg1Date ? Math.floor((new Date() - new Date(egg.egg1Date)) / (1000 * 60 * 60 * 24)) : 0;
        const egg2Days = egg.egg2Date ? Math.floor((new Date() - new Date(egg.egg2Date)) / (1000 * 60 * 60 * 24)) : 0;
        
        if (egg.egg1Date && !egg.hatchDate1 && egg1Days >= 16 && egg1Days <= 18) {
          const alert = {
            type: 'hatching',
            priority: 'medium',
            title: '🥚 Éclosion imminente',
            message: `Éclosion imminente : œuf 1 du couple ${egg.coupleName} (pondu le ${new Date(egg.egg1Date).toLocaleDateString('fr-FR')})`,
            data: {
              eggId: egg.id,
              coupleId: egg.coupleId,
              eggNumber: 1,
              daysSinceLaying: egg1Days
            }
          };
          
          alerts.push(alert);
          
          await NotificationService.createNotification(
            userId,
            alert.title,
            alert.message,
            'warning'
          );
          
          // Envoyer une notification push pour les alertes critiques
          await PushNotificationService.sendCriticalAlert(userId, alert);
        }
        
        if (egg.egg2Date && !egg.hatchDate2 && egg2Days >= 16 && egg2Days <= 18) {
          const alert = {
            type: 'hatching',
            priority: 'medium',
            title: '🥚 Éclosion imminente',
            message: `Éclosion imminente : œuf 2 du couple ${egg.coupleName} (pondu le ${new Date(egg.egg2Date).toLocaleDateString('fr-FR')})`,
            data: {
              eggId: egg.id,
              coupleId: egg.coupleId,
              eggNumber: 2,
              daysSinceLaying: egg2Days
            }
          };
          
          alerts.push(alert);
          
          await NotificationService.createNotification(
            userId,
            alert.title,
            alert.message,
            'warning'
          );
          
          // Envoyer une notification push pour les alertes critiques
          await PushNotificationService.sendCriticalAlert(userId, alert);
        }
      }
      
      return alerts;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des alertes d\'éclosion:', error);
      return [];
    }
  }
  
  /**
   * Vérifier les alertes de sevrage (pigeonneaux à sevrer)
   */
  static async checkWeaningAlerts(userId) {
    try {
      const sql = `
        SELECT 
          p.id,
          p.birthDate,
          p.weaningDate,
          p.status,
          c.nestNumber as coupleName,
          u.email
        FROM pigeonneaux p
        JOIN couples c ON p.coupleId = c.id
        JOIN users u ON u.id = ?
        WHERE c.user_id = ?
        AND p.status = 'alive'
        AND p.weaningDate IS NULL
        AND DATEDIFF(CURDATE(), p.birthDate) >= 28
      `;
      
      const pigeonneaux = await executeQuery(sql, [userId, userId]);
      const alerts = [];
      
      for (const pigeonneau of pigeonneaux) {
        const age = Math.floor((new Date() - new Date(pigeonneau.birthDate)) / (1000 * 60 * 60 * 24));
        
        const alert = {
          type: 'weaning',
          priority: 'medium',
          title: '🍼 Sevrage à prévoir',
          message: `Sevrage à prévoir : pigeonneau #${pigeonneau.id} du couple ${pigeonneau.coupleName} (né le ${new Date(pigeonneau.birthDate).toLocaleDateString('fr-FR')}, âgé de ${age} jours)`,
          data: {
            pigeonneauId: pigeonneau.id,
            coupleId: pigeonneau.coupleId,
            age: age,
            birthDate: pigeonneau.birthDate
          }
        };
        
        alerts.push(alert);
        
        await NotificationService.createNotification(
          userId,
          alert.title,
          alert.message,
          'info'
        );
      }
      
      return alerts;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des alertes de sevrage:', error);
      return [];
    }
  }
  
  /**
   * Vérifier les alertes de vaccination (vaccinations en retard)
   */
  static async checkVaccinationAlerts(userId) {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const targetDate = sixMonthsAgo.toISOString().split('T')[0];
      
      const sql = `
        SELECT DISTINCT
          c.id as coupleId,
          c.nestNumber as coupleName,
          u.email
        FROM couples c
        JOIN users u ON u.id = ?
        WHERE c.user_id = ?
        AND c.status = 'active'
        AND c.id NOT IN (
          SELECT DISTINCT targetId 
          FROM healthRecords 
          WHERE targetType = 'couple' 
          AND type = 'vaccination' 
          AND date > ?
        )
      `;
      
      const couples = await executeQuery(sql, [userId, userId, targetDate]);
      const alerts = [];
      
      for (const couple of couples) {
        const alert = {
          type: 'vaccination',
          priority: 'high',
          title: '💉 Vaccination requise',
          message: `Le couple ${couple.coupleName} doit être vacciné (dernière vaccination il y a plus de 6 mois)`,
          data: {
            coupleId: couple.coupleId,
            coupleName: couple.coupleName,
            lastVaccination: targetDate
          }
        };
        
        alerts.push(alert);
        
        await NotificationService.createNotification(
          userId,
          alert.title,
          alert.message,
          'warning'
        );
      }
      
      return alerts;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des alertes de vaccination:', error);
      return [];
    }
  }
  
  /**
   * Vérifier les alertes de vente (pigeonneaux à vendre)
   */
  static async checkSalesAlerts(userId) {
    try {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      const targetDate = twoMonthsAgo.toISOString().split('T')[0];
      
      const sql = `
        SELECT 
          p.id,
          p.birthDate,
          c.nestNumber as coupleName,
          u.email
        FROM pigeonneaux p
        JOIN couples c ON p.coupleId = c.id
        JOIN users u ON u.id = ?
        WHERE c.user_id = ?
        AND p.status = 'alive'
        AND DATE(p.birthDate) < ?
        AND p.id NOT IN (
          SELECT targetId FROM sales WHERE targetType = 'pigeonneau'
        )
      `;
      
      const pigeonneaux = await executeQuery(sql, [userId, userId, targetDate]);
      const alerts = [];
      
      for (const pigeonneau of pigeonneaux) {
        const age = Math.floor((new Date() - new Date(pigeonneau.birthDate)) / (1000 * 60 * 60 * 24));
        
        const alert = {
          type: 'sales',
          priority: 'low',
          title: '💰 Pigeonneau à vendre',
          message: `Le pigeonneau #${pigeonneau.id} du couple ${pigeonneau.coupleName} a plus de 2 mois (${age} jours) et pourrait être vendu`,
          data: {
            pigeonneauId: pigeonneau.id,
            coupleId: pigeonneau.coupleId,
            age: age,
            birthDate: pigeonneau.birthDate
          }
        };
        
        alerts.push(alert);
        
        await NotificationService.createNotification(
          userId,
          alert.title,
          alert.message,
          'info'
        );
      }
      
      return alerts;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des alertes de vente:', error);
      return [];
    }
  }
  
  /**
   * Exécuter l'analyse des alertes pour tous les utilisateurs
   */
  static async runGlobalAlertAnalysis() {
    try {
      console.log('🚀 Démarrage de l\'analyse globale des alertes...');
      
      // Récupérer tous les utilisateurs actifs
      const users = await executeQuery(`
        SELECT id, username, email 
        FROM users 
        WHERE status = 'active'
      `);
      
      const results = {
        totalUsers: users.length,
        totalAlerts: 0,
        alertsByType: {
          health: 0,
          hatching: 0,
          weaning: 0,
          vaccination: 0,
          sales: 0
        }
      };
      
      for (const user of users) {
        const userAlerts = await this.analyzeAndGenerateAlerts(user.id);
        results.totalAlerts += userAlerts.length;
        
        // Compter par type
        userAlerts.forEach(alert => {
          if (results.alertsByType[alert.type]) {
            results.alertsByType[alert.type]++;
          }
        });
      }
      
      console.log('📊 Résumé de l\'analyse globale:');
      console.log(`   - Utilisateurs analysés: ${results.totalUsers}`);
      console.log(`   - Total d'alertes générées: ${results.totalAlerts}`);
      console.log(`   - Alertes de santé: ${results.alertsByType.health}`);
      console.log(`   - Alertes d'éclosion: ${results.alertsByType.hatching}`);
      console.log(`   - Alertes de sevrage: ${results.alertsByType.weaning}`);
      console.log(`   - Alertes de vaccination: ${results.alertsByType.vaccination}`);
      console.log(`   - Alertes de vente: ${results.alertsByType.sales}`);
      
      return results;
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse globale des alertes:', error);
      return null;
    }
  }
  
  /**
   * Obtenir les alertes pour un utilisateur spécifique (pour le dashboard)
   */
  static async getUserAlerts(userId) {
    try {
      return await this.analyzeAndGenerateAlerts(userId);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des alertes utilisateur:', error);
      return [];
    }
  }
}

module.exports = UnifiedAlertService;
