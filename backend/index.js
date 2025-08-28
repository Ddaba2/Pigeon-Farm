import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/config.js';
import {
  helmetConfig,
  rateLimiter,
  authRateLimiter,
  securityLogger,
  basicSecurity
} from './middleware/security.js';
import { globalErrorHandler, notFoundHandler } from './utils/errorHandler.js';
import { testDatabaseConnection } from './config/database.js';

// Import des routes
import authRouter from './routes/auth.js';
import couplesRouter from './routes/couples.js';
import passwordResetRouter from './routes/passwordReset.js';
import eggsRouter from './routes/eggs.js';
import pigeonneauxRouter from './routes/pigeonneaux.js';
import healthRouter from './routes/health.js';
import statisticsRouter from './routes/statistics.js';
import usersRouter from './routes/users.js';

const app = express();
const port = config.port;

// Configuration CORS
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Configuration des middlewares
app.use(cors(corsOptions));
app.use(helmetConfig);
app.use(rateLimiter);
app.use(securityLogger);
app.use(basicSecurity);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging des requêtes
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`📥 [${timestamp}] ${method} ${url} - ${ip}`);
  
  // Ajouter un timestamp à la requête
  req.requestTime = timestamp;
  
  next();
});

// Route de santé du serveur
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      version: '1.0.0',
      message: 'Serveur PigeonFarm opérationnel'
    }
  });
});

// Route de test de connectivité
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'API PigeonFarm accessible',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/api/auth/*',
        couples: '/api/couples/*',
        passwordReset: '/api/forgot-password, /api/verify-reset-code, /api/reset-password',
        eggs: '/api/eggs/*',
        pigeonneaux: '/api/pigeonneaux/*',
        health: '/api/health-records/*',
        statistics: '/api/statistics/*',
        users: '/api/users/*'
      }
    }
  });
});

// Configuration des routes API
app.use('/api/auth', authRateLimiter, authRouter);
app.use('/api/couples', couplesRouter);
app.use('/api/eggs', eggsRouter);
app.use('/api/pigeonneaux', pigeonneauxRouter);
app.use('/api/health-records', healthRouter);
app.use('/api/statistics', statisticsRouter);
app.use('/api/users', usersRouter);
app.use('/api', passwordResetRouter);

// Gestionnaire d'erreurs 404
app.use(notFoundHandler);

// Gestionnaire d'erreurs global
app.use(globalErrorHandler);

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('❌ Erreur non capturée:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Promesse rejetée non gérée:', err);
  process.exit(1);
});

// Démarrage du serveur
const server = app.listen(port, async () => {
  console.log('🚀 Serveur PigeonFarm démarré !');
  console.log(`📊 Mode: ${config.nodeEnv}`);
  console.log(`🌐 URL: http://localhost:${port}`);
  console.log(`🔒 Sécurité: Helmet, Rate Limiting, CORS configurés`);
  console.log(`🔐 Authentification: Simple (sans JWT)`);
  console.log(`📡 Routes disponibles:`);
  console.log(`   - /api/health (santé du serveur)`);
  console.log(`   - /api/test (test de connectivité)`);
  console.log(`   - /api/auth/* (authentification simple)`);
  console.log(`   - /api/couples/* (gestion des couples)`);
  console.log(`   - /api/eggs (œufs - temporaire)`);
  console.log(`   - /api/pigeonneaux (pigeonneaux - temporaire)`);
  console.log(`   - /api/health-records (santé - temporaire)`);
  console.log(`   - /api/statistics (statistiques - temporaire)`);
  console.log(`   - /api/users (utilisateurs - temporaire)`);
  console.log('');
  console.log('💡 Utilisez npm run dev pour le développement avec rechargement automatique');
  console.log('💡 Testez l\'API: http://localhost:3002/api/health');
  console.log('');
  
  // Test de connexion à la base de données
  console.log('🗄️ Test de connexion à la base de données...');
  try {
    const dbConnected = await testDatabaseConnection();
    if (dbConnected) {
      console.log('✅ Base de données connectée - Mode production activé');
    } else {
      console.log('⚠️ Base de données non connectée - Mode démo activé');
    }
  } catch (error) {
    console.log('⚠️ Erreur lors du test de connexion - Mode démo activé');
  }
});

// Gestion de l'arrêt gracieux
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Arrêt du serveur (${signal})...`);
  
  server.close(() => {
    console.log('✅ Serveur arrêté gracieusement');
    process.exit(0);
  });
  
  // Force l'arrêt si le serveur ne s'arrête pas dans les 10 secondes
  setTimeout(() => {
    console.error('❌ Arrêt forcé du serveur');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app; 