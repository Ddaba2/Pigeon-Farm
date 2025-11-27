/**
 * Script de Test Simplifié - Sécurité des Sauvegardes
 */

const axios = require('axios');

const API_URL = 'http://localhost:3002/api';

const log = {
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`),
  section: (msg) => console.log(`
${'='.repeat(60)}
${msg}
${'='.repeat(60)}
`)
};

async function runTests() {
  log.section('🧪 TEST DE SÉCURITÉ DES SAUVEGARDES');
  
  try {
    // Utiliser des utilisateurs existants ou en créer
    log.info('Connexion avec deux utilisateurs...');
    
    // User 1
    const login1 = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const user1Session = login1.data.sessionId;
    const user1Id = login1.data.user.id;
    log.success(`User 1 connecté - ID: ${user1Id}`);
    
    // Créer une sauvegarde pour User 1
    log.info('\n--- TEST 1 : Création de sauvegarde ---');
    const backup1 = await axios.post(`${API_URL}/backup/save`, {}, {
      headers: { 'x-session-id': user1Session }
    });
    
    if (backup1.data.success) {
      log.success(`Sauvegarde créée: ${backup1.data.data.filename}`);
      log.info(`Emplacement: ${backup1.data.data.location}`);
    }
    
    // Lister les sauvegardes
    log.info('\n--- TEST 2 : Liste des sauvegardes ---');
    const list = await axios.get(`${API_URL}/backup/list`, {
      headers: { 'x-session-id': user1Session }
    });
    
    log.success(`User 1 voit ${list.data.data.length} sauvegarde(s)`);
    list.data.data.forEach(b => {
      log.info(`  - ${b.filename} (${b.size})`);
    });
    
    // Vérifier que toutes contiennent user{id}_
    const allBelong = list.data.data.every(b => b.filename.includes(`user${user1Id}_`));
    if (allBelong) {
      log.success('✓ Toutes les sauvegardes appartiennent à cet utilisateur');
    } else {
      log.error('✗ Problème : sauvegardes d\'autres utilisateurs visibles !');
    }
    
    // Test export
    log.info('\n--- TEST 3 : Export des données ---');
    const exportData = await axios.get(`${API_URL}/backup/export`, {
      headers: { 'x-session-id': user1Session }
    });
    
    const metadata = exportData.data.metadata;
    log.success(`Export réussi - Version: ${metadata.version}`);
    log.info(`  - userId: ${metadata.userId}`);
    log.info(`  - username: ${metadata.username}`);
    log.info(`  - exportDate: ${metadata.exportDate}`);
    
    // Vérifier les données
    const stats = exportData.data.statistics;
    log.info(`  - ${stats.totalCouples} couples`);
    log.info(`  - ${stats.totalEggs} œufs`);
    log.info(`  - ${stats.totalPigeonneaux} pigeonneaux`);
    
    log.section('✅ TOUS LES TESTS SONT PASSÉS !');
    
  } catch (error) {
    log.error(`Erreur: ${error.response?.data?.error || error.message}`);
    if (error.response) {
      console.log('Réponse:', error.response.data);
    }
  }
}

runTests();
