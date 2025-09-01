const express = require('express');
const router = express.Router();
const pigeonneauService = require('../services/pigeonneauService');
const { authenticateUser } = require('../middleware/auth');

// Validation pour les pigeonneaux
const validatePigeonneau = (data) => {
  const errors = [];
  
  if (!data.coupleId) {
    errors.push('ID du couple requis');
  }
  
  if (!data.birthDate) {
    errors.push('Date de naissance requise');
  }
  
  if (!data.sex || !['male', 'female', 'unknown'].includes(data.sex)) {
    errors.push('Sexe doit être male, female ou unknown');
  }
  
  if (!data.weight || data.weight <= 0) {
    errors.push('Poids doit être supérieur à 0');
  }
  
  if (!data.status || !['active', 'sold', 'deceased'].includes(data.status)) {
    errors.push('Statut doit être active, sold ou deceased');
  }
  
  if (data.salePrice !== undefined && data.salePrice < 0) {
    errors.push('Prix de vente ne peut pas être négatif');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Récupérer tous les pigeonneaux
router.get('/', authenticateUser, async (req, res) => {
  try {
    const pigeonneaux = await pigeonneauService.getAllPigeonneaux();
    res.json({ success: true, data: pigeonneaux });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer un pigeonneau par ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const pigeonneau = await pigeonneauService.getPigeonneauById(req.params.id);
    if (!pigeonneau) {
      return res.status(404).json({ success: false, error: 'Pigeonneau non trouvé' });
    }
    res.json({ success: true, data: pigeonneau });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Créer un nouveau pigeonneau
router.post('/', authenticateUser, async (req, res) => {
  try {
    const validation = validatePigeonneau(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, error: validation.errors.join(', ') });
    }

    const newPigeonneau = await pigeonneauService.createPigeonneau(req.body);
    res.status(201).json({ success: true, data: newPigeonneau });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mettre à jour un pigeonneau
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const validation = validatePigeonneau(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, error: validation.errors.join(', ') });
    }

    const updatedPigeonneau = await pigeonneauService.updatePigeonneau(req.params.id, req.body);
    res.json({ success: true, data: updatedPigeonneau });
  } catch (error) {
    if (error.message === 'Pigeonneau non trouvé') {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Supprimer un pigeonneau
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const result = await pigeonneauService.deletePigeonneau(req.params.id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    if (error.message === 'Pigeonneau non trouvé') {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les pigeonneaux par couple
router.get('/couple/:coupleId', authenticateUser, async (req, res) => {
  try {
    const pigeonneaux = await pigeonneauService.getPigeonneauxByCouple(req.params.coupleId);
    res.json({ success: true, data: pigeonneaux });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les statistiques des pigeonneaux
router.get('/stats/summary', authenticateUser, async (req, res) => {
  try {
    const stats = await pigeonneauService.getPigeonneauStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les statistiques de vente
router.get('/stats/sales', authenticateUser, async (req, res) => {
  try {
    const salesStats = await pigeonneauService.getSaleStats();
    res.json({ success: true, data: salesStats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les pigeonneaux par sexe
router.get('/stats/by-sex', authenticateUser, async (req, res) => {
  try {
    const sexStats = await pigeonneauService.getPigeonneauxBySex();
    res.json({ success: true, data: sexStats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 
