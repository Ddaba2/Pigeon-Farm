const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Route pour sauvegarder la configuration du tableau de bord personnalisé
router.post('/dashboard/config', async (req, res) => {
  try {
    const { userId, config } = req.body;

    // Dans un vrai système, vous auriez une table dashboard_configs
    // Pour l'instant, on simule la sauvegarde
    const configData = {
      userId,
      layout: config.layout || 'default',
      widgets: config.widgets || [],
      theme: config.theme || 'light',
      updatedAt: new Date().toISOString()
    };

    // Simulation de la sauvegarde
    console.log('Configuration tableau de bord sauvegardée:', configData);

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
});

// Route pour récupérer la configuration du tableau de bord
router.get('/dashboard/config/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Configuration par défaut
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
        },
        {
          id: 'user-trends',
          type: 'chart',
          title: 'Tendances Utilisateurs',
          position: { x: 0, y: 2, w: 6, h: 3 },
          config: { chartType: 'line', period: '7d' }
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
});

// Route pour obtenir les widgets disponibles
router.get('/dashboard/widgets', async (req, res) => {
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
      },
      {
        id: 'user-trends',
        type: 'chart',
        title: 'Tendances Utilisateurs',
        description: 'Graphique des tendances d\'inscription et connexion',
        icon: 'TrendingUp',
        category: 'analytics',
        defaultSize: { w: 6, h: 3 },
        configurable: true
      },
      {
        id: 'system-health',
        type: 'health',
        title: 'Santé du Système',
        description: 'État général du système et des services',
        icon: 'Heart',
        category: 'system',
        defaultSize: { w: 2, h: 2 },
        configurable: false
      },
      {
        id: 'quick-actions',
        type: 'actions',
        title: 'Actions Rapides',
        description: 'Boutons d\'actions rapides pour l\'admin',
        icon: 'Zap',
        category: 'actions',
        defaultSize: { w: 4, h: 1 },
        configurable: true
      },
      {
        id: 'alerts',
        type: 'alerts',
        title: 'Alertes Système',
        description: 'Notifications et alertes importantes',
        icon: 'AlertTriangle',
        category: 'system',
        defaultSize: { w: 2, h: 2 },
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
});

// Route pour obtenir les données d'un widget spécifique
router.get('/dashboard/widget/:widgetId/data', async (req, res) => {
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

      case 'user-trends':
        const [trends] = await db.execute(`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as new_users
          FROM users 
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `, [config.period === '30d' ? 30 : 7]);
        widgetData = trends;
        break;

      case 'system-health':
        widgetData = {
          status: 'healthy',
          uptime: '99.9%',
          memory: '65%',
          disk: '45%',
          lastCheck: new Date().toISOString()
        };
        break;

      case 'quick-actions':
        widgetData = [
          { id: 'create-user', label: 'Nouvel Utilisateur', icon: 'UserPlus' },
          { id: 'export-data', label: 'Exporter Données', icon: 'Download' },
          { id: 'system-backup', label: 'Sauvegarde', icon: 'Save' },
          { id: 'clear-cache', label: 'Vider Cache', icon: 'Trash2' }
        ];
        break;

      case 'alerts':
        widgetData = [
          { id: 1, type: 'info', message: 'Système fonctionnel', timestamp: new Date().toISOString() },
          { id: 2, type: 'warning', message: 'Espace disque à 80%', timestamp: new Date().toISOString() }
        ];
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
});

module.exports = router;
