const axios = require('axios');

async function testCode() {
  try {
    console.log('🔍 Test de vérification du code 6409...\n');
    
    const response = await axios.post('http://localhost:3002/api/verify-reset-code', {
      email: 'dabadiallo694@gmail.com',
      code: '6409'
    });
    
    console.log('✅ Vérification réussie:', response.data);
  } catch (error) {
    console.log('❌ Erreur:', error.response?.data || error.message);
  }
}

testCode();
