// Script de test pour vérifier l'authentification et la récupération des œufs
async function testEggsAPI() {
  try {
    console.log('🧪 Test de l\'API des œufs...\n');

    // 1. Test de connexion
    console.log('1️⃣ Test de connexion...');
    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test', password: 'test123' }),
      credentials: 'include'
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Erreur de connexion: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Connexion réussie, sessionId obtenu:', loginData.sessionId);

    // 2. Test de récupération des œufs avec sessionId
    console.log('\n2️⃣ Test de récupération des œufs avec sessionId...');
    const eggsResponse = await fetch('http://localhost:3002/api/eggs', {
      headers: { 'x-session-id': loginData.sessionId },
      credentials: 'include'
    });
    
    if (eggsResponse.ok) {
      const eggsData = await eggsResponse.json();
      console.log('✅ Œufs récupérés avec succès:', eggsData);
    } else {
      console.log('❌ Erreur récupération œufs:', eggsResponse.status, eggsResponse.statusText);
      const errorData = await eggsResponse.json();
      console.log('Détails de l\'erreur:', errorData);
    }

    // 3. Test de récupération des couples avec sessionId
    console.log('\n3️⃣ Test de récupération des couples avec sessionId...');
    const couplesResponse = await fetch('http://localhost:3002/api/couples', {
      headers: { 'x-session-id': loginData.sessionId },
      credentials: 'include'
    });
    
    if (couplesResponse.ok) {
      const couplesData = await couplesResponse.json();
      console.log('✅ Couples récupérés avec succès:', couplesData);
    } else {
      console.log('❌ Erreur récupération couples:', couplesResponse.status, couplesResponse.statusText);
      const errorData = await couplesResponse.json();
      console.log('Détails de l\'erreur:', errorData);
    }

    console.log('\n🎉 Tests terminés !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Exécuter les tests
testEggsAPI();
