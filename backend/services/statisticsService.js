const { executeQuery } = require('../config/database');

class StatisticsService {
  // Récupérer les statistiques du tableau de bord
  async getDashboardStats() {
    try {
      // Compter les couples
      const couplesCount = await executeQuery('SELECT COUNT(*) as total FROM couples');
      
      // Compter les œufs
      const eggsCount = await executeQuery('SELECT COUNT(*) as total FROM eggs');
      
      // Compter les pigeonneaux
      const pigeonneauxCount = await executeQuery('SELECT COUNT(*) as total FROM pigeonneaux');
      
      // Compter les enregistrements de santé
      const healthCount = await executeQuery('SELECT COUNT(*) as total FROM healthRecords');
      
      // Compter les ventes
      const salesCount = await executeQuery('SELECT COUNT(*) as total FROM sales');
      const salesRevenue = await executeQuery('SELECT SUM(amount) as total FROM sales');
      
      // Compter les couples par statut
      const couplesByStatus = await executeQuery(`
        SELECT 
          status,
          COUNT(*) as count
        FROM couples 
        GROUP BY status
      `);
      
      // Compter les œufs par succès
      const eggsBySuccess = await executeQuery(`
        SELECT 
          CASE 
            WHEN success1 = 1 AND success2 = 1 THEN 'success'
            WHEN success1 = 0 AND success2 = 0 THEN 'failed'
            ELSE 'partial'
          END as status,
          COUNT(*) as count
        FROM eggs
        GROUP BY 
          CASE 
            WHEN success1 = 1 AND success2 = 1 THEN 'success'
            WHEN success1 = 0 AND success2 = 0 THEN 'failed'
            ELSE 'partial'
          END
      `);
      
      // Compter les pigeonneaux par statut
      const pigeonneauxByStatus = await executeQuery(`
        SELECT 
          status,
          COUNT(*) as count
        FROM pigeonneaux
        GROUP BY status
      `);
      
      // Compter les enregistrements de santé par type
      const healthByType = await executeQuery(`
        SELECT 
          type,
          COUNT(*) as count
        FROM healthRecords
        GROUP BY type
      `);
      
      // Activités récentes (derniers enregistrements)
      const recentActivities = await executeQuery(`
        (SELECT 'couple' as type, nestNumber as description, created_at as date, id, 'Users' as icon
         FROM couples
         ORDER BY created_at DESC
         LIMIT 2)
        UNION ALL
        (SELECT 'egg' as type, CONCAT('Œufs pour couple #', coupleId) as description, createdAt as date, id, 'FileText' as icon
         FROM eggs
         ORDER BY createdAt DESC
         LIMIT 2)
        UNION ALL
        (SELECT 'pigeonneau' as type, CONCAT('Pigeonneau #', id) as description, created_at as date, id, 'Activity' as icon
         FROM pigeonneaux
         ORDER BY created_at DESC
         LIMIT 2)
        UNION ALL
        (SELECT 'health' as type, CONCAT(type, ' - ', product) as description, created_at as date, id, 'Heart' as icon
         FROM healthRecords
         ORDER BY created_at DESC
         LIMIT 2)
        UNION ALL
        (SELECT 'sale' as type, CONCAT('Vente - ', client, ' (', amount, ' XOF)') as description, date as date, id, 'DollarSign' as icon
         FROM sales
         ORDER BY date DESC, created_at DESC
         LIMIT 2)
        ORDER BY date DESC
        LIMIT 10
      `);
      
      return {
        totalCouples: couplesCount[0].total,
        totalEggs: eggsCount[0].total,
        totalPigeonneaux: pigeonneauxCount[0].total,
        totalHealthRecords: healthCount[0].total,
        totalSales: salesCount[0].total,
        totalRevenue: salesRevenue[0].total || 0,
        couplesByStatus,
        eggsBySuccess,
        pigeonneauxByStatus,
        healthByType,
        recentActivities
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques du tableau de bord: ${error.message}`);
    }
  }

  // Récupérer les statistiques détaillées
  async getDetailedStats() {
    try {
      // Statistiques des couples
      const couplesStats = await executeQuery(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'reproduction' THEN 1 ELSE 0 END) as reproduction,
          SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
        FROM couples
      `);
      
      // Statistiques des œufs
      const eggsStats = await executeQuery(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN success1 = 1 THEN 1 ELSE 0 END) as success1_count,
          SUM(CASE WHEN success2 = 1 THEN 1 ELSE 0 END) as success2_count,
          SUM(CASE WHEN success1 = 0 AND success2 = 0 THEN 1 ELSE 0 END) as failed_count
        FROM eggs
      `);
      
      // Statistiques des pigeonneaux
      const pigeonneauxStats = await executeQuery(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold,
          SUM(CASE WHEN status = 'deceased' THEN 1 ELSE 0 END) as deceased,
          SUM(CASE WHEN sex = 'male' THEN 1 ELSE 0 END) as male,
          SUM(CASE WHEN sex = 'female' THEN 1 ELSE 0 END) as female,
          SUM(CASE WHEN sex = 'unknown' THEN 1 ELSE 0 END) as unknown
        FROM pigeonneaux
      `);
      
      // Statistiques des ventes
      const salesStats = await executeQuery(`
        SELECT 
          COUNT(*) as total,
          SUM(amount) as totalRevenue,
          AVG(amount) as averagePrice,
          MAX(amount) as maxPrice,
          MIN(amount) as minPrice
        FROM sales
      `);
      
      // Statistiques de santé
      const healthStats = await executeQuery(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN type = 'vaccination' THEN 1 ELSE 0 END) as vaccinations,
          SUM(CASE WHEN type = 'traitement' THEN 1 ELSE 0 END) as treatments,
          SUM(CASE WHEN type = 'exam' OR type = 'examen' THEN 1 ELSE 0 END) as exams
        FROM healthRecords
      `);
      
      // Évolution mensuelle (6 derniers mois)
      const monthlyEvolution = await executeQuery(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as count
        FROM (
          SELECT created_at FROM couples
          UNION ALL
          SELECT createdAt FROM eggs
          UNION ALL
          SELECT created_at FROM pigeonneaux
          UNION ALL
          SELECT created_at FROM healthRecords
        ) as all_records
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
      `);
      
