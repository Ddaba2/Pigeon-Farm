const express = require('express');
const router = express.Router();
const healthService = require('../services/healthService');
const { authenticateUser } = require('../middleware/auth');

// Validation pour les enregistrements de santé
const validateHealthRecord = (data) => {
  const errors = [];
  
  if (!data.type || !['vaccination', 'treatment', 'exam'].includes(data.type)) {
    errors.push('Type doit être vaccination, treatment ou exam');
  }
  
  if (!data.targetType || !['couple', 'pigeonneau'].includes(data.targetType)) {
    errors.push('Type de cible doit être couple ou pigeonneau');
  }
  
  if (!data.targetId) {
    errors.push('ID de la cible requis');
  }
  
  if (!data.product) {
    errors.push('Produit requis');
  }
  
  if (!data.date) {
    errors.push('Date requise');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Récupérer tous les enregistrements de santé
router.get('/', authenticateUser, async (req, res) => {
  try {
    const records = await healthService.getAllHealthRecords();
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer un enregistrement de santé par ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const record = await healthService.getHealthRecordById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Enregistrement de santé non trouvé' });
    }
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Créer un nouvel enregistrement de santé
router.post('/', authenticateUser, async (req, res) => {
  try {
    const validation = validateHealthRecord(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, error: validation.errors.join(', ') });
    }

    const newRecord = await healthService.createHealthRecord(req.body);
    res.status(201).json({ success: true, data: newRecord });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mettre à jour un enregistrement de santé
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const validation = validateHealthRecord(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, error: validation.errors.join(', ') });
    }

    const updatedRecord = await healthService.updateHealthRecord(req.params.id, req.body);
    res.json({ success: true, data: updatedRecord });
  } catch (error) {
    if (error.message === 'Enregistrement de santé non trouvé') {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Supprimer un enregistrement de santé
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const result = await healthService.deleteHealthRecord(req.params.id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    if (error.message === 'Enregistrement de santé non trouvé') {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les enregistrements de santé par cible
router.get('/target/:targetType/:targetId', authenticateUser, async (req, res) => {
  try {
    const records = await healthService.getHealthRecordsByTarget(req.params.targetType, req.params.targetId);
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les enregistrements de santé par type
router.get('/type/:type', authenticateUser, async (req, res) => {
  try {
    const records = await healthService.getHealthRecordsByType(req.params.type);
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les enregistrements de santé récents
router.get('/recent/:limit?', authenticateUser, async (req, res) => {
  try {
    const limit = req.params.limit ? parseInt(req.params.limit) : 10;
    const records = await healthService.getRecentHealthRecords(limit);
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les enregistrements de santé à venir
router.get('/upcoming/all', authenticateUser, async (req, res) => {
  try {
    const records = await healthService.getUpcomingHealthRecords();
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les statistiques des enregistrements de santé
router.get('/stats/summary', authenticateUser, async (req, res) => {
  try {
    const stats = await healthService.getHealthStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 
