const express = require('express');
const router = express.Router();
const coupleService = require('../services/coupleService');
const { validateCouple } = require('../utils/validation');
const { authenticateUser } = require('../middleware/auth');

// Récupérer tous les couples de l'utilisateur
router.get('/', authenticateUser, async (req, res) => {
  try {
    const couples = await coupleService.getCouplesByUser(req.user.id);
    res.json({ success: true, data: couples });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer un couple par ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const couple = await coupleService.getCoupleById(req.params.id);
    if (!couple) {
      return res.status(404).json({ success: false, error: 'Couple non trouvé' });
    }
    res.json({ success: true, data: couple });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Créer un nouveau couple
router.post('/', authenticateUser, async (req, res) => {
  try {
    const validation = validateCouple(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, error: validation.errors.join(', ') });
    }

    const coupleData = {
      ...req.body,
      userId: req.user.id
    };

    const newCouple = await coupleService.createCouple(coupleData);
    res.status(201).json({ success: true, data: newCouple });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mettre à jour un couple
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const validation = validateCouple(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, error: validation.errors.join(', ') });
    }

    const updatedCouple = await coupleService.updateCouple(req.params.id, req.body);
    res.json({ success: true, data: updatedCouple });
  } catch (error) {
    if (error.message === 'Couple non trouvé') {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Supprimer un couple
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const result = await coupleService.deleteCouple(req.params.id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    if (error.message === 'Couple non trouvé') {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les couples par utilisateur
router.get('/user/:userId', authenticateUser, async (req, res) => {
  try {
    const couples = await coupleService.getCouplesByUser(req.params.userId);
    res.json({ success: true, data: couples });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les statistiques des couples
router.get('/stats/summary', authenticateUser, async (req, res) => {
  try {
    const stats = await coupleService.getCoupleStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 