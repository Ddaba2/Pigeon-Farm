import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Lister toutes les ventes
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const [sales] = await pool.query('SELECT * FROM sales WHERE userId = ? ORDER BY date DESC, id DESC', [userId]);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enregistrer une nouvelle vente
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, quantity, unit_price, description, client } = req.body;
    if (!date || !quantity || !unit_price) {
      return res.status(400).json({ error: 'Date, quantité et prix unitaire obligatoires.' });
    }
    const amount = Number(quantity) * Number(unit_price);
    await pool.query(
      'INSERT INTO sales (date, quantity, unit_price, amount, description, client, userId) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [date, quantity, unit_price, amount, description || '', client || '', userId]
    );
    res.json({ message: 'Vente enregistrée.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 