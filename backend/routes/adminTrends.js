const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Route pour obtenir les tendances des utilisateurs
router.get('/trends/users', async (req, res) => {
  try {
    // Tendances des 30 derniers jours
    const userTrendsQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as new_admins,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as new_regular_users
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    // Activité des connexions (7 derniers jours)
    const loginActivityQuery = `
      SELECT 
        DATE(last_login) as date,
        COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as daily_logins,
        COUNT(DISTINCT CASE WHEN last_login IS NOT NULL THEN id END) as unique_users
      FROM users 
      WHERE last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(last_login)
      ORDER BY date DESC
    `;

    // Statistiques globales
    const globalStatsQuery = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as total_regular_users,
        COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active_last_7_days,
        COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as active_last_30_days,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_users_last_7_days,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_last_30_days
      FROM users
    `;

    // Heures de connexion (heatmap)
    const loginHoursQuery = `
      SELECT 
        HOUR(last_login) as hour,
        COUNT(*) as login_count
      FROM users 
      WHERE last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND last_login IS NOT NULL
      GROUP BY HOUR(last_login)
      ORDER BY hour
    `;

    const [userTrends] = await db.execute(userTrendsQuery);
    const [loginActivity] = await db.execute(loginActivityQuery);
    const [globalStats] = await db.execute(globalStatsQuery);
    const [loginHours] = await db.execute(loginHoursQuery);

    res.json({
      success: true,
      data: {
        userTrends: userTrends.reverse(), // Du plus ancien au plus récent
        loginActivity: loginActivity.reverse(),
        globalStats: globalStats[0],
        loginHours: loginHours
      }
    });

  } catch (error) {
    console.error('Erreur lors du chargement des tendances:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des tendances utilisateurs'
    });
  }
});

// Route pour obtenir les tendances d'activité détaillées
router.get('/trends/activity', async (req, res) => {
  try {
    const { period = '7' } = req.query; // 7, 30, 90 jours

    // Activité par jour
    const dailyActivityQuery = `
      SELECT 
        DATE(last_login) as date,
        COUNT(DISTINCT id) as unique_users,
        COUNT(*) as total_logins,
        AVG(TIMESTAMPDIFF(MINUTE, created_at, last_login)) as avg_session_duration
      FROM users 
      WHERE last_login >= DATE_SUB(NOW(), INTERVAL ? DAY)
        AND last_login IS NOT NULL
      GROUP BY DATE(last_login)
      ORDER BY date DESC
    `;

    // Top utilisateurs les plus actifs
    const topActiveUsersQuery = `
      SELECT 
        id,
        username,
        email,
        role,
        last_login,
        created_at,
        COUNT(*) as login_count
      FROM users 
      WHERE last_login >= DATE_SUB(NOW(), INTERVAL ? DAY)
        AND last_login IS NOT NULL
      GROUP BY id
      ORDER BY login_count DESC
      LIMIT 10
    `;

    const [dailyActivity] = await db.execute(dailyActivityQuery, [period]);
    const [topActiveUsers] = await db.execute(topActiveUsersQuery, [period]);

    res.json({
      success: true,
      data: {
        dailyActivity: dailyActivity.reverse(),
        topActiveUsers,
        period: parseInt(period)
      }
    });

  } catch (error) {
    console.error('Erreur lors du chargement de l\'activité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des données d\'activité'
    });
  }
});

module.exports = router;
