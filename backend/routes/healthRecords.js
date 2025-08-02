import express from 'express';
import pool from '../config/database.js';
import { logAudit } from '../utils/audit.js';
const router = express.Router();

// GET all healthRecords with target info (filtré par userId)
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT h.*, c.nestNumber AS coupleNest, p.id AS pigeonneauId
      FROM healthRecords h
      LEFT JOIN couples c ON h.targetType = 'couple' AND h.targetId = c.id AND c.userId = ?
      LEFT JOIN pigeonneaux p ON h.targetType = 'pigeonneau' AND h.targetId = p.id AND p.userId = ?
      WHERE h.userId = ?
    `, [userId, userId, userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET one healthRecord by id (filtré par userId)
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query('SELECT * FROM healthRecords WHERE id = ? AND userId = ?', [req.params.id, userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create healthRecord (avec userId)
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, product, targetType, targetId, date, nextDue, observations } = req.body;
    
    // Vérifier que la cible appartient à l'utilisateur
    if (targetType === 'couple') {
      const [couples] = await pool.query('SELECT id FROM couples WHERE id = ? AND userId = ?', [targetId, userId]);
      if (couples.length === 0) {
        return res.status(400).json({ error: 'Couple non trouvé ou non autorisé' });
      }
    } else if (targetType === 'pigeonneau') {
      const [pigeonneaux] = await pool.query('SELECT id FROM pigeonneaux WHERE id = ? AND userId = ?', [targetId, userId]);
      if (pigeonneaux.length === 0) {
        return res.status(400).json({ error: 'Pigeonneau non trouvé ou non autorisé' });
      }
    }
    
    const [result] = await pool.query(
      'INSERT INTO healthRecords (type, product, targetType, targetId, date, nextDue, observations, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [type, product, targetType, targetId, date, nextDue, observations, userId]
    );
    
    await logAudit({
      entity: 'healthRecords',
      entityId: result.insertId,
      action: 'create',
      userId,
      details: req.body
    });
    
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update healthRecord (filtré par userId)
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    // Vérifier que l'enregistrement appartient à l'utilisateur
    const [rows] = await pool.query('SELECT * FROM healthRecords WHERE id = ? AND userId = ?', [req.params.id, userId]);
    if (rows.length === 0) return res.status(403).json({ error: 'Accès refusé' });
    
    const { type, product, targetType, targetId, date, nextDue, observations } = req.body;
    
    // Vérifier que la cible appartient à l'utilisateur
    if (targetType === 'couple') {
      const [couples] = await pool.query('SELECT id FROM couples WHERE id = ? AND userId = ?', [targetId, userId]);
      if (couples.length === 0) {
        return res.status(400).json({ error: 'Couple non trouvé ou non autorisé' });
      }
    } else if (targetType === 'pigeonneau') {
      const [pigeonneaux] = await pool.query('SELECT id FROM pigeonneaux WHERE id = ? AND userId = ?', [targetId, userId]);
      if (pigeonneaux.length === 0) {
        return res.status(400).json({ error: 'Pigeonneau non trouvé ou non autorisé' });
      }
    }
    
    await pool.query(
      'UPDATE healthRecords SET type=?, product=?, targetType=?, targetId=?, date=?, nextDue=?, observations=? WHERE id=? AND userId=?',
      [type, product, targetType, targetId, date, nextDue, observations, req.params.id, userId]
    );
    
    await logAudit({
      entity: 'healthRecords',
      entityId: req.params.id,
      action: 'update',
      userId,
      details: req.body
    });
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE healthRecord (filtré par userId)
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    // Vérifier que l'enregistrement appartient à l'utilisateur
    const [rows] = await pool.query('SELECT * FROM healthRecords WHERE id = ? AND userId = ?', [req.params.id, userId]);
    if (rows.length === 0) return res.status(403).json({ error: 'Accès refusé' });
    
    await pool.query('DELETE FROM healthRecords WHERE id=? AND userId=?', [req.params.id, userId]);
    
    await logAudit({
      entity: 'healthRecords',
      entityId: req.params.id,
      action: 'delete',
      userId,
      details: {}
    });
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;