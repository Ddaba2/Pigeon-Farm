import express from 'express';
import { authenticateUser, requireUserOrAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errorHandler.js';
import HealthService from '../services/healthService.js';

const router = express.Router();

// GET /api/health-records - Récupérer tous les enregistrements de santé
router.get('/', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  const { pigeonId, status, page = 1, limit = 10 } = req.query;
  const userId = req.user.id;
  
  try {
    const filters = {};
    if (pigeonId) filters.pigeonId = pigeonId;
    if (status) filters.status = status;
    
    const result = await HealthService.getHealthRecordsByUserId(userId, parseInt(page), parseInt(limit), filters);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des enregistrements de santé:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des enregistrements de santé',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// GET /api/health-records/:id - Récupérer un enregistrement de santé par ID
router.get('/:id', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  const healthRecordId = parseInt(req.params.id);
  
  try {
    const healthRecord = await HealthService.getHealthRecordById(healthRecordId);
    
    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Enregistrement de santé non trouvé',
          code: 'HEALTH_RECORD_NOT_FOUND'
        }
      });
    }
    
    res.json({
      success: true,
      data: healthRecord
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'enregistrement de santé:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération de l\'enregistrement de santé',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// POST /api/health-records - Créer un nouvel enregistrement de santé
router.post('/', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  const healthData = req.body;
  
  try {
    const newHealthRecord = await HealthService.createHealthRecord(healthData);
    
    res.status(201).json({
      success: true,
      message: 'Enregistrement de santé créé avec succès',
      data: newHealthRecord
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'enregistrement de santé:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la création de l\'enregistrement de santé',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// PUT /api/health-records/:id - Mettre à jour un enregistrement de santé
router.put('/:id', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  const healthRecordId = parseInt(req.params.id);
  const updateData = req.body;
  
  try {
    const updatedHealthRecord = await HealthService.updateHealthRecord(healthRecordId, updateData);
    
    res.json({
      success: true,
      message: 'Enregistrement de santé mis à jour avec succès',
      data: updatedHealthRecord
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'enregistrement de santé:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour de l\'enregistrement de santé',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// DELETE /api/health-records/:id - Supprimer un enregistrement de santé
router.delete('/:id', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  const healthRecordId = parseInt(req.params.id);
  const userId = req.user.id;
  
  try {
    await HealthService.deleteHealthRecord(healthRecordId, userId);
    
    res.json({
      success: true,
      message: 'Enregistrement de santé supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'enregistrement de santé:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la suppression de l\'enregistrement de santé',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// GET /api/health-records/upcoming/treatments - Traitements à venir
router.get('/upcoming/treatments', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  try {
    const upcomingTreatments = await HealthService.getUpcomingTreatments(req.user.id);
    
    res.json({
      success: true,
      data: upcomingTreatments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des traitements à venir:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des traitements à venir',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// GET /api/health-records/stats/summary - Statistiques de santé
router.get('/stats/summary', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  try {
    const stats = await HealthService.getHealthStats(req.user.id);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de santé:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des statistiques de santé',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

export default router; 