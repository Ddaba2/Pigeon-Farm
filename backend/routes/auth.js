import express from 'express';
import pool from '../config/database.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../utils/secureQueries.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Fonction pour hasher avec MD5
const hashMD5 = (password) => {
  return crypto.createHash('md5').update(password).digest('hex');
};

// Validation pour la connexion
const loginValidation = [
  body('username').trim().isLength({ min: 3 }).withMessage('Le nom d\'utilisateur doit contenir au moins 3 caractères'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
];

// Validation pour l'inscription
const registerValidation = [
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Le nom d\'utilisateur doit contenir entre 3 et 30 caractères'),
  body('full_name').trim().isLength({ min: 2, max: 100 }).withMessage('Le nom complet doit contenir entre 2 et 100 caractères'),
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
];

// Validation pour la récupération de mot de passe
const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide')
];

// Validation pour la réinitialisation de mot de passe
const resetPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Le code doit contenir 6 caractères'),
  body('newPassword').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
];

// Login
router.post('/login', loginValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { username, password } = req.body;
  try {
    const users = await executeQuery('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
    if (users.length === 0) return res.status(401).json({ error: 'Mot de passe ou email incorrect.' });
    
    const user = users[0];
    const hashedPassword = hashMD5(password);
    
    if (hashedPassword !== user.password) {
      return res.status(401).json({ error: 'Mot de passe ou email incorrect.' });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, username: user.username, full_name: user.full_name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Erreur connexion:', err);
    res.status(500).json({ error: 'Une erreur est survenue, veuillez réessayer.' });
  }
});

// Ajout de l'inscription
router.post('/register', registerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { username, full_name, email, password } = req.body;
  try {
    const users = await executeQuery('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (users.length > 0) {
      return res.status(400).json({ error: 'Email ou nom d\'utilisateur déjà utilisé.' });
    }
    
    const hashedPassword = hashMD5(password);
    
    await executeQuery(
      'INSERT INTO users (username, full_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [username, full_name, email, hashedPassword, 'user']
    );
    
    res.json({ message: 'Compte créé avec succès. Vous pouvez vous connecter.' });
  } catch (err) {
    console.error('Erreur inscription:', err);
    res.status(500).json({ error: 'Une erreur est survenue, veuillez réessayer.' });
  }
});

// Ajout de la route de récupération de mot de passe
router.post('/forgot-password', forgotPasswordValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { email } = req.body;
  try {
    const users = await executeQuery('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Aucun compte trouvé avec cet email.' });
    }
    
    const user = users[0];
    const resetCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const resetExpiry = new Date(Date.now() + 3600000); // 1 heure
    
    await executeQuery('UPDATE users SET reset_code = ?, reset_expiry = ? WHERE id = ?', [resetCode, resetExpiry, user.id]);

    // Configuration email (à adapter selon votre fournisseur)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Réinitialisation de mot de passe - PigeonFarm',
      html: `
        <h2>Réinitialisation de mot de passe</h2>
        <p>Votre code de réinitialisation est : <strong>${resetCode}</strong></p>
        <p>Ce code expire dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Code de réinitialisation envoyé par email.' });
  } catch (err) {
    console.error('Erreur récupération mot de passe:', err);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du code.' });
  }
});

router.post('/verify-reset-code', async (req, res) => {
  const { email, code } = req.body;
  try {
    const users = await executeQuery('SELECT * FROM users WHERE email = ? AND reset_code = ? AND reset_expiry > NOW()', [email, code]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Code invalide ou expiré.' });
    }
    res.json({ message: 'Code vérifié.' });
  } catch (err) {
    console.error('Erreur vérification code:', err);
    res.status(500).json({ error: 'Erreur lors de la vérification.' });
  }
});

// Réinitialisation du mot de passe
router.post('/reset-password', resetPasswordValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { email, code, newPassword } = req.body;
  try {
    const users = await executeQuery('SELECT * FROM users WHERE email = ? AND reset_code = ? AND reset_expiry > NOW()', [email, code]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Code invalide ou expiré.' });
    }
    
    const user = users[0];
    const hashedPassword = hashMD5(newPassword);
    
    await executeQuery('UPDATE users SET password = ?, reset_code = NULL, reset_expiry = NULL WHERE id = ?', [hashedPassword, user.id]);

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({
      message: 'Mot de passe réinitialisé avec succès.',
      token,
      user: { id: user.id, username: user.username, full_name: user.full_name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Erreur réinitialisation mot de passe:', err);
    res.status(500).json({ error: 'Erreur lors de la réinitialisation.' });
  }
});

export default router; 