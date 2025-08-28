import express from 'express';
import { authenticateUser, requireUserOrAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errorHandler.js';
import PigeonneauService from '../services/pigeonneauService.js';

const router = express.Router();

// GET /api/pigeonneaux - Récupérer tous les pigeonneaux
router.get('/', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  const { coupleId, status, page = 1, limit = 10 } = req.query;
  const userId = req.user.id;
  
  try {
    const filters = {};
    if (coupleId) filters.coupleId = coupleId;
    if (status) filters.status = status;
    
    const result = await PigeonneauService.getPigeonneauxByUserId(userId, parseInt(page), parseInt(limit), filters);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des pigeonneaux:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des pigeonneaux',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// GET /api/pigeonneaux/:id - Récupérer un pigeonneau par ID
router.get('/:id', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  const pigeonneauId = parseInt(req.params.id);
  
  try {
    const pigeonneau = await PigeonneauService.getPigeonneauById(pigeonneauId);
    
    if (!pigeonneau) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Pigeonneau non trouvé',
          code: 'PIGEONNEAU_NOT_FOUND'
        }
      });
    }
    
    res.json({
      success: true,
      data: pigeonneau
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du pigeonneau:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération du pigeonneau',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// POST /api/pigeonneaux - Créer un nouveau pigeonneau
router.post('/', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  const pigeonneauData = req.body;
  
  try {
    const newPigeonneau = await PigeonneauService.createPigeonneau(pigeonneauData);
    
    res.status(201).json({
      success: true,
      message: 'Pigeonneau créé avec succès',
      data: newPigeonneau
    });
  } catch (error) {
    console.error('Erreur lors de la création du pigeonneau:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la création du pigeonneau',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// PUT /api/pigeonneaux/:id - Mettre à jour un pigeonneau
router.put('/:id', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  const pigeonneauId = parseInt(req.params.id);
  const updateData = req.body;
  
  try {
    const updatedPigeonneau = await PigeonneauService.updatePigeonneau(pigeonneauId, updateData);
    
    res.json({
      success: true,
      message: 'Pigeonneau mis à jour avec succès',
      data: updatedPigeonneau
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du pigeonneau:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour du pigeonneau',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// DELETE /api/pigeonneaux/:id - Supprimer un pigeonneau
router.delete('/:id', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  const pigeonneauId = parseInt(req.params.id);
  const userId = req.user.id;
  
  try {
    await PigeonneauService.deletePigeonneau(pigeonneauId, userId);
    
    res.json({
      success: true,
      message: 'Pigeonneau supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du pigeonneau:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la suppression du pigeonneau',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// GET /api/pigeonneaux/stats/summary - Statistiques des pigeonneaux
router.get('/stats/summary', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  try {
    const stats = await PigeonneauService.getPigeonneauStats(req.user.id);
    
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