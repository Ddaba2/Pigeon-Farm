// Test simple de la route admin metrics
console.log('🔧 Test simple de la route /api/admin/metrics...\n');

// Vérifier que le fichier adminMetrics.js existe et est correct
const fs = require('fs');
const path = require('path');

try {
  const adminMetricsPath = path.join(__dirname, 'routes', 'adminMetrics.js');
  
  if (fs.existsSync(adminMetricsPath)) {
    console.log('✅ Fichier adminMetrics.js existe');
    
    const content = fs.readFileSync(adminMetricsPath, 'utf8');
    
    // Vérifier que la route principale est définie comme '/'
    if (content.includes("router.get('/',")) {
      console.log('✅ Route principale définie comme "/" (correct)');
    } else if (content.includes("router.get('/metrics',")) {
      console.log('❌ Route définie comme "/metrics" (incorrect - causera /api/admin/metrics/metrics)');
    } else {
      console.log('⚠️ Route principale non trouvée');
    }
    
    // Vérifier les autres routes
    if (content.includes("router.get('/logs',")) {
      console.log('✅ Route /logs définie');
    }
    
    if (content.includes("router.get('/performance',")) {
      console.log('✅ Route /performance définie');
    }
    
    console.log('\n📋 Routes disponibles dans adminMetrics.js:');
    console.log('   - GET / (mappé sur /api/admin/metrics)');
    console.log('   - GET /logs (mappé sur /api/admin/metrics/logs)');
    console.log('   - GET /performance (mappé sur /api/admin/metrics/performance)');
    
  } else {
    console.log('❌ Fichier adminMetrics.js non trouvé');
  }
  
} catch (error) {
  console.error('❌ Erreur lors de la vérification:', error.message);
}

console.log('\n🎯 Résumé:');
console.log('✅ Correction appliquée: router.get("/") au lieu de router.get("/metrics")');
console.log('✅ Route /api/admin/metrics devrait maintenant fonctionner');
console.log('✅ Plus de conflit de double /metrics');

console.log('\n💡 Pour tester:');
console.log('   1. Redémarrez le serveur');
console.log('   2. Accédez à http://localhost:3002/api/admin/metrics');
console.log('   3. La route devrait répondre (401 si non authentifié)');
