const dotenv = require('dotenv');
const path = require('path');

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../config.env') });

const config = {
  // Configuration du serveur
  port: process.env.PORT || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Configuration de sécurité
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  
  // Configuration CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
    credentials: true
  },
  
  // Configuration de la base de données (pour plus tard)
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'pigeonfarm',
    port: parseInt(process.env.DB_PORT) || 3306
  }
};

module.exports = { config }; 