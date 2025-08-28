import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3002';

async function testWithDolo() {
  console.log('🧪 Test de l\'API avec l\'utilisateur dolo...\n');

  try {
    // 1. Test de connexion avec dolo
    console.log('1️⃣ Test de connexion avec dolo...');
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'dolo',
        password: 'dolo123' // ✅ Nouveau mot de passe
      })
    });

    console.log('📊 Statut réponse:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Connexion réussie:', data);
      
      // Récupérer le cookie de session
      const cookies = response.headers.get('set-cookie');
      console.log('🍪 Cookie de session:', cookies ? 'OUI' : 'NON');
      
      // 2. Test de récupération des couples
      console.log('\n2️⃣ Test de récupération des couples...');
      const couplesResponse = await fetch(`${BASE_URL}/api/couples`, {
        headers: { 'Cookie': cookies || '' }
      });

      console.log('📊 Statut couples:', couplesResponse.status);
      
      if (couplesResponse.ok) {
        const couplesResult = await couplesResponse.json();
        console.log('✅ Couples récupérés:', couplesResult);
      } else {
        const errorText = await couplesResponse.text();
        console.log('❌ Erreur couples:', errorText);
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur de connexion:', errorText);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testWithDolo(); 