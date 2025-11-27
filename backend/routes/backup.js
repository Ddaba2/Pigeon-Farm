const express = require('express');
const router = express.Router();
const backupService = require('../services/backupService');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

// 📦 EXPORT : Exporter les données de l'utilisateur connecté
router.get('/export', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const backupData = await backupService.exportUserData(userId);
    
    // Envoyer en JSON pour téléchargement
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="pigeon-farm-backup-${userId}-${Date.now()}.json"`);
    res.json(backupData);
  } catch (error) {
    console.error('❌ Erreur export:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 💾 SAVE : Sauvegarder dans un fichier côté serveur
router.post('/save', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const backupData = await backupService.exportUserData(userId);
    const result = await backupService.saveBackupToFile(userId, backupData);
    
    res.json({ 
      success: true, 
      message: 'Sauvegarde créée avec succès',
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur sauvegarde:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 📥 IMPORT : Restaurer les données depuis un fichier JSON
router.post('/import', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { backupData, clearExisting = false, skipNotifications = true } = req.body;
    
    if (!backupData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Données de sauvegarde manquantes' 
      });
    }
    
    // 🔒 SÉCURITÉ : Vérifier que les métadonnées existent
    if (!backupData.metadata) {
      return res.status(400).json({ 
        success: false, 
        error: 'Format de sauvegarde invalide : métadonnées manquantes' 
      });
    }
    
    // 🔒 AVERTISSEMENT : Si la sauvegarde provient d'un autre utilisateur
    if (backupData.metadata.userId && backupData.metadata.userId !== userId) {
      console.warn(`⚠️ Importation croisée détectée - User ${userId} importe des données de User ${backupData.metadata.userId}`);
      
      // On autorise l'import mais on avertit l'utilisateur
      // Les données seront ré-affectées au nouvel utilisateur
      console.log(`ℹ️ Les données importées seront affectées à l'utilisateur ${userId}`);
    }
    
    // Importer les données pour CET utilisateur uniquement
    const result = await backupService.importUserData(userId, backupData, {
      clearExisting,
      skipNotifications
    });
    
    console.log(`✅ Import réussi pour utilisateur ${userId}`);
    
    res.json({ 
      success: true, 
      message: 'Données restaurées avec succès',
      data: result,
      warning: backupData.metadata.userId !== userId 
        ? 'Ces données provenaient d\'un autre utilisateur et ont été importées dans votre compte'
        : null
    });
  } catch (error) {
    console.error('❌ Erreur import:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 📋 LIST : Lister les sauvegardes disponibles
router.get('/list', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const backups = await backupService.listBackups(userId);
    
    res.json({ 
      success: true, 
      data: backups
    });
  } catch (error) {
    console.error('❌ Erreur liste:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 📖 RESTORE : Restaurer depuis une sauvegarde serveur
router.post('/restore/:filename', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { filename } = req.params;
    const { clearExisting = false } = req.body;
    
    // 🔒 SÉCURITÉ : Vérifier que le fichier appartient à l'utilisateur
    if (!filename.includes(`user${userId}_`)) {
      console.warn(`⚠️ Tentative d'accès non autorisé - User ${userId} a essayé d'accéder à ${filename}`);
      return res.status(403).json({ 
        success: false, 
        error: 'Accès non autorisé à cette sauvegarde. Vous ne pouvez restaurer que vos propres sauvegardes.' 
      });
    }
    
    // 🔒 Charger la sauvegarde avec userId pour vérification
    const backupData = await backupService.loadBackupFromFile(filename, userId);
    
    // 🔒 DOUBLE VÉRIFICATION : Vérifier que le userId dans les métadonnées correspond
    if (backupData.metadata && backupData.metadata.userId !== userId) {
      console.error(`❌ Tentative de restauration croisée détectée - User ${userId} vs Backup User ${backupData.metadata.userId}`);
      return res.status(403).json({ 
        success: false, 
        error: 'Cette sauvegarde appartient à un autre utilisateur' 
      });
    }
    
    const result = await backupService.importUserData(userId, backupData, {
      clearExisting,
      skipNotifications: true
    });
    
    console.log(`✅ Restauration réussie pour utilisateur ${userId} depuis ${filename}`);
    
    res.json({ 
      success: true, 
      message: 'Données restaurées avec succès',
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur restauration:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 🗑️ CLEAR : Supprimer toutes les données (DANGEREUX)
router.delete('/clear', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { confirmPassword } = req.body;
    
    if (!confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mot de passe de confirmation requis' 
      });
    }
    
    // Vérifier le mot de passe
    const { executeQuery } = require('../config/database');
    const { comparePassword } = require('../middleware/auth');
    
    const [user] = await executeQuery(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );
    
    const isValid = await comparePassword(confirmPassword, user.password);
    
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Mot de passe incorrect' 
      });
    }
    
    await backupService.clearUserData(userId);
    
    res.json({ 
      success: true, 
      message: 'Toutes les données ont été supprimées' 
    });
  } catch (error) {
    console.error('❌ Erreur nettoyage:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 🔧 ADMIN : Lister toutes les sauvegardes (admin seulement)
router.get('/admin/list-all', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const backups = await backupService.listBackups();
    
    res.json({ 
      success: true, 
      data: backups
    });
  } catch (error) {
    console.error('❌ Erreur liste admin:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
