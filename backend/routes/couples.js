const express = require('express');
const router = express.Router();
const coupleService = require('../services/coupleService');
const { validateCouple } = require('../utils/validation');
const { authenticateUser } = require('../middleware/auth');
const { getErrorMessage } = require('../utils/errorMessages');

// Récupérer tous les couples de l'utilisateur
router.get('/', authenticateUser, async (req, res) => {
  try {
    const couples = await coupleService.getCouplesByUser(req.user.id);
    res.json({ success: true, data: couples });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: { 
        message: getErrorMessage('GENERAL', 'INTERNAL_ERROR'),
        code: 'COUPLE_LOAD_FAILED'
      }
    });
  }
});

// Récupérer un couple par ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const couple = await coupleService.getCoupleById(req.params.id);
    if (!couple) {
      return res.status(404).json({ 
        success: false, 
        error: {
          message: getErrorMessage('COUPLE', 'NOT_FOUND'),
          code: 'COUPLE_NOT_FOUND'
        }
      });
    }
    res.json({ success: true, data: couple });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: {
        message: getErrorMessage('GENERAL', 'INTERNAL_ERROR'),
        code: 'COUPLE_LOAD_FAILED'
      }
    });
  }
});

// Créer un nouveau couple
router.post('/', authenticateUser, async (req, res) => {
  try {
    const validation = validateCouple(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false, 
        error: {
          message: getErrorMessage('VALIDATION', 'INVALID_DATA'),
          code: 'COUPLE_VALIDATION_FAILED',
          details: validation.errors
        }
      });
    }

    const coupleData = {
      ...req.body,
      userId: req.user.id
    };

    const newCouple = await coupleService.createCouple(coupleData);
    res.status(201).json({ success: true, data: newCouple, message: 'Couple créé avec succès' });
  } catch (error) {
    // Vérifier si c'est une erreur de numéro de nid en double
    if (error.message && error.message.includes('nid')) {
      return res.status(409).json({
        success: false,
        error: {
          message: getErrorMessage('COUPLE', 'NEST_TAKEN'),
          code: 'COUPLE_NEST_TAKEN'
        }
      });
    }
    res.status(500).json({ 
      success: false, 
      error: {
        message: getErrorMessage('GENERAL', 'INTERNAL_ERROR'),
        code: 'COUPLE_CREATE_FAILED'
      }
    });
  }
});

// Mettre à jour un couple
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const validation = validateCouple(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false, 
        error: {
          message: getErrorMessage('VALIDATION', 'INVALID_DATA'),
          code: 'COUPLE_VALIDATION_FAILED',
          details: validation.errors
        }
      });
    }

    const updatedCouple = await coupleService.updateCouple(req.params.id, req.body);
    res.json({ success: true, data: updatedCouple, message: 'Couple mis à jour avec succès' });
  } catch (error) {
    if (error.message === 'Couple non trouvé') {
      return res.status(404).json({ 
        success: false, 
        error: {
          message: getErrorMessage('COUPLE', 'NOT_FOUND'),
          code: 'COUPLE_NOT_FOUND'
        }
      });
    }
    res.status(500).json({ 
      success: false, 
      error: {
        message: getErrorMessage('GENERAL', 'INTERNAL_ERROR'),
        code: 'COUPLE_UPDATE_FAILED'
      }
    });
  }
});

// Supprimer un couple
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const result = await coupleService.deleteCouple(req.params.id);
    res.json({ success: true, message: 'Couple supprimé avec succès' });
  } catch (error) {
    if (error.message === 'Couple non trouvé') {
      return res.status(404).json({ 
        success: false, 
        error: {
          message: getErrorMessage('COUPLE', 'NOT_FOUND'),
          code: 'COUPLE_NOT_FOUND'
        }
      });
    }
    res.status(500).json({ 
      success: false, 
      error: {
        message: getErrorMessage('COUPLE', 'DELETE_FAILED'),
        code: 'COUPLE_DELETE_FAILED'
      }
    });
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