const express = require('express');
const router = express.Router();
const statisticsService = require('../services/statisticsService');
const { authenticateUser } = require('../middleware/auth');

// Récupérer les statistiques du tableau de bord
router.get('/dashboard', authenticateUser, async (req, res) => {
  try {
    const stats = await statisticsService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les statistiques détaillées
router.get('/detailed', authenticateUser, async (req, res) => {
  try {
    const stats = await statisticsService.getDetailedStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les statistiques par utilisateur
router.get('/user/:userId', authenticateUser, async (req, res) => {
  try {
    const stats = await statisticsService.getStatsByUser(req.params.userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les alertes et rappels
router.get('/alerts', authenticateUser, async (req, res) => {
  try {
    const alerts = await statisticsService.getAlerts();
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les statistiques des couples
router.get('/couples', authenticateUser, async (req, res) => {
  try {
    const coupleService = require('../services/coupleService');
    const stats = await coupleService.getCoupleStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les statistiques des œufs
router.get('/eggs', authenticateUser, async (req, res) => {
  try {
    const eggService = require('../services/eggService');
    const stats = await eggService.getEggStats();
    const successRate = await eggService.getSuccessRate();
    res.json({ success: true, data: { stats, successRate } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les statistiques des pigeonneaux
router.get('/pigeonneaux', authenticateUser, async (req, res) => {
  try {
    const pigeonneauService = require('../services/pigeonneauService');
    const stats = await pigeonneauService.getPigeonneauStats();
    const salesStats = await pigeonneauService.getSaleStats();
    const sexStats = await pigeonneauService.getPigeonneauxBySex();
    res.json({ success: true, data: { stats, salesStats, sexStats } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les statistiques de santé
router.get('/health', authenticateUser, async (req, res) => {
  try {
    const healthService = require('../services/healthService');
    const stats = await healthService.getHealthStats();
    const recentRecords = await healthService.getRecentHealthRecords(5);
    const upcomingRecords = await healthService.getUpcomingHealthRecords();
    res.json({ success: true, data: { stats, recentRecords, upcomingRecords } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer toutes les statistiques combinées
router.get('/all', authenticateUser, async (req, res) => {
  try {
    const dashboardStats = await statisticsService.getDashboardStats();
    const detailedStats = await statisticsService.getDetailedStats();
    const alerts = await statisticsService.getAlerts();
    
    res.json({
      success: true,
      data: {
        dashboard: dashboardStats, 
        detailed: detailedStats, 
        alerts 
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 
