import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3002';

async function testDebug() {
  console.log('🐛 Débogage de l\'API PigeonFarm...\n');

  try {
    // 1. Test de connexion au serveur
    console.log('1️⃣ Test de connexion au serveur...');
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur de connexion: ${response.status}`);
    }

    const loginData = await response.json();
    console.log('✅ Connexion réussie:', loginData.success ? 'OUI' : 'NON');
    
    if (!loginData.success) {
      console.log('❌ Erreur de connexion:', loginData.error);
      return;
    }

    // Récupérer l'ID de l'utilisateur connecté
    const userId = loginData.user.id;
    console.log('🆔 ID utilisateur connecté:', userId);

    // Récupérer le cookie de session
    const cookies = response.headers.get('set-cookie');
    console.log('🍪 Cookie de session:', cookies ? 'OUI' : 'NON');

    // 2. Test de récupération des couples
    console.log('\n2️⃣ Test de récupération des couples...');
    const couplesResponse = await fetch(`${BASE_URL}/api/couples`, {
      headers: { 'Cookie': cookies || '' }
    });

    console.log('📊 Statut récupération couples:', couplesResponse.status);
    
    if (couplesResponse.ok) {
      const couplesResult = await couplesResponse.json();
      console.log('✅ Couples récupérés:', couplesResult.success ? 'OUI' : 'NON');
      if (couplesResult.success && couplesResult.data) {
        console.log('🔢 Nombre de couples:', couplesResult.data.couples?.length || 0);
      }
    } else {
      console.log('❌ Erreur HTTP:', couplesResponse.status);
      const errorText = await couplesResponse.text();
      console.log('📝 Détails erreur couples:', errorText);
    }

    // 3. Test de récupération des œufs
    console.log('\n3️⃣ Test de récupération des œufs...');
    const eggsResponse = await fetch(`${BASE_URL}/api/eggs`, {
      headers: { 'Cookie': cookies || '' }
    });

    console.log('📊 Statut récupération œufs:', eggsResponse.status);
    
    if (eggsResponse.ok) {
      const eggsResult = await eggsResponse.json();
      console.log('✅ Œufs récupérés:', eggsResult.success ? 'OUI' : 'NON');
      if (eggsResult.success && eggsResult.data) {
        console.log('🔢 Nombre d\'œufs:', eggsResult.data.eggs?.length || 0);
      }
    } else {
      console.log('❌ Erreur HTTP:', eggsResponse.status);
      const errorText = await eggsResponse.text();
      console.log('📝 Détails erreur œufs:', errorText);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testDebug(); 