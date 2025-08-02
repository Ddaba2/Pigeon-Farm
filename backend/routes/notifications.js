import express from 'express';
import pool from '../config/database.js';
import { generateHealthReminders } from '../utils/healthReminders.js';
import requireRole from '../middleware/roles.js';
const router = express.Router();

// Ajout de l'accès à io
let io;
export function setSocketIO(ioInstance) {
  io = ioInstance;
}

// GET notifications (filtrage par user, non lues, type, etc.)
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { isRead, type, limit = 50 } = req.query;
    let sql = 'SELECT n.*, u.username FROM notifications n LEFT JOIN users u ON n.userId = u.id WHERE n.userId = ?';
    let params = [userId];
    if (isRead !== undefined) { sql += ' AND n.isRead = ?'; params.push(isRead === 'true' ? 1 : 0); }
    if (type) { sql += ' AND n.type = ?'; params.push(type); }
    sql += ' ORDER BY n.createdAt DESC LIMIT ?'; params.push(Number(limit));
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH marquer comme lue/non lue
router.patch('/:id/read', async (req, res) => {
  try {
    const userId = req.user.id;
    // Vérifier que la notification appartient à l'utilisateur
    const [rows] = await pool.query('SELECT * FROM notifications WHERE id = ? AND userId = ?', [req.params.id, userId]);
    if (rows.length === 0) return res.status(403).json({ error: 'Accès refusé' });
    const { isRead } = req.body;
    await pool.query('UPDATE notifications SET isRead=? WHERE id=? AND userId=?', [!!isRead, req.params.id, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST créer une notification manuellement
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, message, entityType, entityId } = req.body;
    const [result] = await pool.query(
      'INSERT INTO notifications (type, message, userId, entityType, entityId) VALUES (?, ?, ?, ?, ?)',
      [type, message, userId, entityType, entityId]
    );
    // Émettre l'événement Socket.io si io est défini
    if (io) {
      io.emit('notification', { id: result.insertId, type, message, userId, entityType, entityId });
    }
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/health-reminders : Générer les rappels sanitaires (admin)
router.post('/health-reminders', requireRole('admin'), async (req, res) => {
  try {
    const { daysAhead = 7 } = req.body;
    const created = await generateHealthReminders(daysAhead);
    res.json({ created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 