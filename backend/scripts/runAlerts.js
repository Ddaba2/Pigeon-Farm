#!/usr/bin/env node

/**
 * Script pour exécuter les alertes automatiques
 * Peut être programmé avec un cron job ou une tâche planifiée
 */

const AlertService = require('../services/alertService.js');

async function runAlerts() {
  try {
    console.log('🚀 Démarrage des alertes automatiques...');
    console.log('⏰ Date:', new Date().toLocaleString('fr-FR'));
    
    const results = await AlertService.runAllAlerts();
    
    if (results) {
      console.log('✅ Alertes automatiques exécutées avec succès');
      console.log('📊 Résultats:', results);
    } else {
      console.error('❌ Erreur lors de l\'exécution des alertes automatiques');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Erreur fatale lors de l\'exécution des alertes:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  runAlerts();
}

module.exports = runAlerts;
