#!/usr/bin/env node

/**
 * Script de configuration complète de l'application PigeonFarm
 * 
 * Ce script :
 * 1. Initialise la base de données
 * 2. Crée l'utilisateur administrateur
 * 3. Affiche les instructions de démarrage
 */

const { initializeDatabase } = require('./init-database.js');
const { createSecureAdmin } = require('./create-admin-secure.js');
const fs = require('fs');
const path = require('path');

async function setupApplication() {
  console.log('🚀 Démarrage de la configuration de PigeonFarm');
  console.log('==========================================\n');
  
  try {
    // Vérifier si le fichier de configuration existe
    const configPath = path.join(__dirname, 'config.env');
    if (!fs.existsSync(configPath)) {
      console.warn('⚠️  Fichier config.env non trouvé, création d\'un exemple...');
      console.warn('💡 Veuillez vérifier et modifier les paramètres dans config.env si nécessaire\n');
    }
    
    // Étape 1 : Initialisation de la base de données
    console.log('📁 Étape 1 : Initialisation de la base de données');
    console.log('------------------------------------------------');
    await initializeDatabase();
    console.log('✅ Base de données initialisée avec succès\n');
    
    // Étape 2 : Création de l'administrateur
    console.log('👤 Étape 2 : Création de l\'utilisateur administrateur');
    console.log('----------------------------------------------------');
    await createSecureAdmin();
    console.log('✅ Administrateur créé avec succès\n');
    
    // Étape 3 : Instructions de démarrage
    console.log('🏁 Étape 3 : Instructions de démarrage');
    console.log('--------------------------------------');
    console.log('Pour démarrer l\'application :');
    console.log('1. Démarrez le serveur backend :');
    console.log('   → cd backend');
    console.log('   → npm start');
    console.log('');
    console.log('2. Dans un autre terminal, démarrez le frontend :');
    console.log('   → npm run dev');
    console.log('');
    console.log('3. Accédez à l\'application :');
    console.log('   → http://localhost:5173');
    console.log('');
    console.log('🔐 Identifiants administrateur :');
    console.log('   Utilisateur : admin');
    console.log('   Mot de passe : AdminPigeonFarm2024!');
    console.log('   (Changez ce mot de passe après la première connexion)');
    console.log('');
    
    console.log('🎉 Configuration terminée avec succès !');
    console.log('=====================================\n');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration :', error.message);
    process.exit(1);
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  setupApplication();
}

module.exports = { setupApplication };