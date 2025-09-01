const http = require('http');

function checkServer() {
  console.log('🔍 Vérification du serveur backend...');
  
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/health',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Serveur accessible - Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📊 Réponse du serveur:', response.data.message);
      } catch (e) {
        console.log('📄 Réponse brute:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.log('❌ Serveur non accessible:', err.message);
    console.log('💡 Solutions:');
    console.log('   1. Vérifiez que le serveur est démarré');
    console.log('   2. Exécutez: cd backend && npm start');
    console.log('   3. Vérifiez qu\'aucun autre service n\'utilise le port 3002');
  });

  req.on('timeout', () => {
    console.log('⏰ Timeout - Le serveur ne répond pas');
    req.destroy();
  });

  req.end();
}

checkServer();
