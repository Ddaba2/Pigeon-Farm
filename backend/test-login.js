const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🧪 Test de l\'API de connexion...');
    
    const response = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    
    console.log('📊 Statut:', response.status);
    console.log('📄 Réponse:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testLogin(); 