import { executeQuery, executeTransaction } from '../config/database.js';
import CoupleService from './coupleService.js';
import EggService from './eggService.js';
import PigeonneauService from './pigeonneauService.js';
import HealthService from './healthService.js';
import SaleService from './saleService.js';

export class StatisticsService {
  // Récupérer toutes les statistiques d'un utilisateur
  static async getAllStats(userId) {
    try {
      const [
        coupleStats,
        eggStats,
        pigeonneauStats,
        healthStats,
        saleStats
      ] = await Promise.all([
        CoupleService.getCoupleStats(userId),
        EggService.getEggStats(userId),
        PigeonneauService.getPigeonneauStats(userId),
        HealthService.getHealthStats(userId),
        SaleService.getSaleStats(userId)
      ]);

      return {
        couples: coupleStats,
        eggs: eggStats,
        pigeonneaux: pigeonneauStats,
        health: healthStats,
        sales: saleStats,
        summary: this.calculateSummaryStats(coupleStats, eggStats, pigeonneauStats, healthStats, saleStats)
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // Calculer les statistiques de résumé
  static calculateSummaryStats(coupleStats, eggStats, pigeonneauStats, healthStats, saleStats) {
    const totalAnimals = (coupleStats?.total_couples || 0) + (pigeonneauStats?.total_pigeonneaux || 0);
    const totalValue = (saleStats?.total_amount || 0);
    const successRate = eggStats?.total_eggs > 0 
      ? ((eggStats.successful_hatches / eggStats.total_eggs) * 100).toFixed(1)
      : 0;

    return {
      totalAnimals,
      totalValue: totalValue.toFixed(2),
      successRate: `${successRate}%`,
      activeCouples: coupleStats?.active_couples || 0,
      breedingCouples: coupleStats?.breeding_couples || 0,
      alivePigeonneaux: pigeonneauStats?.alive_pigeonneaux || 0,
      upcomingTreatments: healthStats?.upcoming_treatments || 0
    };
  }

  // Récupérer les statistiques de croissance
  static async getGrowthStats(userId, period = 'year') {
    try {
      let dateFilter = '';
      if (period === 'month') {
        dateFilter = 'AND created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
      } else if (period === 'year') {
        dateFilter = 'AND created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
      }

      // Statistiques des couples par mois
      const couplesByMonth = await executeQuery(`
        SELECT 
          MONTH(created_at) as month,
          COUNT(*) as new_couples
        FROM couples 
        WHERE user_id = ? ${dateFilter}
        GROUP BY MONTH(created_at)
        ORDER BY month
      `, [userId]);

      // Statistiques des pigeonneaux par mois
      const pigeonneauxByMonth = await executeQuery(`
        SELECT 
          MONTH(created_at) as month,
          COUNT(*) as new_pigeonneaux
        FROM pigeonneaux 
        LEFT JOIN couples c ON pigeonneaux.couple_id = c.id
        WHERE c.user_id = ? ${dateFilter}
        GROUP BY MONTH(created_at)
        ORDER BY month
      `, [userId]);

      // Statistiques des ventes par mois
      const salesByMonth = await executeQuery(`
        SELECT 
          MONTH(date) as month,
          COUNT(*) as total_sales,
          SUM(amount) as total_amount
        FROM sales 
        WHERE user_id = ? ${dateFilter}
        GROUP BY MONTH(date)
        ORDER BY month
      `, [userId]);

      return {
        couples: couplesByMonth,
        pigeonneaux: pigeonneauxByMonth,
        sales: salesByMonth
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de croissance:', error);
      throw error;
    }
  }

  // Récupérer les alertes et notifications
  static async getAlerts(userId) {
    try {
      const alerts = [];

      // Traitements en retard
      const overdueTreatments = await executeQuery(`
        SELECT h.*, 
               CASE 
                 WHEN h.target_type = 'couple' THEN c.name
                 WHEN h.target_type = 'pigeonneau' THEN CONCAT('Pigeonneau #', p.id)
                 ELSE 'N/A'
               END as target_name
        FROM health_records h 
        LEFT JOIN couples c ON h.target_type = 'couple' AND h.target_id = c.id
        LEFT JOIN pigeonneaux p ON h.target_type = 'pigeonneau' AND h.target_id = p.id
        WHERE h.user_id = ? AND h.next_due < CURDATE()
        ORDER BY h.next_due ASC
      `, [userId]);

      if (overdueTreatments.length > 0) {
        alerts.push({
          type: 'warning',
          title: 'Traitements en retard',
          message: `${overdueTreatments.length} traitement(s) en retard`,
          count: overdueTreatments.length,
          data: overdueTreatments
        });
      }

      // Traitements à venir (dans les 7 prochains jours)
      const upcomingTreatments = await executeQuery(`
        SELECT h.*, 
               CASE 
                 WHEN h.target_type = 'couple' THEN c.name
                 WHEN h.target_type = 'pigeonneau' THEN CONCAT('Pigeonneau #', p.id)
                 ELSE 'N/A'
               END as target_name
        FROM health_records h 
        LEFT JOIN couples c ON h.target_type = 'couple' AND h.target_id = c.id
        LEFT JOIN pigeonneaux p ON h.target_type = 'pigeonneau' AND h.target_id = p.id
        WHERE h.user_id = ? AND h.next_due BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        ORDER BY h.next_due ASC
      `, [userId]);

      if (upcomingTreatments.length > 0) {
        alerts.push({
          type: 'info',
          title: 'Traitements à venir',
          message: `${upcomingTreatments.length} traitement(s) dans les 7 prochains jours`,
          count: upcomingTreatments.length,
          data: upcomingTreatments
        });
      }

      // Couples en reproduction depuis longtemps
      const longBreedingCouples = await executeQuery(`
        SELECT c.*, DATEDIFF(CURDATE(), c.updated_at) as days_in_reproduction
        FROM couples c 
        WHERE c.user_id = ? AND c.status = 'reproduction' 
        AND DATEDIFF(CURDATE(), c.updated_at) > 30
        ORDER BY c.updated_at ASC
      `, [userId]);

      if (longBreedingCouples.length > 0) {
        alerts.push({
          type: 'info',
          title: 'Couples en reproduction prolongée',
          message: `${longBreedingCouples.length} couple(s) en reproduction depuis plus de 30 jours`,
          count: longBreedingCouples.length,
          data: longBreedingCouples
        });
      }

      return alerts;
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      throw error;
    }
  }

  // Récupérer les performances par race
  static async getBreedPerformance(userId) {
    try {
      const sql = `
        SELECT 
          c.breed,
          COUNT(*) as total_couples,
          COUNT(CASE WHEN c.status = 'reproduction' THEN 1 END) as breeding_couples,
          AVG(DATEDIFF(CURDATE(), c.created_at)) as average_age_days
        FROM couples c 
        WHERE c.user_id = ? AND c.breed IS NOT NULL
        GROUP BY c.breed
        ORDER BY total_couples DESC
      `;
      
      const breedStats = await executeQuery(sql, [userId]);
      return breedStats;
    } catch (error) {
      console.error('Erreur lors de la récupération des performances par race:', error);
      throw error;
    }
  }

  // Récupérer les statistiques financières
  static async getFinancialStats(userId, period = 'all') {
    try {
      let dateFilter = '';
      const params = [userId];
      
      if (period === 'month') {
        dateFilter = 'AND date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
      } else if (period === 'year') {
        dateFilter = 'AND date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
      }
      
      const sql = `
        SELECT 
          SUM(amount) as total_revenue,
          COUNT(*) as total_transactions,
          AVG(amount) as average_transaction,
          MIN(amount) as min_transaction,
          MAX(amount) as max_transaction,
          COUNT(DISTINCT client) as unique_clients
        FROM sales 
        WHERE user_id = ? ${dateFilter}
      `;
      
      const [stats] = await executeQuery(sql, params);
      
      // Ajouter les statistiques des pigeonneaux vendus
      const pigeonneauStats = await executeQuery(`
        SELECT 
          COUNT(*) as total_sold,
          SUM(sale_price) as total_pigeonneau_revenue,
          AVG(sale_price) as average_pigeonneau_price
        FROM pigeonneaux p 
        LEFT JOIN couples c ON p.couple_id = c.id
        WHERE c.user_id = ? AND p.status = 'sold' ${dateFilter.replace('date', 'p.sale_date')}
      `, params);
      
      return {
        sales: stats,
        pigeonneaux: pigeonneauStats[0] || {}
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques financières:', error);
      throw error;
    }
  }
}

export default StatisticsService; 