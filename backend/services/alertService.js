const { executeQuery } = require('../config/database.js');
const NotificationService = require('./notificationService.js');

/**
 * Service de gestion des alertes automatiques pour PigeonFarm
 */
class AlertService {
  
  /**
   * Vérifier les éclosions imminentes (3 jours avant)
   */
  static async checkHatchingAlerts() {
    try {
      console.log('🔍 Vérification des éclosions imminentes...');
      
      // Calculer la date dans 3 jours
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      const targetDate = threeDaysFromNow.toISOString().split('T')[0];
      
      // Rechercher les œufs qui devraient éclore dans 3 jours
      const sql = `
        SELECT 
          e.id,
          e.coupleId,
          e.egg1Date,
          e.hatchDate1,
          e.egg2Date,
          e.hatchDate2,
          c.name as coupleName,
          u.id as userId,
          u.username
        FROM eggs e
        JOIN couples c ON e.coupleId = c.id
        JOIN users u ON c.user_id = u.id
        WHERE e.status = 'incubation'
        AND (
          (e.hatchDate1 IS NOT NULL AND DATE(e.hatchDate1) = ?) OR
          (e.hatchDate2 IS NOT NULL AND DATE(e.hatchDate2) = ?)
        )
      `;
      
      const eggs = await executeQuery(sql, [targetDate, targetDate]);
      
      for (const egg of eggs) {
        // Créer une notification pour l'éclosion imminente
        await NotificationService.createNotification(
          egg.userId,
          '🐣 Éclosion imminente !',
          `Les œufs du couple ${egg.coupleName} devraient éclore dans 3 jours.`,
          'warning',
          {
            type: 'hatching_soon',
            eggId: egg.id,
            coupleId: egg.coupleId,
            coupleName: egg.coupleName
          }
        );
        
        console.log(`📢 Alerte éclosion créée pour le couple ${egg.coupleName} (utilisateur ${egg.username})`);
      }
      
      console.log(`✅ ${eggs.length} alertes d'éclosion imminente créées`);
      return eggs.length;
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des éclosions imminentes:', error);
      return 0;
    }
  }
  
  /**
   * Vérifier les vaccinations en retard
   */
  static async checkVaccinationAlerts() {
    try {
      console.log('🔍 Vérification des vaccinations en retard...');
      
      // Rechercher les pigeons qui n'ont pas été vaccinés depuis plus de 6 mois
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const targetDate = sixMonthsAgo.toISOString().split('T')[0];
      
      const sql = `
        SELECT DISTINCT
          c.id as coupleId,
          c.name as coupleName,
          c.user_id as userId,
          u.username
        FROM couples c
        JOIN users u ON c.user_id = u.id
        WHERE c.status = 'active'
        AND c.id NOT IN (
          SELECT DISTINCT target_id 
          FROM health_records 
          WHERE target_type = 'couple' 
          AND record_type = 'vaccination' 
          AND date > ?
        )
      `;
      
      const couples = await executeQuery(sql, [targetDate]);
      
      for (const couple of couples) {
        // Créer une notification pour la vaccination en retard
        await NotificationService.createNotification(
          couple.userId,
          '💉 Vaccination requise',
          `Le couple ${couple.coupleName} doit être vacciné (dernière vaccination il y a plus de 6 mois).`,
          'warning',
          {
            type: 'vaccination_due',
            coupleId: couple.coupleId,
            coupleName: couple.coupleName
          }
        );
        
        console.log(`📢 Alerte vaccination créée pour le couple ${couple.coupleName} (utilisateur ${couple.username})`);
      }
      
      console.log(`✅ ${couples.length} alertes de vaccination créées`);
      return couples.length;
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des vaccinations:', error);
      return 0;
    }
  }
  
