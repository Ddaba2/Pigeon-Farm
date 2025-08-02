import express from 'express';
import pool from '../config/database.js';
const router = express.Router();

// GET /api/couples - Récupérer tous les couples de l'utilisateur connecté
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query('SELECT * FROM couples WHERE userId = ? ORDER BY id DESC', [userId]);
    res.json(rows);
  } catch (err) {
    console.error('Erreur récupération couples:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/couples/:id - Récupérer un couple spécifique de l'utilisateur connecté
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query('SELECT * FROM couples WHERE id = ? AND userId = ?', [req.params.id, userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Couple non trouvé' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Erreur récupération couple:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/couples - Créer un nouveau couple pour l'utilisateur connecté
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { nestNumber, race, formationDate, maleId, femaleId, observations, status = 'active' } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO couples (nestNumber, race, formationDate, maleId, femaleId, observations, status, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nestNumber, race, formationDate, maleId, femaleId, observations, status, userId]
    );
    
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Erreur création couple:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/couples/:id - Modifier un couple de l'utilisateur connecté
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { nestNumber, race, formationDate, maleId, femaleId, observations, status } = req.body;
    
    const [result] = await pool.query(
      'UPDATE couples SET nestNumber = ?, race = ?, formationDate = ?, maleId = ?, femaleId = ?, observations = ?, status = ? WHERE id = ? AND userId = ?',
      [nestNumber, race, formationDate, maleId, femaleId, observations, status, req.params.id, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Couple non trouvé' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur modification couple:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/couples/:id - Supprimer un couple de l'utilisateur connecté
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const [result] = await pool.query('DELETE FROM couples WHERE id = ? AND userId = ?', [req.params.id, userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Couple non trouvé' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur suppression couple:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;