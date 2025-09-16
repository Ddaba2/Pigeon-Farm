const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { config } = require('./config/config.js');
const {
  helmetConfig,
  rateLimiter,
  authRateLimiter,
  securityLogger,
  basicSecurity
} = require('./middleware/security.js');
const { globalErrorHandler, notFoundHandler } = require('./utils/errorHandler.js');
const { testDatabaseConnection } = require('./config/database.js');

// Import des routes
const authRouter = require('./routes/auth.js');
const passwordResetRouter = require('./routes/passwordReset.js');
const usersRouter = require('./routes/users.js');
const adminRouter = require('./routes/admin.js');
const couplesRouter = require('./routes/couples.js');
const eggsRouter = require('./routes/eggs.js');
const pigeonneauxRouter = require('./routes/pigeonneaux.js');
const healthRouter = require('./routes/health.js');
const statisticsRouter = require('./routes/statistics.js');
const salesRouter = require('./routes/sales.js');
const adminTrendsRouter = require('./routes/adminTrends.js');
const adminProfilesRouter = require('./routes/adminProfiles.js');
const adminDashboardRouter = require('./routes/adminDashboard.js');
const adminMetricsRouter = require('./routes/adminMetrics.js');
const notificationsRouter = require('./routes/notifications.js');

const app = express();
const port = config.port;

// Configuration CORS compatible Edge
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://localhost:3000',
    // Support pour Edge Enterprise et IE
    'http://localhost:*',
    'http://127.0.0.1:*'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'x-session-id',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: [
    'Set-Cookie',
    'x-session-id',
    'Access-Control-Allow-Credentials'
  ],
  optionsSuccessStatus: 200, // Pour la compatibilité IE/Edge Legacy
  preflightContinue: false
};

// Configuration des middlewares
app.use(cors(corsOptions));

// Middleware spécifique pour Edge - Headers de compatibilité
app.use((req, res, next) => {
  // Headers pour la compatibilité Edge/IE
  res.header('X-UA-Compatible', 'IE=edge');
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  
  // Headers de sécurité compatibles Edge
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'SAMEORIGIN');
  res.header('X-XSS-Protection', '1; mode=block');
  
  // Support pour les cookies SameSite
  if (req.headers.cookie) {
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  next();
});

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

// Route de santé pour les enregistrements (supprimée)

// Route de test de connectivité
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'API PigeonFarm accessible',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/api/auth/*',
        passwordReset: '/api/forgot-password, /api/verify-reset-code, /api/reset-password',
        users: '/api/users/*',
        couples: '/api/couples/*',
        eggs: '/api/eggs/*',
        pigeonneaux: '/api/pigeonneaux/*',
        health: '/api/health-records/*',
        statistics: '/api/statistics/*',
        sales: '/api/sales/*'
      }
    }
  });
});

// Configuration des routes API
app.use('/api/auth', authRateLimiter, authRouter);
app.use('/api/users', usersRouter);
app.use('/api', passwordResetRouter);
app.use('/api/couples', couplesRouter);
app.use('/api/eggs', eggsRouter);
app.use('/api/pigeonneaux', pigeonneauxRouter);
app.use('/api/health-records', healthRouter);
app.use('/api/statistics', statisticsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/notifications', notificationsRouter);

// Routes d'administration (ordre important - spécifiques avant générales)
app.use('/api/admin/trends', adminTrendsRouter);
app.use('/api/admin/profiles', adminProfilesRouter);
app.use('/api/admin/dashboard', adminDashboardRouter);
app.use('/api/admin/metrics', adminMetricsRouter);
app.use('/api/admin', adminRouter); // Routes générales admin en dernier

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
  console.log(`🔐 Authentification: Simple par session`);
  console.log(`📡 Routes disponibles:`);
  console.log(`   - /api/health (santé du serveur)`);
  console.log(`   - /api/test (test de connectivité)`);
  console.log(`   - /api/auth/* (authentification simple)`);
  console.log(`   - /api/users (utilisateurs)`);
  console.log(`   - /api/couples/* (gestion des couples)`);
  console.log(`   - /api/eggs/* (suivi des œufs)`);
  console.log(`   - /api/pigeonneaux/* (gestion des pigeonneaux)`);
  console.log(`   - /api/health-records/* (suivi de la santé)`);
  console.log(`   - /api/statistics/* (statistiques)`);
  console.log(`   - /api/sales/* (gestion des ventes)`);
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
    console.error('❌ Erreur lors du test de connexion:', error);
    console.log('⚠️ Mode démo activé');
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