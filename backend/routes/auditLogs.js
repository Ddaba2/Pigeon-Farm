import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/audit-logs - Récupérer tous les logs d'audit (admin seulement)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT al.*, u.username as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.userId = u.id
      ORDER BY al.timestamp DESC
      LIMIT 1000
    `);
    res.json(rows);
  } catch (err) {
    console.error('Erreur récupération logs d\'audit:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/audit-logs/:id - Récupérer un log d'audit spécifique (admin seulement)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT al.*, u.username as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.userId = u.id
      WHERE al.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Log d\'audit non trouvé' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Erreur récupération log d\'audit:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/audit-logs - Créer un nouvel audit log
router.post('/', async (req, res) => {
  try {
    const { entity, entityId, action, details } = req.body;
    const userId = req.user.id;
    
    const [result] = await pool.query(
      'INSERT INTO audit_logs (entity, entityId, action, userId, details) VALUES (?, ?, ?, ?, ?)',
      [entity, entityId, action, userId, JSON.stringify(details)]
    );
    
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Erreur création log d\'audit:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/audit-logs/entity/:entity/:id - Récupérer les logs d'audit pour une entité spécifique
router.get('/entity/:entity/:id', async (req, res) => {
  try {
    const { entity, id } = req.params;
    
    const [rows] = await pool.query(`
      SELECT al.*, u.username as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.userId = u.id
      WHERE al.entity = ? AND al.entityId = ?
      ORDER BY al.timestamp DESC
    `, [entity, id]);
    
    res.json(rows);
  } catch (err) {
    console.error('Erreur récupération logs d\'audit pour entité:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/audit-logs/user/:userId - Récupérer les logs d'audit pour un utilisateur spécifique
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [rows] = await pool.query(`
      SELECT al.*, u.username as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.userId = u.id
      WHERE al.userId = ?
      ORDER BY al.timestamp DESC
      LIMIT 100
    `, [userId]);
    
    res.json(rows);
  } catch (err) {
    console.error('Erreur récupération logs d\'audit pour utilisateur:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;