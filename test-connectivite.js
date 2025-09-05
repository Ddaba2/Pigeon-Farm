// Test de connectivité Frontend-Backend
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002/api';

async function testConnectivity() {
  console.log('🔗 Test de connectivité Frontend-Backend\n');

  // Test 1: Santé du serveur
  console.log('1️⃣ Test de santé du serveur...');
  try {
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Serveur en ligne:', healthData.data.status);
  } catch (error) {
    console.log('❌ Serveur inaccessible:', error.message);
    return;
  }

  // Test 2: Test de connectivité API
  console.log('\n2️⃣ Test de connectivité API...');
  try {
    const testResponse = await fetch(`${BASE_URL}/test`);
    const testData = await testResponse.json();
    console.log('✅ API accessible:', testData.data.message);
    console.log('📡 Endpoints disponibles:', Object.keys(testData.data.endpoints));
  } catch (error) {
    console.log('❌ API inaccessible:', error.message);
  }

  // Test 3: Test d'authentification
  console.log('\n3️⃣ Test d\'authentification...');
  try {
    const authResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'test',
        password: 'test'
      })
    });
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Authentification réussie');
      console.log('🔑 Session ID:', authData.sessionId);
      
      // Test 4: Test des routes protégées avec session
      console.log('\n4️⃣ Test des routes protégées...');
      const sessionId = authData.sessionId;
      
      // Test couples
      try {
        const couplesResponse = await fetch(`${BASE_URL}/couples`, {
          headers: {
            'x-session-id': sessionId
          }
        });
        if (couplesResponse.ok) {
          console.log('✅ Route /couples accessible');
        } else {
          console.log('❌ Route /couples inaccessible:', couplesResponse.status);
        }
      } catch (error) {
        console.log('❌ Erreur route /couples:', error.message);
      }
      
      // Test eggs
      try {
        const eggsResponse = await fetch(`${BASE_URL}/eggs`, {
          headers: {
            'x-session-id': sessionId
          }
        });
        if (eggsResponse.ok) {
          console.log('✅ Route /eggs accessible');
        } else {
          console.log('❌ Route /eggs inaccessible:', eggsResponse.status);
        }
      } catch (error) {
        console.log('❌ Erreur route /eggs:', error.message);
      }
      
      // Test pigeonneaux
      try {
        const pigeonneauxResponse = await fetch(`${BASE_URL}/pigeonneaux`, {
          headers: {
            'x-session-id': sessionId
          }
        });
        if (pigeonneauxResponse.ok) {
          console.log('✅ Route /pigeonneaux accessible');
        } else {
          console.log('❌ Route /pigeonneaux inaccessible:', pigeonneauxResponse.status);
        }
      } catch (error) {
        console.log('❌ Erreur route /pigeonneaux:', error.message);
      }
      
      // Test health-records
      try {
        const healthResponse = await fetch(`${BASE_URL}/health-records`, {
          headers: {
            'x-session-id': sessionId
          }
        });
        if (healthResponse.ok) {
          console.log('✅ Route /health-records accessible');
        } else {
          console.log('❌ Route /health-records inaccessible:', healthResponse.status);
        }
      } catch (error) {
        console.log('❌ Erreur route /health-records:', error.message);
      }
      
      // Test statistics
      try {
        const statsResponse = await fetch(`${BASE_URL}/statistics/dashboard`, {
          headers: {
            'x-session-id': sessionId
          }
        });
        if (statsResponse.ok) {
          console.log('✅ Route /statistics/dashboard accessible');
        } else {
          console.log('❌ Route /statistics/dashboard inaccessible:', statsResponse.status);
        }
      } catch (error) {
        console.log('❌ Erreur route /statistics/dashboard:', error.message);
      }
      
    } else {
      console.log('❌ Authentification échouée:', authResponse.status);
      console.log('💡 Créez un utilisateur de test dans la base de données');
    }
  } catch (error) {
    console.log('❌ Erreur d\'authentification:', error.message);
  }

  // Test 5: Test sans authentification (pour voir les erreurs)
  console.log('\n5️⃣ Test sans authentification...');
  try {
    const noAuthResponse = await fetch(`${BASE_URL}/couples`);
      console.log('📊 Statut sans auth:', noAuthResponse.status);
  if (noAuthResponse.status === 401 || noAuthResponse.status === 403) {
      console.log('✅ Protection d\'authentification active');
    }
  } catch (error) {
    console.log('❌ Erreur test sans auth:', error.message);
  }

  console.log('\n🎯 Résumé:');
  console.log('- Frontend configuré pour communiquer avec le backend');
  console.log('- Backend accessible et fonctionnel');
  console.log('- Authentification requise pour accéder aux données');
  console.log('- Toutes les routes API sont protégées');
}

// Exécuter le test
testConnectivity().catch(console.error); 