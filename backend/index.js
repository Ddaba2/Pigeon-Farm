import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cookieParser from 'cookie-parser';

// Routes
import couplesRouter from './routes/couples.js';
import eggsRouter from './routes/eggs.js';
import pigeonneauxRouter from './routes/pigeonneaux.js';
import healthRecordsRouter from './routes/healthRecords.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import auditLogsRouter from './routes/auditLogs.js';
import notificationsRouter, { setSocketIO as setNotificationsSocketIO } from './routes/notifications.js';
import exportsRouter from './routes/exports.js';
import backupRouter from './routes/backup.js';
import statisticsRouter from './routes/statistics.js';
import salesRouter from './routes/sales.js';

// Middlewares
import authenticateToken from './middleware/auth.js';
import requireRole from './middleware/roles.js';

// Middlewares de sécurité
import {
  helmetConfig,
  rateLimiter,
  authRateLimiter,
  securityLogger,
  basicSecurity
} from './middleware/security.js';

import {
  getCSRFToken
} from './middleware/csrf.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Configuration CORS
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'http://127.0.0.1:5173', 
    'http://localhost:3000'
  ],
  credentials: true
};

// Création du serveur HTTP
const server = http.createServer(app);

// Configuration Socket.io
const io = new SocketIOServer(server, {
  cors: corsOptions
});

// Gestion de la connexion Socket.io
io.on('connection', (socket) => {
  console.log('🔌 Client connecté à Socket.io');
});

// Configuration des middlewares
app.use(cors(corsOptions));
app.use(helmetConfig);
// app.use(rateLimiter); // Désactivé temporairement pour le développement
app.use(securityLogger);
app.use(basicSecurity);
app.use(cookieParser());
app.use(express.json());

// Route pour obtenir un token CSRF (sans authentification pour l'initialisation)
app.get('/api/csrf-token', async (req, res) => {
  // Générer un token temporaire pour l'initialisation
  const crypto = await import('crypto');
  const tempToken = crypto.randomBytes(32).toString('hex');
  res.setHeader('X-CSRF-Token', tempToken);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  res.json({ 
    csrfToken: tempToken,
    expiresIn: 30 * 60 * 1000
  });
});

// Route pour obtenir un token CSRF authentifié
app.get('/api/csrf-token/auth', authenticateToken, getCSRFToken);

// Configuration des routes
app.use('/api/couples', authenticateToken, couplesRouter);
app.use('/api/eggs', authenticateToken, eggsRouter);
app.use('/api/pigeonneaux', authenticateToken, pigeonneauxRouter);
app.use('/api/health-records', authenticateToken, healthRecordsRouter);
app.use('/api/users', authenticateToken, requireRole('admin'), usersRouter);
app.use('/api/auth', authRateLimiter, authRouter);
app.use('/api/audit-logs', authenticateToken, requireRole('admin'), auditLogsRouter);
app.use('/api/notifications', authenticateToken, notificationsRouter);
app.use('/api/exports', authenticateToken, exportsRouter);
app.use('/api/backup', authenticateToken, requireRole('admin'), backupRouter);
app.use('/api/statistics', authenticateToken, statisticsRouter);
app.use('/api/sales', authenticateToken, salesRouter);

// Configuration des notifications Socket.io
setNotificationsSocketIO(io);

// Route de test de connexion
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    protocol: req.protocol,
    secure: req.secure
  });
});

// Test de connexion à la base de données
const testDatabaseConnection = async () => {
  try {
    const db = await import('./db.js');
    await db.default.query('SELECT 1');
    console.log('✅ Connexion à la base de données réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
  }
};

// Démarrage du serveur
const startServer = async () => {
  await testDatabaseConnection();
  
  server.listen(port, () => {
    console.log(`🚀 Serveur HTTP démarré sur le port ${port}`);
    console.log(`📊 Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 URL: http://localhost:${port}`);
  });
};

// Gestion des erreurs
server.on('error', (error) => {
  console.error('❌ Erreur serveur HTTP:', error);
});

// Gestion de l'arrêt gracieux
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Arrêt du serveur (${signal})...`);
  
  server.close(() => {
    console.log('✅ Serveur HTTP arrêté');
  });
  
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Démarrage
startServer();