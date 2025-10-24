// Script de test pour la suppression de compte
const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api';

async function testAccountDeletion() {
  console.log('🧪 Test de suppression de compte\n');
  
  // 1. Créer un utilisateur de test
  console.log('1️⃣ Création d\'un utilisateur de test...');
  try {
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      username: 'test_delete',
      email: 'test_delete@example.com',
      password: 'test123456',
      fullName: 'Test Delete',
      acceptTerms: true
    });
    
    if (registerResponse.data.success) {
      console.log('✅ Utilisateur créé:', registerResponse.data.data.username);
    }
  } catch (error) {
    console.log('❌ Erreur création:', error.response?.data?.error?.message || error.message);
  }
  
  // 2. Se connecter
  console.log('\n2️⃣ Connexion...');
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'test_delete',
      password: 'test123456'
    }, {
      withCredentials: true
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Connecté:', loginResponse.data.data.username);
      
      // Récupérer le sessionId depuis les cookies
      const sessionId = loginResponse.headers['set-cookie']?.[0]?.split('sessionId=')[1]?.split(';')[0];
      console.log('📋 Session ID:', sessionId || 'Non trouvé dans les cookies');
      
      // 3. Tester la suppression
      console.log('\n3️⃣ Test de suppression du compte...');
      try {
        const deleteResponse = await axios.delete(`${BASE_URL}/users/profile/me`, {
          data: {
            password: 'test123456',
            confirmDelete: 'SUPPRIMER'
          },
          headers: {
            'Cookie': `sessionId=${sessionId}`,
            'x-session-id': sessionId
          },
          withCredentials: true
        });
        
        if (deleteResponse.data.success) {
          console.log('✅ Compte supprimé avec succès!');
        }
      } catch (error) {
        console.log('❌ Erreur suppression:', error.response?.data?.error?.message || error.message);
        console.log('📊 Status:', error.response?.status);
        console.log('📊 Data:', JSON.stringify(error.response?.data, null, 2));
      }
    }
  } catch (error) {
    console.log('❌ Erreur connexion:', error.response?.data?.error?.message || error.message);
  }
}

testAccountDeletion();

