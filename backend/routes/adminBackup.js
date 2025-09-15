const express = require('express');
const router = express.Router();
const { authenticateUser, requireAdmin } = require('../middleware/auth.js');
const { asyncHandler } = require('../utils/errorHandler.js');
const fs = require('fs').promises;
const path = require('path');

// Route pour obtenir les informations système
router.get('/system', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const db = require('../config/database');
    
    // Obtenir les vraies informations de la base de données
    const [dbInfo] = await db.execute('SELECT DATABASE() as database_name');
    const [tableInfo] = await db.execute(`
      SELECT 
        table_name,
        table_rows,
        ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      ORDER BY (data_length + index_length) DESC
    `);
    
    const totalSize = tableInfo.reduce((sum, table) => sum + table.size_mb, 0);
    
    const systemInfo = {
      serverName: 'PigeonFarm Server',
      version: '1.0.0',
      uptime: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      database: {
        name: dbInfo[0].database_name,
        tables: tableInfo.length,
        totalSize: `${totalSize.toFixed(2)} MB`,
        tables: tableInfo
      },
      memory: {
        total: Math.floor(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        used: Math.floor(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        free: Math.floor((process.memoryUsage().heapTotal - process.memoryUsage().heapUsed) / 1024 / 1024) + ' MB'
      },
      cpuCount: require('os').cpus().length
    };

    res.json({
      success: true,
      data: systemInfo
    });

  } catch (error) {
    console.error('Erreur lors du chargement des informations système:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des informations système'
    });
  }
}));

// Route pour obtenir la liste des sauvegardes
router.get('/list', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    // Simulation de la liste des sauvegardes
    const backups = [
      {
        id: 'backup_2024_01_15_10_30',
        name: 'Sauvegarde automatique - 15/01/2024',
        type: 'automatic',
        size: '45.2 MB',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 jours
        status: 'completed',
        tables: ['users', 'couples', 'eggs', 'pigeonneaux', 'sales']
      },
      {
        id: 'backup_2024_01_14_10_30',
        name: 'Sauvegarde automatique - 14/01/2024',
        type: 'automatic',
        size: '44.8 MB',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 jours
        status: 'completed',
        tables: ['users', 'couples', 'eggs', 'pigeonneaux', 'sales']
      },
      {
        id: 'backup_2024_01_13_15_45',
        name: 'Sauvegarde manuelle - 13/01/2024',
        type: 'manual',
        size: '46.1 MB',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 jours
        status: 'completed',
        tables: ['users', 'couples', 'eggs', 'pigeonneaux', 'sales']
      },
      {
        id: 'backup_2024_01_12_10_30',
        name: 'Sauvegarde automatique - 12/01/2024',
        type: 'automatic',
        size: '45.9 MB',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 jours
        status: 'completed',
        tables: ['users', 'couples', 'eggs', 'pigeonneaux', 'sales']
      }
    ];

    res.json({
      success: true,
      data: backups
    });

  } catch (error) {
    console.error('Erreur lors du chargement de la liste des sauvegardes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement de la liste des sauvegardes'
    });
  }
}));

// Route pour créer une nouvelle sauvegarde
router.post('/create', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { type = 'manual', name } = req.body;
    
    // Simulation de la création d'une sauvegarde
    const backupId = `backup_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}_${Date.now()}`;
    const backupName = name || `Sauvegarde ${type === 'manual' ? 'manuelle' : 'automatique'} - ${new Date().toLocaleDateString('fr-FR')}`;
    
    // Simuler le temps de création
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newBackup = {
      id: backupId,
      name: backupName,
      type: type,
      size: `${(Math.random() * 10 + 40).toFixed(1)} MB`,
      createdAt: new Date().toISOString(),
      status: 'completed',
      tables: ['users', 'couples', 'eggs', 'pigeonneaux', 'sales']
    };

    res.json({
      success: true,
      data: newBackup,
      message: 'Sauvegarde créée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la création de la sauvegarde:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la sauvegarde'
    });
  }
}));

// Route pour restaurer une sauvegarde
router.post('/restore/:backupId', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { backupId } = req.params;
    
    // Simulation de la restauration
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    res.json({
      success: true,
      message: `Sauvegarde ${backupId} restaurée avec succès`
    });

  } catch (error) {
    console.error('Erreur lors de la restauration:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la restauration de la sauvegarde'
    });
  }
}));

// Route pour supprimer une sauvegarde
router.delete('/:backupId', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { backupId } = req.params;
    
    // Simulation de la suppression
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({
      success: true,
      message: `Sauvegarde ${backupId} supprimée avec succès`
    });

  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la sauvegarde'
    });
  }
}));

// Route pour télécharger une sauvegarde
router.get('/download/:backupId', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { backupId } = req.params;
    
    // Simulation du téléchargement
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="${backupId}.sql"`);
    
    // Simulation du contenu de la sauvegarde
    const backupContent = `-- Sauvegarde PigeonFarm
-- Date: ${new Date().toISOString()}
-- ID: ${backupId}

-- Structure des tables et données...
-- (Contenu simulé de la sauvegarde)
`;
    
    res.send(backupContent);

  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement de la sauvegarde'
    });
  }
}));

module.exports = router;