  /**
   * Vérifier les œufs en incubation depuis trop longtemps
   */
  static async checkOverdueEggs() {
    try {
      console.log('🔍 Vérification des œufs en retard...');
      
      // Rechercher les œufs en incubation depuis plus de 25 jours
      const twentyFiveDaysAgo = new Date();
      twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25);
      const targetDate = twentyFiveDaysAgo.toISOString().split('T')[0];
      
      const sql = `
        SELECT 
          e.id,
          e.coupleId,
          e.egg1Date,
          e.egg2Date,
          c.name as coupleName,
          c.user_id as userId,
          u.username
        FROM eggs e
        JOIN couples c ON e.coupleId = c.id
        JOIN users u ON c.user_id = u.id
        WHERE e.status = 'incubation'
        AND (
          (e.egg1Date IS NOT NULL AND DATE(e.egg1Date) < ?) OR
          (e.egg2Date IS NOT NULL AND DATE(e.egg2Date) < ?)
        )
      `;
      
      const eggs = await executeQuery(sql, [targetDate, targetDate]);
      
      for (const egg of eggs) {
        // Créer une notification pour les œufs en retard
        await NotificationService.createNotification(
          egg.userId,
          '⚠️ Œufs en retard',
          `Les œufs du couple ${egg.coupleName} sont en incubation depuis plus de 25 jours. Vérifiez leur état.`,
          'warning',
          {
            type: 'overdue_eggs',
            eggId: egg.id,
            coupleId: egg.coupleId,
            coupleName: egg.coupleName
          }
        );
        
        console.log(`📢 Alerte œufs en retard créée pour le couple ${egg.coupleName} (utilisateur ${egg.username})`);
      }
      
      console.log(`✅ ${eggs.length} alertes d'œufs en retard créées`);
      return eggs.length;
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des œufs en retard:', error);
      return 0;
    }
  }
  
  /**
   * Vérifier les pigeonneaux à vendre
   */
  static async checkPigeonneauxForSale() {
    try {
      console.log('🔍 Vérification des pigeonneaux à vendre...');
      
      // Rechercher les pigeonneaux actifs de plus de 2 mois qui ne sont pas vendus
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      const targetDate = twoMonthsAgo.toISOString().split('T')[0];
      
      const sql = `
        SELECT 
          p.id,
          p.coupleId,
          p.birthDate,
          c.name as coupleName,
          c.user_id as userId,
          u.username
        FROM pigeonneaux p
        JOIN couples c ON p.coupleId = c.id
        JOIN users u ON c.user_id = u.id
        WHERE p.status = 'active'
        AND DATE(p.birthDate) < ?
        AND p.id NOT IN (
          SELECT target_id FROM sales WHERE target_type = 'pigeonneau'
        )
      `;
      
      const pigeonneaux = await executeQuery(sql, [targetDate]);
      
      for (const pigeonneau of pigeonneaux) {
        // Créer une notification pour les pigeonneaux à vendre
        await NotificationService.createNotification(
          pigeonneau.userId,
          '💰 Pigeonneau à vendre',
          `Le pigeonneau du couple ${pigeonneau.coupleName} a plus de 2 mois et pourrait être vendu.`,
          'info',
          {
            type: 'pigeonneau_for_sale',
            pigeonneauId: pigeonneau.id,
            coupleId: pigeonneau.coupleId,
            coupleName: pigeonneau.coupleName
          }
        );
        
        console.log(`📢 Alerte pigeonneau à vendre créée pour le couple ${pigeonneau.coupleName} (utilisateur ${pigeonneau.username})`);
      }
      
      console.log(`✅ ${pigeonneaux.length} alertes de pigeonneaux à vendre créées`);
      return pigeonneaux.length;
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des pigeonneaux à vendre:', error);
      return 0;
    }
  }
  
  /**
   * Exécuter toutes les vérifications d'alertes
   */
  static async runAllAlerts() {
    try {
      console.log('🚀 Démarrage des vérifications d\'alertes automatiques...');
      
      const results = {
        hatchingAlerts: 0,
        vaccinationAlerts: 0,
        overdueEggs: 0,
        pigeonneauxForSale: 0
      };
      
      // Exécuter toutes les vérifications
      results.hatchingAlerts = await this.checkHatchingAlerts();
      results.vaccinationAlerts = await this.checkVaccinationAlerts();
      results.overdueEggs = await this.checkOverdueEggs();
      results.pigeonneauxForSale = await this.checkPigeonneauxForSale();
      
      const totalAlerts = Object.values(results).reduce((sum, count) => sum + count, 0);
      
      console.log('📊 Résumé des alertes:');
      console.log(`   - Éclosions imminentes: ${results.hatchingAlerts}`);
      console.log(`   - Vaccinations en retard: ${results.vaccinationAlerts}`);
      console.log(`   - Œufs en retard: ${results.overdueEggs}`);
      console.log(`   - Pigeonneaux à vendre: ${results.pigeonneauxForSale}`);
      console.log(`   - Total: ${totalAlerts} alertes créées`);
      
      return results;
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution des alertes:', error);
      return null;
    }
  }
  
  /**
   * Créer une alerte personnalisée
   */
  static async createCustomAlert(userId, title, message, type = 'info', data = {}) {
    try {
      await NotificationService.createNotification(
        userId,
        title,
        message,
        type,
        data
      );
      
      console.log(`📢 Alerte personnalisée créée pour l'utilisateur ${userId}: ${title}`);
      return true;
      
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'alerte personnalisée:', error);
      return false;
    }
  }
}

module.exports = AlertService;
