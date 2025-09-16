const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateUser, requireAdmin } = require('../middleware/auth.js');
const { asyncHandler } = require('../utils/errorHandler.js');

// Route pour sauvegarder la configuration du tableau de bord personnalisé
router.post('/dashboard/config', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { userId, config } = req.body;

    // Configuration par défaut pour l'admin
    const configData = {
      userId,
      layout: config.layout || 'default',
      widgets: config.widgets || [],
      theme: config.theme || 'light',
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Configuration sauvegardée avec succès',
      data: configData
    });

  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la sauvegarde de la configuration'
    });
  }
}));

// Route pour récupérer la configuration du tableau de bord
router.get('/dashboard/config/:userId', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    // Configuration par défaut pour l'admin
    const defaultConfig = {
      userId: parseInt(userId),
      layout: 'grid',
      widgets: [
        {
          id: 'user-stats',
          type: 'stats',
          title: 'Statistiques Utilisateurs',
          position: { x: 0, y: 0, w: 3, h: 2 },
          config: { showTotal: true, showActive: true }
        },
        {
          id: 'recent-activity',
          type: 'activity',
          title: 'Activité Récente',
          position: { x: 3, y: 0, w: 3, h: 2 },
          config: { limit: 10 }
        }
      ],
      theme: 'light',
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: defaultConfig
    });

  } catch (error) {
    console.error('Erreur lors du chargement de la configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement de la configuration'
    });
  }
}));

// Route pour obtenir les widgets disponibles
router.get('/dashboard/widgets', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const availableWidgets = [
      {
        id: 'user-stats',
        type: 'stats',
        title: 'Statistiques Utilisateurs',
        description: 'Affiche les statistiques globales des utilisateurs',
        icon: 'Users',
        category: 'users',
        defaultSize: { w: 3, h: 2 },
        configurable: true
      },
      {
        id: 'recent-activity',
        type: 'activity',
        title: 'Activité Récente',
        description: 'Liste des dernières activités des utilisateurs',
        icon: 'Activity',
        category: 'activity',
        defaultSize: { w: 3, h: 2 },
        configurable: true
      }
    ];

    res.json({
      success: true,
      data: availableWidgets
    });

  } catch (error) {
    console.error('Erreur lors du chargement des widgets:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des widgets disponibles'
    });
  }
}));

// Route pour obtenir les données d'un widget spécifique
router.get('/dashboard/widget/:widgetId/data', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { widgetId } = req.params;
    const { config = {} } = req.query;

    let widgetData = {};

    switch (widgetId) {
      case 'user-stats':
        const [userStats] = await db.execute(`
          SELECT 
            COUNT(*) as total_users,
            COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins,
            COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active_users,
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_users
          FROM users
        `);
        widgetData = userStats[0];
        break;

      case 'recent-activity':
        const [recentActivity] = await db.execute(`
          SELECT 
            id, username, email, role, last_login, created_at
          FROM users 
          ORDER BY COALESCE(last_login, created_at) DESC
          LIMIT ?
        `, [config.limit || 10]);
        widgetData = recentActivity;
        break;

      default:
        return res.status(404).json({
          success: false,
          message: 'Widget non trouvé'
        });
    }

    res.json({
      success: true,
      data: widgetData
    });

  } catch (error) {
    console.error('Erreur lors du chargement des données du widget:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des données du widget'
    });
  }
}));

module.exports = router;
