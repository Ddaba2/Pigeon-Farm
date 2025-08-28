import express from 'express';
import { authenticateUser, requireUserOrAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errorHandler.js';
import StatisticsService from '../services/statisticsService.js';

const router = express.Router();

// GET /api/statistics - Récupérer toutes les statistiques
router.get('/', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  try {
    // Version robuste avec gestion d'erreur individuelle
    const [
      coupleStats,
      eggStats,
      pigeonneauStats,
      healthStats,
      saleStats
    ] = await Promise.allSettled([
      import('../services/coupleService.js').then(m => m.default.getCoupleStats(req.user.id)),
      import('../services/eggService.js').then(m => m.default.getEggStats(req.user.id)),
      import('../services/pigeonneauService.js').then(m => m.default.getPigeonneauStats(req.user.id)),
      import('../services/healthService.js').then(m => m.default.getHealthStats(req.user.id)),
      import('../services/saleService.js').then(m => m.default.getSaleStats(req.user.id))
    ]);

    // Traiter les résultats avec gestion d'erreur
    const stats = {
      couples: coupleStats.status === 'fulfilled' ? coupleStats.value : { total_couples: 0, active_couples: 0, breeding_couples: 0 },
      eggs: eggStats.status === 'fulfilled' ? eggStats.value : { total_eggs: 0, successful_hatches: 0, failed_hatches: 0 },
      pigeonneaux: pigeonneauStats.status === 'fulfilled' ? pigeonneauStats.value : { total_pigeonneaux: 0, alive_pigeonneaux: 0, sold_pigeonneaux: 0 },
      health: healthStats.status === 'fulfilled' ? healthStats.value : { total_records: 0, upcoming_treatments: 0 },
      sales: saleStats.status === 'fulfilled' ? saleStats.value : { total_sales: 0, total_amount: 0, average_amount: 0 }
    };

    // Calculer le résumé
    const summary = StatisticsService.calculateSummaryStats(
      stats.couples, stats.eggs, stats.pigeonneaux, stats.health, stats.sales
    );

    stats.summary = summary;
    
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

// GET /api/statistics/summary - Statistiques de résumé
router.get('/summary', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  try {
    const [
      coupleStats,
      eggStats,
      pigeonneauStats,
      healthStats,
      saleStats
    ] = await Promise.all([
      import('../services/coupleService.js').then(m => m.default.getCoupleStats(req.user.id)),
      import('../services/eggService.js').then(m => m.default.getEggStats(req.user.id)),
      import('../services/pigeonneauService.js').then(m => m.default.getPigeonneauStats(req.user.id)),
      import('../services/healthService.js').then(m => m.default.getHealthStats(req.user.id)),
      import('../services/saleService.js').then(m => m.default.getSaleStats(req.user.id))
    ]);

    const summaryStats = StatisticsService.calculateSummaryStats(
      coupleStats, eggStats, pigeonneauStats, healthStats, saleStats
    );
    
    res.json({
      success: true,
      data: summaryStats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de résumé:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des statistiques de résumé',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// GET /api/statistics/growth - Statistiques de croissance
router.get('/growth', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  const { period = 'year' } = req.query;
  
  try {
    const growthStats = await StatisticsService.getGrowthStats(req.user.id, period);
    
    res.json({
      success: true,
      data: growthStats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de croissance:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des statistiques de croissance',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// GET /api/statistics/alerts - Alertes et notifications
router.get('/alerts', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  try {
    const alerts = await StatisticsService.getAlerts(req.user.id);
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des alertes',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// GET /api/statistics/breeding-performance - Performance de reproduction
router.get('/breeding-performance', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  try {
    const breedingStats = await StatisticsService.getBreedingPerformance(req.user.id);
    
    res.json({
      success: true,
      data: breedingStats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de reproduction:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des statistiques de reproduction',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// GET /api/statistics/financial - Statistiques financières
router.get('/financial', authenticateUser, requireUserOrAdmin, asyncHandler(async (req, res) => {
  try {
    const financialStats = await StatisticsService.getFinancialStats(req.user.id);
    
    res.json({
      success: true,
      data: financialStats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques financières:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des statistiques financières',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

export default router; 