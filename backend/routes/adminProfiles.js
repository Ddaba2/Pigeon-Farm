const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Route pour obtenir le profil détaillé d'un utilisateur
router.get('/profiles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Informations de base de l'utilisateur
    const userQuery = `
      SELECT 
        id, username, email, role, created_at, last_login,
        CASE 
          WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 'active'
          WHEN last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 'inactive'
          ELSE 'dormant'
        END as activity_status
      FROM users 
      WHERE id = ?
    `;

    // Historique des connexions (simulé - dans un vrai système, vous auriez une table login_history)
    const loginHistoryQuery = `
      SELECT 
        last_login as login_time,
        'Connexion réussie' as action,
        'Système' as source,
        'Connexion normale' as details
      FROM users 
      WHERE id = ? AND last_login IS NOT NULL
      ORDER BY last_login DESC
      LIMIT 20
    `;

    // Statistiques d'utilisation
    const usageStatsQuery = `
      SELECT 
        COUNT(*) as total_logins,
        MIN(created_at) as first_seen,
        MAX(last_login) as last_seen,
        DATEDIFF(NOW(), created_at) as days_since_registration,
        CASE 
          WHEN last_login IS NOT NULL THEN DATEDIFF(NOW(), last_login)
          ELSE NULL
        END as days_since_last_login
      FROM users 
      WHERE id = ?
    `;

    // Activité récente (simulée)
    const recentActivityQuery = `
      SELECT 
        'Connexion' as activity_type,
        last_login as activity_time,
        'Connexion au système' as description,
        'success' as status
      FROM users 
      WHERE id = ? AND last_login IS NOT NULL
      UNION ALL
      SELECT 
        'Inscription' as activity_type,
        created_at as activity_time,
        'Création du compte' as description,
        'success' as status
      FROM users 
      WHERE id = ?
      ORDER BY activity_time DESC
      LIMIT 15
    `;

    const [user] = await db.execute(userQuery, [userId]);
    const [loginHistory] = await db.execute(loginHistoryQuery, [userId]);
    const [usageStats] = await db.execute(usageStatsQuery, [userId]);
    const [recentActivity] = await db.execute(recentActivityQuery, [userId, userId]);

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: {
        user: user[0],
        loginHistory,
        usageStats: usageStats[0],
        recentActivity
      }
    });

  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement du profil utilisateur'
    });
  }
});

// Route pour obtenir l'historique complet d'un utilisateur
router.get('/profiles/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'all', limit = 50 } = req.query;

    let historyQuery = `
      SELECT 
        'login' as event_type,
        last_login as event_time,
        'Connexion au système' as description,
        'success' as status,
        'Système' as source
      FROM users 
      WHERE id = ? AND last_login IS NOT NULL
      
      UNION ALL
      
      SELECT 
        'registration' as event_type,
        created_at as event_time,
        'Création du compte' as description,
        'success' as status,
        'Système' as source
      FROM users 
      WHERE id = ?
      
      ORDER BY event_time DESC
      LIMIT ?
    `;

    const [history] = await db.execute(historyQuery, [userId, userId, parseInt(limit)]);

    res.json({
      success: true,
      data: {
        history,
        total: history.length
      }
    });

  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement de l\'historique utilisateur'
    });
  }
});

// Route pour obtenir les statistiques d'utilisation d'un utilisateur
router.get('/profiles/:userId/analytics', async (req, res) => {
  try {
    const { userId } = req.params;

    // Statistiques de connexion par mois
    const monthlyStatsQuery = `
      SELECT 
        DATE_FORMAT(last_login, '%Y-%m') as month,
        COUNT(*) as login_count,
        MIN(last_login) as first_login,
        MAX(last_login) as last_login
      FROM users 
      WHERE id = ? AND last_login IS NOT NULL
      GROUP BY DATE_FORMAT(last_login, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `;

    // Statistiques de session (simulées)
    const sessionStatsQuery = `
      SELECT 
        'Moyenne' as metric,
        '45' as value,
        'minutes' as unit
      UNION ALL
      SELECT 
        'Maximum' as metric,
        '120' as value,
        'minutes' as unit
      UNION ALL
      SELECT 
        'Minimum' as metric,
        '5' as value,
        'minutes' as unit
    `;

    // Patterns d'utilisation
    const usagePatternsQuery = `
      SELECT 
        HOUR(last_login) as hour,
        COUNT(*) as frequency,
        'Connexions par heure' as pattern_type
      FROM users 
      WHERE id = ? AND last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY HOUR(last_login)
      ORDER BY hour
    `;

    const [monthlyStats] = await db.execute(monthlyStatsQuery, [userId]);
    const [sessionStats] = await db.execute(sessionStatsQuery);
    const [usagePatterns] = await db.execute(usagePatternsQuery, [userId]);

    res.json({
      success: true,
      data: {
        monthlyStats,
        sessionStats,
        usagePatterns
      }
    });

  } catch (error) {
    console.error('Erreur lors du chargement des analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des analytics utilisateur'
    });
  }
});

module.exports = router;
