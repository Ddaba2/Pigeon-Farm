const http = require('http');

// Test de connexion d'abord
function testLogin() {
  console.log('🔐 Test de connexion...');
  
  const loginData = JSON.stringify({
    username: 'testuser',
    password: 'testpass123'
  });
  
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Login Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Login Response:', JSON.stringify(response, null, 2));
        
        if (response.success && response.sessionId) {
          console.log('🔑 Session ID obtenu:', response.sessionId);
          // Test health-records avec la session
          testHealthWithSession(response.sessionId);
        }
      } catch (e) {
        console.log('📄 Login Response brute:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Erreur Login:', err.message);
  });

  req.write(loginData);
  req.end();
}

// Test health-records avec session
function testHealthWithSession(sessionId) {
  console.log('\n🔍 Test health-records avec session...');
  
  const healthData = {
    type: 'examen',
    targetType: 'couple',
    targetId: 1,
    product: 'Test Product',
    date: '2025-01-09',
    observations: 'Test observation'
  };
  
  const postData = JSON.stringify(healthData);
  
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/health-records',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'x-session-id': sessionId
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Health Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Health Response:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('📄 Health Response brute:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Erreur Health:', err.message);
  });

  req.write(postData);
  req.end();
}

// Test health-records sans session (devrait échouer)
function testHealthWithoutSession() {
  console.log('\n🔍 Test health-records sans session (devrait échouer)...');
  
  const healthData = {
    type: 'examen',
    targetType: 'couple',
    targetId: 1,
    product: 'Test Product',
    date: '2025-01-09',
    observations: 'Test observation'
  };
  
  const postData = JSON.stringify(healthData);
  
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
    console.log(`📡 Health sans session Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Health sans session Response:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('📄 Health sans session Response brute:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Erreur Health sans session:', err.message);
  });

  req.write(postData);
  req.end();
}

// Exécuter les tests
console.log('🚀 Démarrage des tests...\n');

// Test sans session d'abord
testHealthWithoutSession();

// Puis test avec connexion
setTimeout(testLogin, 2000);
