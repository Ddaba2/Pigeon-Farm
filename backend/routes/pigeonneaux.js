import express from 'express';
import pool from '../config/database.js';
import { logAudit } from '../utils/audit.js';
const router = express.Router();

// GET all pigeonneaux with couple info (filtré par userId)
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT p.*, c.nestNumber, c.race
      FROM pigeonneaux p
      LEFT JOIN couples c ON p.coupleId = c.id
      WHERE p.userId = ?
    `, [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Une erreur est survenue, veuillez réessayer.' });
  }
});

// GET one pigeonneau by id (filtré par userId)
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query('SELECT * FROM pigeonneaux WHERE id = ? AND userId = ?', [req.params.id, userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Ressource non trouvée.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Une erreur est survenue, veuillez réessayer.' });
  }
});

// POST create pigeonneau (avec vérification des relations et userId)
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { coupleId, eggRecordId, birthDate, sex, status, salePrice, saleDate, buyer, observations } = req.body;
    
    // Vérifier que le couple appartient à l'utilisateur
    const [couples] = await pool.query('SELECT id FROM couples WHERE id = ? AND userId = ?', [coupleId, userId]);
    if (couples.length === 0) {
      return res.status(400).json({ error: 'Le couple sélectionné n\'existe pas ou ne vous appartient pas.' });
    }
    
    // Vérifier que l'œuf appartient à l'utilisateur
    const [eggs] = await pool.query('SELECT id FROM eggs WHERE id = ? AND userId = ?', [eggRecordId, userId]);
    let finalEggRecordId = eggRecordId;
    if (eggs.length === 0) {
      // Créer automatiquement une ponte pour ce couple
      const [newEgg] = await pool.query(
        'INSERT INTO eggs (coupleId, egg1Date, success1, userId) VALUES (?, ?, ?, ?)',
        [coupleId, birthDate, true, userId]
      );
      finalEggRecordId = newEgg.insertId;
    }
    
    // Créer le pigeonneau
    const [result] = await pool.query(
      'INSERT INTO pigeonneaux (coupleId, eggRecordId, birthDate, sex, status, salePrice, saleDate, buyer, observations, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [coupleId, finalEggRecordId, birthDate, sex, status, salePrice, saleDate, buyer, observations, userId]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Une erreur est survenue, veuillez réessayer.' });
  }
});

// PUT update pigeonneau (filtré par userId)
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    // Vérifier que le pigeonneau appartient à l'utilisateur
    const [rows] = await pool.query('SELECT * FROM pigeonneaux WHERE id = ? AND userId = ?', [req.params.id, userId]);
    if (rows.length === 0) return res.status(403).json({ error: 'Accès interdit.' });
    
    const { coupleId, birthDate, sex, weight, status, salePrice, weaningDate } = req.body;
    
    // Vérifier que le couple appartient à l'utilisateur
    const [couples] = await pool.query('SELECT id FROM couples WHERE id = ? AND userId = ?', [coupleId, userId]);
    if (couples.length === 0) {
      return res.status(400).json({ error: 'Le couple sélectionné n\'existe pas ou ne vous appartient pas.' });
    }
    
    await pool.query(
      'UPDATE pigeonneaux SET coupleId=?, birthDate=?, sex=?, weight=?, status=?, salePrice=?, weaningDate=? WHERE id=? AND userId=?',
      [coupleId, birthDate, sex, weight, status, salePrice, weaningDate, req.params.id, userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Une erreur est survenue, veuillez réessayer.' });
  }
});

// DELETE pigeonneau (filtré par userId)
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    // Vérifier que le pigeonneau appartient à l'utilisateur
    const [rows] = await pool.query('SELECT * FROM pigeonneaux WHERE id = ? AND userId = ?', [req.params.id, userId]);
    if (rows.length === 0) return res.status(403).json({ error: 'Accès interdit.' });
    
    await pool.query('DELETE FROM pigeonneaux WHERE id=? AND userId=?', [req.params.id, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Une erreur est survenue, veuillez réessayer.' });
  }
});

export default router;