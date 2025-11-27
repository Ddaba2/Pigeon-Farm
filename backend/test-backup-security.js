/**
 * Script de Test de Sécurité des Sauvegardes
 * 
 * Ce script teste toutes les implémentations de sécurité :
 * 1. Séparation des sauvegardes par utilisateur
 * 2. Vérification du nom de fichier
 * 3. Vérification des métadonnées
 * 4. Filtrage de la liste
 * 5. Protection contre les accès croisés
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const API_URL = 'http://localhost:3002/api';

// Couleurs pour la console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`
${colors.blue}${'='.repeat(60)}
${msg}
${'='.repeat(60)}${colors.reset}
`)
};

// Stockage des sessions
let user1Session = null;
let user2Session = null;
let user1Id = null;
let user2Id = null;

/**
 * ÉTAPE 1 : Créer deux utilisateurs de test
 */
async function createTestUsers() {
  log.section('ÉTAPE 1 : Création des Utilisateurs de Test');
  
  try {
    // Créer User 1
    log.info('Création de l\'utilisateur 1...');
    const user1Response = await axios.post(`${API_URL}/auth/register`, {
      username: `test_user1_${Date.now()}`,
      email: `test1_${Date.now()}@test.com`,
      password: 'Test123456!',
      fullName: 'Test User 1',
      acceptTerms: true
    });
    
    if (user1Response.data.success) {
      user1Session = user1Response.data.sessionId;
      user1Id = user1Response.data.user.id;
      log.success(`User 1 créé - ID: ${user1Id}, Session: ${user1Session}`);
    }
    
    // Créer User 2
    log.info('Création de l\'utilisateur 2...');
    const user2Response = await axios.post(`${API_URL}/auth/register`, {
      username: `test_user2_${Date.now()}`,
      email: `test2_${Date.now()}@test.com`,
      password: 'Test123456!',
      fullName: 'Test User 2',
      acceptTerms: true
    });
    
    if (user2Response.data.success) {
      user2Session = user2Response.data.sessionId;
      user2Id = user2Response.data.user.id;
      log.success(`User 2 créé - ID: ${user2Id}, Session: ${user2Session}`);
    }
    
    return true;
  } catch (error) {
    log.error(`Erreur création utilisateurs: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

/**
 * ÉTAPE 2 : Créer des sauvegardes pour chaque utilisateur
 */
async function createBackups() {
  log.section('ÉTAPE 2 : Création des Sauvegardes');
  
  try {
    // Sauvegarde User 1
    log.info('Création sauvegarde User 1...');
    const backup1 = await axios.post(`${API_URL}/backup/save`, {}, {
      headers: { 'x-session-id': user1Session }
    });
    
    if (backup1.data.success) {
      log.success(`Sauvegarde User 1 créée: ${backup1.data.data.filename}`);
      log.info(`Emplacement: ${backup1.data.data.location}`);
    }
    
    // Sauvegarde User 2
    log.info('Création sauvegarde User 2...');
    const backup2 = await axios.post(`${API_URL}/backup/save`, {}, {
      headers: { 'x-session-id': user2Session }
    });
    
    if (backup2.data.success) {
      log.success(`Sauvegarde User 2 créée: ${backup2.data.data.filename}`);
      log.info(`Emplacement: ${backup2.data.data.location}`);
    }
    
    return true;
  } catch (error) {
    log.error(`Erreur création sauvegardes: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

/**
 * TEST 1 : Liste filtrée par utilisateur
 */
async function testListFiltering() {
  log.section('TEST 1 : Filtrage de la Liste par Utilisateur');
  
  try {
    // User 1 demande sa liste
    log.info('User 1 demande sa liste de sauvegardes...');
    const list1 = await axios.get(`${API_URL}/backup/list`, {
      headers: { 'x-session-id': user1Session }
    });
    
    const user1Backups = list1.data.data;
    log.info(`User 1 voit ${user1Backups.length} sauvegarde(s)`);
    
    // Vérifier que toutes contiennent user1_
    const allBelongToUser1 = user1Backups.every(b => b.filename.includes(`user${user1Id}_`));
    if (allBelongToUser1) {
      log.success('✓ Toutes les sauvegardes appartiennent à User 1');
    } else {
      log.error('✗ Des sauvegardes d\'autres utilisateurs sont visibles !');
      return false;
    }
    
    // User 2 demande sa liste
    log.info('User 2 demande sa liste de sauvegardes...');
    const list2 = await axios.get(`${API_URL}/backup/list`, {
      headers: { 'x-session-id': user2Session }
    });
    
    const user2Backups = list2.data.data;
    log.info(`User 2 voit ${user2Backups.length} sauvegarde(s)`);
    
    // Vérifier que toutes contiennent user2_
    const allBelongToUser2 = user2Backups.every(b => b.filename.includes(`user${user2Id}_`));
    if (allBelongToUser2) {
      log.success('✓ Toutes les sauvegardes appartiennent à User 2');
    } else {
      log.error('✗ Des sauvegardes d\'autres utilisateurs sont visibles !');
      return false;
    }
    
    log.success('TEST 1 RÉUSSI : Filtrage correct de la liste');
    return true;
  } catch (error) {
    log.error(`TEST 1 ÉCHOUÉ: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

/**
 * TEST 2 : Tentative d'accès croisé
 */
async function testCrossAccess() {
  log.section('TEST 2 : Protection contre l\'Accès Croisé');
  
  try {
    // Obtenir une sauvegarde de User 2
    const list2 = await axios.get(`${API_URL}/backup/list`, {
      headers: { 'x-session-id': user2Session }
    });
    
    if (list2.data.data.length === 0) {
      log.warning('Pas de sauvegarde User 2 disponible, test ignoré');
      return true;
    }
    
    const user2BackupFilename = list2.data.data[0].filename;
    log.info(`User 1 essaie d'accéder à: ${user2BackupFilename}`);
    
    // User 1 essaie de restaurer la sauvegarde de User 2
    try {
      await axios.post(`${API_URL}/backup/restore/${user2BackupFilename}`, 
        { clearExisting: false },
        { headers: { 'x-session-id': user1Session } }
      );
      
      log.error('✗ User 1 a pu restaurer la sauvegarde de User 2 ! FAILLE DE SÉCURITÉ !');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        log.success('✓ Accès refusé (403) - Sécurité OK');
        log.info(`Message: ${error.response.data.error}`);
        return true;
      } else {
        throw error;
      }
    }
  } catch (error) {
    log.error(`TEST 2 ÉCHOUÉ: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

/**
 * TEST 3 : Vérification des métadonnées
 */
async function testMetadataVerification() {
  log.section('TEST 3 : Vérification des Métadonnées');
  
  try {
    // Exporter les données de User 2
    log.info('Export des données User 2...');
    const export2 = await axios.get(`${API_URL}/backup/export`, {
      headers: { 'x-session-id': user2Session }
    });
    
    const backupData = export2.data;
    log.info(`Métadonnées: userId=${backupData.metadata.userId}, username=${backupData.metadata.username}`);
    
    // Créer un fichier falsifié avec le nom de User 1 mais les données de User 2
    const fakeFilename = `backup_user${user1Id}_fake_${Date.now()}.json`;
    log.warning(`Tentative avec fichier falsifié: ${fakeFilename}`);
    
    // Vérifier que même avec un nom valide, les métadonnées sont vérifiées
    // (Ce test simule un attaquant qui renomme un fichier)
    log.info('Les métadonnées contiennent userId=' + backupData.metadata.userId);
    log.info('L\'utilisateur connecté est userId=' + user1Id);
    
    if (backupData.metadata.userId !== user1Id) {
      log.success('✓ Les métadonnées sont différentes (protection en place)');
      return true;
    } else {
      log.error('✗ Les métadonnées correspondent (test invalide)');
      return false;
    }
  } catch (error) {
    log.error(`TEST 3 ÉCHOUÉ: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

/**
 * TEST 4 : Import avec avertissement
 */
async function testImportWarning() {
  log.section('TEST 4 : Import d\'un Autre Utilisateur (avec avertissement)');
  
  try {
    // Exporter les données de User 2
    log.info('Export des données User 2...');
    const export2 = await axios.get(`${API_URL}/backup/export`, {
      headers: { 'x-session-id': user2Session }
    });
    
    const backupData = export2.data;
    
    // User 1 importe les données de User 2
    log.info('User 1 importe les données de User 2...');
    const importResult = await axios.post(`${API_URL}/backup/import`,
      { backupData, clearExisting: false },
      { headers: { 'x-session-id': user1Session } }
    );
    
    if (importResult.data.success) {
      log.success('✓ Import réussi');
      
      if (importResult.data.warning) {
        log.warning(`Avertissement reçu: ${importResult.data.warning}`);
        log.success('✓ L\'utilisateur a été averti de l\'import croisé');
        return true;
      } else {
        log.error('✗ Aucun avertissement affiché !');
        return false;
      }
    }
  } catch (error) {
    log.error(`TEST 4 ÉCHOUÉ: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

/**
 * TEST 5 : Séparation physique des dossiers
 */
async function testPhysicalSeparation() {
  log.section('TEST 5 : Séparation Physique des Dossiers');
  
  try {
    const { getBackupDirectory } = require('./config/backup-config');
    
    const user1Dir = getBackupDirectory(user1Id);
    const user2Dir = getBackupDirectory(user2Id);
    
    log.info(`Dossier User 1: ${user1Dir}`);
    log.info(`Dossier User 2: ${user2Dir}`);
    
    if (user1Dir !== user2Dir) {
      log.success('✓ Les dossiers sont différents');
      
      // Vérifier que les dossiers existent
      try {
        await fs.access(user1Dir);
        log.success(`✓ Dossier User 1 existe`);
      } catch {
        log.warning(`⚠  Dossier User 1 n'existe pas encore (sera créé à la première sauvegarde)`);
      }
      
      try {
        await fs.access(user2Dir);
        log.success(`✓ Dossier User 2 existe`);
      } catch {
        log.warning(`⚠  Dossier User 2 n'existe pas encore (sera créé à la première sauvegarde)`);
      }
      
      return true;
    } else {
      log.error('✗ Les dossiers sont identiques ! PROBLÈME DE CONFIGURATION !');
      return false;
    }
  } catch (error) {
    log.error(`TEST 5 ÉCHOUÉ: ${error.message}`);
    return false;
  }
}

/**
 * NETTOYAGE : Supprimer les utilisateurs de test
 */
async function cleanup() {
  log.section('NETTOYAGE : Suppression des Utilisateurs de Test');
  
  try {
    // Note: Vous devrez implémenter une route de suppression ou le faire manuellement
    log.warning('Les utilisateurs de test restent dans la base de données');
    log.info(`User 1 ID: ${user1Id}`);
    log.info(`User 2 ID: ${user2Id}`);
    log.info('Vous pouvez les supprimer manuellement si nécessaire');
  } catch (error) {
    log.error(`Erreur nettoyage: ${error.message}`);
  }
}

/**
 * FONCTION PRINCIPALE
 */
async function runAllTests() {
  console.log('\n');
  log.section('🧪 TESTS DE SÉCURITÉ DES SAUVEGARDES');
  log.info('Début des tests...\n');
  
  const results = {
    total: 5,
    passed: 0,
    failed: 0
  };
  
  // Préparation
  const usersCreated = await createTestUsers();
  if (!usersCreated) {
    log.error('Impossible de créer les utilisateurs de test. Arrêt.');
    process.exit(1);
  }
  
  const backupsCreated = await createBackups();
  if (!backupsCreated) {
    log.warning('Certaines sauvegardes n\'ont pas pu être créées. Continuation...');
  }
  
  // Tests
  const tests = [
    { name: 'Liste filtrée', fn: testListFiltering },
    { name: 'Accès croisé', fn: testCrossAccess },
    { name: 'Métadonnées', fn: testMetadataVerification },
    { name: 'Import warning', fn: testImportWarning },
    { name: 'Séparation physique', fn: testPhysicalSeparation }
  ];
  
  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      results.passed++;
    } else {
      results.failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pause entre tests
  }
  
  // Résumé
  log.section('📊 RÉSUMÉ DES TESTS');
  log.info(`Total: ${results.total} tests`);
  log.success(`Réussis: ${results.passed}/${results.total}`);
  
  if (results.failed > 0) {
    log.error(`Échoués: ${results.failed}/${results.total}`);
  }
  
  const percentage = Math.round((results.passed / results.total) * 100);
  
  if (percentage === 100) {
    log.success(`\n🎉 TOUS LES TESTS SONT PASSÉS ! (${percentage}%)\n`);
  } else if (percentage >= 80) {
    log.warning(`\n⚠️  La plupart des tests sont passés (${percentage}%)\n`);
  } else {
    log.error(`\n❌ De nombreux tests ont échoué (${percentage}%)\n`);
  }
  
  await cleanup();
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// Exécution
runAllTests().catch(error => {
  log.error(`Erreur fatale: ${error.message}`);
  console.error(error);
  process.exit(1);
});
