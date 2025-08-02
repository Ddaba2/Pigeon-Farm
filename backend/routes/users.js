import express from 'express';
import pool from '../config/database.js';
import { body, validationResult } from 'express-validator';
import { logAudit } from '../utils/audit.js';

const router = express.Router();

// Validation pour la création d'utilisateur
const createUserValidation = [
  body('username').isLength({ min: 3 }).withMessage('Le nom d\'utilisateur doit contenir au moins 3 caractères'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('full_name').isLength({ min: 2 }).withMessage('Le nom complet doit contenir au moins 2 caractères')
];

// Validation pour la modification d'utilisateur
const updateUserValidation = [
  body('username').optional().isLength({ min: 3 }).withMessage('Le nom d\'utilisateur doit contenir au moins 3 caractères'),
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('full_name').optional().isLength({ min: 2 }).withMessage('Le nom complet doit contenir au moins 2 caractères')
];

// GET /api/users - Récupérer tous les utilisateurs (admin seulement)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, email, full_name, role, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Erreur récupération utilisateurs:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id - Récupérer un utilisateur spécifique (admin seulement)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, email, full_name, role, created_at FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Erreur récupération utilisateur:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users - Créer un nouvel utilisateur (admin seulement)
router.post('/', createUserValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { username, email, password, full_name, role = 'user' } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Nom d\'utilisateur ou email déjà utilisé' });
    }
    
    // Hasher le mot de passe (MD5 pour la compatibilité)
    const crypto = await import('crypto');
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
    
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, full_name, role]
    );
    
    await logAudit({
      entity: 'users',
      entityId: result.insertId,
      action: 'create',
      userId: req.user.id,
      details: { username, email, full_name, role }
    });
    
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Erreur création utilisateur:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id - Modifier un utilisateur (admin seulement)
router.put('/:id', updateUserValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { username, email, full_name, role } = req.body;
    
    // Vérifier si l'utilisateur existe
    const [existingUser] = await pool.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si le nouveau nom d'utilisateur ou email est déjà utilisé
    if (username || email) {
      const [duplicateUsers] = await pool.query(
        'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
        [username || '', email || '', req.params.id]
      );
      if (duplicateUsers.length > 0) {
        return res.status(400).json({ error: 'Nom d\'utilisateur ou email déjà utilisé' });
      }
    }
    
    // Construire la requête de mise à jour
    const updateFields = [];
    const updateValues = [];
    
    if (username) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (full_name) {
      updateFields.push('full_name = ?');
      updateValues.push(full_name);
    }
    if (role) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
    }
    
    updateValues.push(req.params.id);
    
    const [result] = await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    await logAudit({
      entity: 'users',
      entityId: req.params.id,
      action: 'update',
      userId: req.user.id,
      details: req.body
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur modification utilisateur:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id - Supprimer un utilisateur (admin seulement)
router.delete('/:id', async (req, res) => {
  try {
    // Empêcher la suppression de son propre compte
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }
    
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    await logAudit({
      entity: 'users',
      entityId: req.params.id,
      action: 'delete',
      userId: req.user.id,
      details: {}
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur suppression utilisateur:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;