import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3002';

async function testAPI() {
  console.log('🧪 Test de l\'API PigeonFarm...\n');

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

    // 2. Test de création d'un couple avec les BONS champs
    console.log('\n2️⃣ Test de création d\'un couple...');
    const coupleData = {
      name: 'Couple Test 001',        // ✅ Nom du couple
      breed: 'Racing Homer',          // ✅ Race
      date_formation: '2024-01-01',  // ✅ Date de formation
      male: 'Champion Mâle',          // ✅ Nom du mâle
      female: 'Belle Femelle',        // ✅ Nom de la femelle
      notes: 'Couple de test pour validation', // ✅ Observations
      status: 'actif',                // ✅ Statut
      userId: userId                  // ✅ ID de l'utilisateur connecté
    };

    const coupleResponse = await fetch(`${BASE_URL}/api/couples`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify(coupleData)
    });

    console.log('📊 Statut création couple:', coupleResponse.status);
    
    if (coupleResponse.ok) {
      const coupleResult = await coupleResponse.json();
      console.log('✅ Couple créé:', coupleResult.success ? 'OUI' : 'NON');
      if (!coupleResult.success) {
        console.log('❌ Erreur création:', coupleResult.error);
      }
    } else {
      console.log('❌ Erreur HTTP:', coupleResponse.status);
      const errorText = await coupleResponse.text();
      console.log('📝 Détails erreur:', errorText);
    }

    // 3. Vérifier si le couple a été créé
    console.log('\n3️⃣ Vérification de la création...');
    const checkResponse = await fetch(`${BASE_URL}/api/couples`, {
      headers: { 'Cookie': cookies || '' }
    });

    if (checkResponse.ok) {
      const checkResult = await checkResponse.json();
      console.log('📊 Couples trouvés:', checkResult.success ? 'OUI' : 'NON');
      if (checkResult.success && checkResult.data) {
        console.log('🔢 Nombre de couples:', checkResult.data.couples?.length || 0);
        if (checkResult.data.couples && checkResult.data.couples.length > 0) {
          console.log('📋 Premier couple:', checkResult.data.couples[0]);
        }
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testAPI(); 