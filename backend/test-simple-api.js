import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3002';

async function testSimpleAPI() {
  console.log('🧪 Test simple de l\'API...\n');

  try {
    // Test simple de connexion
    console.log('1️⃣ Test de connexion...');
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    console.log('📊 Statut réponse:', response.status);
    console.log('📋 Headers:', response.headers);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Données reçues:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur:', errorText);
    }

  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.error('🔍 Détails:', error);
  }
}

testSimpleAPI(); 