import express from 'express';
import { authenticateUser, requireUserOrAdmin } from '../middleware/auth.js';
import { validateCouple } from '../utils/validation.js';
import { asyncHandler } from '../utils/errorHandler.js';
import CoupleService from '../services/coupleService.js';

const router = express.Router();

// GET /api/couples - Récupérer tous les couples
router.get('/', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  const { status, breed, page = 1, limit = 10 } = req.query;
  const userId = req.user.id; // Récupérer l'ID de l'utilisateur connecté
  
  try {
    const filters = {};
    if (status) filters.status = status;
    if (breed) filters.breed = breed;
    
    const result = await CoupleService.getCouplesByUserId(userId, parseInt(page), parseInt(limit), filters);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des couples:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des couples',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// GET /api/couples/:id - Récupérer un couple par ID
router.get('/:id', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  const coupleId = parseInt(req.params.id);
  
  try {
    const couple = await CoupleService.getCoupleById(coupleId);
    
    if (!couple) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Couple non trouvé',
          code: 'COUPLE_NOT_FOUND'
        }
      });
    }
    
    // Vérifier que l'utilisateur est propriétaire
    if (couple.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Accès non autorisé',
          code: 'UNAUTHORIZED'
        }
      });
    }
    
    res.json({
      success: true,
      data: couple
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du couple:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération du couple',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// POST /api/couples - Créer un nouveau couple
router.post('/', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  const coupleData = req.body;
  
  // Validation des données
  const validation = validateCouple(coupleData);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Données invalides',
        details: validation.errors
      }
    });
  }
  
  try {
    // Ajouter l'ID de l'utilisateur
    coupleData.userId = req.user.id;
    
    // Créer le nouveau couple
    const newCouple = await CoupleService.createCouple(coupleData);
    
    res.status(201).json({
      success: true,
      message: 'Couple créé avec succès',
      data: newCouple
    });
  } catch (error) {
    console.error('Erreur lors de la création du couple:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la création du couple',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// PUT /api/couples/:id - Mettre à jour un couple
router.put('/:id', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  const coupleId = parseInt(req.params.id);
  const updateData = req.body;
  
  try {
    // Vérifier que le couple existe
    const couple = await CoupleService.getCoupleById(coupleId);
    if (!couple) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Couple non trouvé',
          code: 'COUPLE_NOT_FOUND'
        }
      });
    }
    
    // Vérifier que l'utilisateur est propriétaire
    if (couple.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Accès non autorisé',
          code: 'UNAUTHORIZED'
        }
      });
    }
    
    // Mettre à jour le couple
    const updatedCouple = await CoupleService.updateCouple(coupleId, updateData);
    
    res.json({
      success: true,
      message: 'Couple mis à jour avec succès',
      data: updatedCouple
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du couple:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour du couple',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// DELETE /api/couples/:id - Supprimer un couple
router.delete('/:id', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  const coupleId = parseInt(req.params.id);
  
  try {
    // Vérifier que le couple existe
    const couple = await CoupleService.getCoupleById(coupleId);
    if (!couple) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Couple non trouvé',
          code: 'COUPLE_NOT_FOUND'
        }
      });
    }
    
    // Vérifier que l'utilisateur est propriétaire
    if (couple.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Accès non autorisé',
          code: 'UNAUTHORIZED'
        }
      });
    }
    
    // Supprimer le couple
    await CoupleService.deleteCouple(coupleId, req.user.id);
    
    res.json({
      success: true,
      message: 'Couple supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du couple:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la suppression du couple',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// GET /api/couples/stats/summary - Statistiques des couples
router.get('/stats/summary', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  try {
    const stats = await CoupleService.getCoupleStats(req.user.id);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des statistiques',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

export default router; 