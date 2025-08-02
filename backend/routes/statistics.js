import express from 'express';
import pool from '../config/database.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('📊 Calcul des statistiques...');
    
    // Couples
    const [[{ totalCouples }]] = await pool.query('SELECT COUNT(*) as totalCouples FROM couples WHERE userId = ?', [userId]);
    const [[{ activeCouples }]] = await pool.query("SELECT COUNT(*) as activeCouples FROM couples WHERE status = 'active' AND userId = ?", [userId]);
    
    // Pigeonneaux
    const [[{ totalPigeonneaux }]] = await pool.query('SELECT COUNT(*) as totalPigeonneaux FROM pigeonneaux WHERE userId = ?', [userId]);
    const [[{ alivePigeonneaux }]] = await pool.query("SELECT COUNT(*) as alivePigeonneaux FROM pigeonneaux WHERE status = 'alive' AND userId = ?", [userId]);
    const [[{ soldPigeonneaux }]] = await pool.query("SELECT COUNT(*) as soldPigeonneaux FROM pigeonneaux WHERE status = 'sold' AND userId = ?", [userId]);
    const [[{ deadPigeonneaux }]] = await pool.query("SELECT COUNT(*) as deadPigeonneaux FROM pigeonneaux WHERE status = 'dead' AND userId = ?", [userId]);
    
    // Chiffre d'affaires - inclut les ventes de pigeonneaux ET les ventes manuelles
    const [[{ pigeonneauxRevenue }]] = await pool.query("SELECT IFNULL(SUM(salePrice),0) as pigeonneauxRevenue FROM pigeonneaux WHERE status = 'sold' AND userId = ?", [userId]);
    const [[{ manualSalesRevenue }]] = await pool.query("SELECT IFNULL(SUM(amount),0) as manualSalesRevenue FROM sales WHERE userId = ?", [userId]);
    const totalRevenue = Number(pigeonneauxRevenue) + Number(manualSalesRevenue);
    
    // Pontes
    const [[{ totalEggs }]] = await pool.query('SELECT COUNT(*) as totalEggs FROM eggs WHERE userId = ?', [userId]);
    
    // Taux d'éclosion
    const [[{ successfulEggs }]] = await pool.query('SELECT SUM(success1) + SUM(success2) as successfulEggs FROM eggs WHERE userId = ?', [userId]);
    const [[{ totalEggsLaid }]] = await pool.query('SELECT SUM(1 + IF(egg2Date IS NOT NULL, 1, 0)) as totalEggsLaid FROM eggs WHERE userId = ?', [userId]);
    const hatchingRate = totalEggsLaid > 0 ? ((successfulEggs / totalEggsLaid) * 100).toFixed(1) : '0';
    
    // Suivis sanitaires
    const [[{ totalHealthRecords }]] = await pool.query('SELECT COUNT(*) as totalHealthRecords FROM healthRecords WHERE userId = ?', [userId]);

    const stats = {
      totalCouples,
      activeCouples,
      totalPigeonneaux,
      alivePigeonneaux,
      soldPigeonneaux,
      deadPigeonneaux,
      totalRevenue,
      eggsLaid: totalEggs, // Nom attendu par le frontend
      babiesBorn: totalPigeonneaux, // Nom attendu par le frontend
      hatchingRate,
      healthInterventions: totalHealthRecords // Nom attendu par le frontend
    };
    
    console.log('📊 Statistiques calculées:', stats);
    
    res.json(stats);
  } catch (err) {
    console.error('❌ Erreur calcul statistiques:', err);
    res.status(500).json({ error: err.message });
  }
});



export default router; 