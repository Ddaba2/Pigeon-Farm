import express from 'express';
import { hashPassword, validatePasswordStrength } from './utils/bcryptConfig.js';
import pool from './config/database.js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
// app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // supprimé car géré globalement
app.use(express.json());

const router = express.Router();

// Route de test de connexion
router.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ success: true, result: rows[0].result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/register', async (req, res) => {
  const { full_name, email, password } = req.body;
  if (!full_name || !email || !password) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }
  // Vérifier si l'email existe déjà
  const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (users.length > 0) {
    return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
  }
      // Validation de la force du mot de passe
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Mot de passe trop faible',
        details: passwordValidation.errors,
        score: passwordValidation.score
      });
    }
    
    const hash = await hashPassword(password);
  await pool.query(
    'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
    [full_name, email, hash, 'user']
  );
  res.json({ message: 'Compte créé. Vous pouvez vous connecter.' });
});

export { router };
export default pool; 