      return {
        couples: couplesStats[0],
        eggs: {
          ...eggsStats[0],
          success1Rate: eggsStats[0].total > 0 ? Math.round((eggsStats[0].success1_count / eggsStats[0].total) * 100 * 100) / 100 : 0,
          success2Rate: eggsStats[0].total > 0 ? Math.round((eggsStats[0].success2_count / eggsStats[0].total) * 100 * 100) / 100 : 0
        },
        pigeonneaux: pigeonneauxStats[0],
        sales: salesStats[0],
        health: healthStats[0],
        monthlyEvolution
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques détaillées: ${error.message}`);
    }
  }

  // Récupérer les statistiques par utilisateur
  async getStatsByUser(userId) {
    try {
      console.log('🔍 Calcul des statistiques pour utilisateur ID:', userId);
      
      // Couples de l'utilisateur
      const couplesCount = await executeQuery('SELECT COUNT(*) as total FROM couples WHERE user_id = ?', [userId]);
      
      // Œufs des couples de l'utilisateur
      const eggsCount = await executeQuery(`
        SELECT COUNT(*) as total 
        FROM eggs e 
        JOIN couples c ON e.coupleId = c.id
        WHERE c.user_id = ?
      `, [userId]);
      
      // Pigeonneaux des couples de l'utilisateur
      const pigeonneauxCount = await executeQuery(`
        SELECT COUNT(*) as total 
        FROM pigeonneaux p
        JOIN couples c ON p.coupleId = c.id
        WHERE c.user_id = ? 
      `, [userId]);
      
      // Enregistrements de santé des couples de l'utilisateur
      const healthCount = await executeQuery(`
        SELECT COUNT(*) as total 
        FROM healthRecords h
        JOIN couples c ON h.targetType = 'couple' AND h.targetId = c.id
        WHERE c.user_id = ?
      `, [userId]);
      
      // Ventes de l'utilisateur
      const salesCount = await executeQuery('SELECT COUNT(*) as total FROM sales WHERE user_id = ?', [userId]);
      const salesRevenue = await executeQuery('SELECT SUM(amount) as total FROM sales WHERE user_id = ?', [userId]);
      
      const stats = {
        totalCouples: couplesCount[0]?.total || 0,
        totalEggs: eggsCount[0]?.total || 0,
        totalPigeonneaux: pigeonneauxCount[0]?.total || 0,
        totalHealthRecords: healthCount[0]?.total || 0,
        totalSales: salesCount[0]?.total || 0,
        totalRevenue: salesRevenue[0]?.total || 0
      };
      
      console.log('🔍 Statistiques calculées:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques utilisateur:', error);
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        totalCouples: 0,
        totalEggs: 0,
        totalPigeonneaux: 0,
        totalHealthRecords: 0,
        totalSales: 0,
        totalRevenue: 0
      };
    }
  }

  // Récupérer les alertes et rappels
  async getAlerts() {
    try {
      // Enregistrements de santé à venir (dans les 7 prochains jours)
      const upcomingHealth = await executeQuery(`
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
          END as targetName
        FROM healthRecords h
        LEFT JOIN couples c ON h.targetType = 'couple' AND h.targetId = c.id
        LEFT JOIN pigeonneaux p ON h.targetType = 'pigeonneau' AND h.targetId = p.id
        WHERE h.nextDue IS NOT NULL 
        AND h.nextDue BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        ORDER BY h.nextDue ASC
      `);
      
      // Œufs en incubation (plus de 18 jours)
      const overdueEggs = await executeQuery(`
        SELECT 
          e.id,
          e.coupleId,
          c.nestNumber as coupleName,
          e.egg1Date,
          e.egg2Date,
          DATEDIFF(CURDATE(), e.egg1Date) as daysSinceEgg1,
          DATEDIFF(CURDATE(), e.egg2Date) as daysSinceEgg2
        FROM eggs e
        LEFT JOIN couples c ON e.coupleId = c.id
        WHERE (e.hatchDate1 IS NULL AND DATEDIFF(CURDATE(), e.egg1Date) > 18)
        OR (e.hatchDate2 IS NULL AND e.egg2Date IS NOT NULL AND DATEDIFF(CURDATE(), e.egg2Date) > 18)
      `);
      
      return {
        upcomingHealth,
        overdueEggs
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des alertes: ${error.message}`);
    }
  }
}

module.exports = new StatisticsService(); 