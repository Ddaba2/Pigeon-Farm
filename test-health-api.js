const http = require('http');

// Test des données de santé
const testHealthData = {
  type: 'examen', // Test avec 'examen' au lieu de 'exam'
  targetType: 'couple',
  targetId: 1,
  product: 'Test Product',
  date: '2025-01-09',
  observations: 'Test observation'
};

function testHealthAPI() {
  console.log('🔍 Test de l\'API health-records...');
  console.log('📊 Données de test:', JSON.stringify(testHealthData, null, 2));
  
  const postData = JSON.stringify(testHealthData);
  
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/health-records',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);
    console.log(`📡 Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Réponse:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('📄 Réponse brute:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Erreur:', err.message);
  });

  req.write(postData);
  req.end();
}

// Test de l'endpoint GET
function testHealthGet() {
  console.log('\n🔍 Test de l\'endpoint GET /api/health-records...');
  
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/health-records',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Réponse GET:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('📄 Réponse brute:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Erreur GET:', err.message);
  });

  req.end();
}

// Exécuter les tests
testHealthAPI();
setTimeout(testHealthGet, 1000);
