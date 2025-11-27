const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport');
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

// Les sessions sont maintenant gérées par backend/middleware/auth.js
// et stockées dans MySQL (table sessions)

// Import des routes
const authRouter = require('./routes/auth.js');
const oauthRouter = require('./routes/oauth.js');
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
const alertsRouter = require('./routes/alerts.js');
const userPreferencesRouter = require('./routes/userPreferences.js');
const archiveRouter = require('./routes/archive.js');
const backupRouter = require('./routes/backup.js');

const app = express();
const port = config.port;

// Configuration CORS compatible avec l'application desktop
const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://localhost:3000',
      'http://localhost:3002', // Backend server itself
      'http://localhost:3005', // Standalone desktop app
      'http://127.0.0.1:3005',
      // URLs de redirection OAuth
      process.env.FRONTEND_SUCCESS_URI,
      process.env.FRONTEND_ERROR_URI
    ].filter(Boolean); // Supprimer les valeurs undefined
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('🚫 CORS bloqué pour origin:', origin);
      callback(new Error('Non autorisé par CORS'));
    }
  },
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

// Configuration de session pour Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret_key_here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

// Initialisation de Passport
app.use(passport.initialize());
app.use(passport.session());

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

// Servir les fichiers statiques du frontend (pour le mode desktop)
app.use(express.static('dist'));

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
app.use('/api/oauth', oauthRouter); // Routes OAuth Google
app.use('/api/users', usersRouter);
app.use('/api', passwordResetRouter);
app.use('/api/couples', couplesRouter);
app.use('/api/eggs', eggsRouter);
app.use('/api/pigeonneaux', pigeonneauxRouter);
app.use('/api/health-records', healthRouter);
app.use('/api/statistics', statisticsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/user-preferences', userPreferencesRouter);
app.use('/api/archive', archiveRouter);
app.use('/api/backup', backupRouter);

// Routes d'administration (ordre important - spécifiques avant générales)
app.use('/api/admin/trends', adminTrendsRouter);
app.use('/api/admin/profiles', adminProfilesRouter);
app.use('/api/admin/dashboard', adminDashboardRouter);
app.use('/api/admin/metrics', adminMetricsRouter);
app.use('/api/admin', adminRouter); // Routes générales admin en dernier

// Route pour servir l'application frontend (toutes les autres routes renvoient index.html)
app.get('*', (req, res) => {
  // Si nous sommes en mode desktop, servir le fichier index.html du build
  res.sendFile(__dirname + '/dist/index.html', (err) => {
    if (err) {
      // En mode développement ou si le fichier n'existe pas, renvoyer une page de base
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>PigeonFarm</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1>PigeonFarm Application</h1>
          <p>L'application est en cours de chargement...</p>
          <p>Si vous voyez ce message, cela signifie que le frontend n'a pas encore été construit.</p>
          <p>Veuillez exécuter "npm run build" dans le répertoire racine du projet.</p>
        </body>
        </html>
      `);
    }
  });
});

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
  console.log(`🔐 Authentification: Session + Google OAuth`);
  console.log(`📡 Routes disponibles:`);
  console.log(`   - /api/health (santé du serveur)`);
  console.log(`   - /api/test (test de connectivité)`);
  console.log(`   - /api/auth/* (authentification simple)`);
  console.log(`   - /api/oauth/* (authentification Google OAuth)`);
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
  
  // Indiquer que le serveur est prêt pour l'application desktop
  console.log('🏠 Serveur prêt pour l\'application desktop');
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