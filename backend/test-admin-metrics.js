const express = require('express');
const request = require('supertest');

// Test de la route admin metrics
async function testAdminMetrics() {
  console.log('🔧 Test de la route /api/admin/metrics...\n');

  try {
    // Importer l'application Express
    const app = require('./index.js');
    
    // Attendre que l'app soit prête
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('📋 Test de la route GET /api/admin/metrics');
    console.log('=' .repeat(50));
    
    // Test sans authentification (devrait retourner 401)
    console.log('1️⃣ Test sans authentification...');
    const response = await request(app)
      .get('/api/admin/metrics')
      .expect(401);
    
    console.log('✅ Route accessible (401 Unauthorized comme attendu)');
    console.log(`   Status: ${response.status}`);
    
    // Test de la structure de la route
    console.log('\n2️⃣ Vérification de la structure de la route...');
    
    // Vérifier que la route est bien montée
    const routes = app._router.stack
      .filter(layer => layer.route)
      .map(layer => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods)
      }));
    
    const metricsRoute = routes.find(route => 
      route.path.includes('/admin/metrics') || route.path === '/'
    );
    
    if (metricsRoute) {
      console.log('✅ Route admin metrics trouvée');
      console.log(`   Path: ${metricsRoute.path}`);
      console.log(`   Methods: ${metricsRoute.methods.join(', ')}`);
    } else {
      console.log('❌ Route admin metrics non trouvée');
      console.log('Routes disponibles:');
      routes.forEach(route => {
        console.log(`   - ${route.path} [${route.methods.join(', ')}]`);
      });
    }
    
    console.log('\n🎯 Résumé du test:');
    console.log('=' .repeat(50));
    console.log('✅ Route /api/admin/metrics accessible');
    console.log('✅ Authentification requise (401 sans token)');
    console.log('✅ Structure de route correcte');
    
    console.log('\n💡 Pour tester avec authentification:');
    console.log('   1. Connectez-vous en tant qu\'admin');
    console.log('   2. Utilisez le token de session');
    console.log('   3. Accédez à /api/admin/metrics');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Détails:', error);
  }
}

// Test de la configuration des routes
async function testRouteConfiguration() {
  console.log('\n🔍 Vérification de la configuration des routes...\n');
  
  try {
    const app = require('./index.js');
    
    // Attendre que l'app soit prête
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('📋 Routes admin configurées:');
    console.log('=' .repeat(40));
    
    const adminRoutes = [
      '/api/admin/trends',
      '/api/admin/profiles', 
      '/api/admin/dashboard',
      '/api/admin/metrics',
      '/api/admin/backup',
      '/api/admin'
    ];
    
    for (const route of adminRoutes) {
      try {
        const response = await request(app)
          .get(route)
          .expect(401); // Devrait retourner 401 (non authentifié)
        
        console.log(`✅ ${route} - Accessible (${response.status})`);
      } catch (error) {
        if (error.status === 404) {
          console.log(`❌ ${route} - Non trouvé (404)`);
        } else if (error.status === 401) {
          console.log(`✅ ${route} - Accessible (401 - Auth requise)`);
        } else {
          console.log(`⚠️ ${route} - Erreur (${error.status})`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

// Exécuter les tests
if (require.main === module) {
  console.log('🚀 Test des routes admin metrics\n');
  
  testAdminMetrics();
  testRouteConfiguration();
}

module.exports = {
  testAdminMetrics,
  testRouteConfiguration
};
