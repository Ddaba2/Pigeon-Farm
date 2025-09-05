const http = require('http');

function testGoogleAuth() {
  console.log('🧪 Test de l\'API Google Auth...');
  
  const testData = {
    email: 'test@example.com',
    name: 'Test User',
    picture: 'https://example.com/pic.jpg',
    googleId: '123456789'
  };
  
  console.log('📤 Envoi des données:', testData);
  
  const postData = JSON.stringify(testData);
  
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/auth/google',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    console.log('📊 Status:', res.statusCode);
    console.log('📋 Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('📦 Réponse:', JSON.stringify(jsonData, null, 2));
        
        if (res.statusCode === 200) {
          console.log('✅ Test réussi !');
        } else {
          console.log('❌ Test échoué !');
        }
      } catch (error) {
        console.log('📦 Réponse brute:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Erreur lors du test:', error.message);
  });
  
  req.write(postData);
  req.end();
}

// Attendre un peu que le serveur démarre
setTimeout(() => {
  testGoogleAuth();
}, 2000);
