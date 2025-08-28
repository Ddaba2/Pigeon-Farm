import express from 'express';
import { authenticateUser, requireUserOrAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errorHandler.js';
import EggService from '../services/eggService.js';

const router = express.Router();

// GET /api/eggs - Récupérer tous les enregistrements d'œufs
router.get('/', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  const { coupleId, success, page = 1, limit = 10 } = req.query;
  const userId = req.user.id;
  
  try {
    const filters = {};
    if (coupleId) filters.coupleId = coupleId;
    if (success !== undefined) filters.success = success === 'true';
    
    const result = await EggService.getEggsByUserId(userId, parseInt(page), parseInt(limit), filters);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des œufs:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des œufs',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// GET /api/eggs/:id - Récupérer un enregistrement d'œufs par ID
router.get('/:id', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  const eggId = parseInt(req.params.id);
  
  try {
    const egg = await EggService.getEggById(eggId);
    
    if (!egg) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Enregistrement d\'œufs non trouvé',
          code: 'EGG_NOT_FOUND'
        }
      });
    }
    
    res.json({
      success: true,
      data: egg
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'œuf:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération de l\'œuf',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// POST /api/eggs - Créer un nouvel enregistrement d'œufs
router.post('/', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  const eggData = req.body;
  
  try {
    // Créer le nouvel enregistrement
    const newEgg = await EggService.createEgg(eggData);
    
    res.status(201).json({
      success: true,
      message: 'Enregistrement d\'œufs créé avec succès',
      data: newEgg
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'enregistrement d\'œufs:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la création de l\'enregistrement d\'œufs',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// PUT /api/eggs/:id - Mettre à jour un enregistrement d'œufs
router.put('/:id', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  const eggId = parseInt(req.params.id);
  const updateData = req.body;
  
  try {
    // Mettre à jour l'enregistrement
    const updatedEgg = await EggService.updateEgg(eggId, updateData);
    
    res.json({
      success: true,
      message: 'Enregistrement d\'œufs mis à jour avec succès',
      data: updatedEgg
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'enregistrement d\'œufs:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour de l\'enregistrement d\'œufs',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// DELETE /api/eggs/:id - Supprimer un enregistrement d'œufs
router.delete('/:id', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  const eggId = parseInt(req.params.id);
  const userId = req.user.id;
  
  try {
    // Supprimer l'enregistrement
    await EggService.deleteEgg(eggId, userId);
    
    res.json({
      success: true,
      message: 'Enregistrement d\'œufs supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'enregistrement d\'œufs:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la suppression de l\'enregistrement d\'œufs',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// GET /api/eggs/stats/summary - Statistiques des œufs
router.get('/stats/summary', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  try {
    const stats = await EggService.getEggStats(req.user.id);
    
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