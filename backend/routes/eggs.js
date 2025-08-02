import express from 'express';
import pool from '../config/database.js';
const router = express.Router();

// GET /api/eggs - Récupérer tous les œufs de l'utilisateur connecté
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query('SELECT * FROM eggs WHERE userId = ? ORDER BY createdAt DESC', [userId]);
    res.json(rows);
  } catch (err) {
    console.error('Erreur récupération œufs:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/eggs/:id - Récupérer un œuf spécifique de l'utilisateur connecté
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query('SELECT * FROM eggs WHERE id = ? AND userId = ?', [req.params.id, userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Œuf non trouvé' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Erreur récupération œuf:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/eggs - Créer un nouvel œuf pour l'utilisateur connecté
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { coupleId, egg1Date, egg2Date, hatchDate1, hatchDate2, success1, success2, observations } = req.body;
    
    // Vérifier que le couple appartient à l'utilisateur
    const [couples] = await pool.query('SELECT id FROM couples WHERE id = ? AND userId = ?', [coupleId, userId]);
    if (couples.length === 0) {
      return res.status(400).json({ error: 'Couple non trouvé ou non autorisé' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO eggs (coupleId, egg1Date, egg2Date, hatchDate1, hatchDate2, success1, success2, observations, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [coupleId, egg1Date, egg2Date, hatchDate1, hatchDate2, success1, success2, observations, userId]
    );
    
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Erreur création œuf:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/eggs/:id - Modifier un œuf de l'utilisateur connecté
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { coupleId, egg1Date, egg2Date, hatchDate1, hatchDate2, success1, success2, observations } = req.body;
    
    // Vérifier que le couple appartient à l'utilisateur
    const [couples] = await pool.query('SELECT id FROM couples WHERE id = ? AND userId = ?', [coupleId, userId]);
    if (couples.length === 0) {
      return res.status(400).json({ error: 'Couple non trouvé ou non autorisé' });
    }
    
    const [result] = await pool.query(
      'UPDATE eggs SET coupleId = ?, egg1Date = ?, egg2Date = ?, hatchDate1 = ?, hatchDate2 = ?, success1 = ?, success2 = ?, observations = ? WHERE id = ? AND userId = ?',
      [coupleId, egg1Date, egg2Date, hatchDate1, hatchDate2, success1, success2, observations, req.params.id, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Œuf non trouvé' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur modification œuf:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/eggs/:id - Supprimer un œuf de l'utilisateur connecté
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const [result] = await pool.query('DELETE FROM eggs WHERE id = ? AND userId = ?', [req.params.id, userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Œuf non trouvé' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur suppression œuf:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;