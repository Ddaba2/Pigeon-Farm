// Test simple de la récupération de mot de passe
const axios = require('axios');

const BASE_URL = 'http://localhost:3002';
const TEST_EMAIL = 'dabadiallo694@gmail.com'; // Email de test

async function testPasswordReset() {
    console.log('🧪 Test de la récupération de mot de passe\n');

    try {
        // Test 1: Demande de réinitialisation
        console.log('1️⃣ Demande de réinitialisation pour:', TEST_EMAIL);
        const forgotResponse = await axios.post(`${BASE_URL}/api/forgot-password`, {
            email: TEST_EMAIL
        });
        
        console.log('📧 Réponse:', forgotResponse.data);
        
        if (forgotResponse.data.success) {
            console.log('✅ Demande réussie !');
            console.log('💡 Vérifiez la console du serveur pour voir le code');
        } else {
            console.log('❌ Échec:', forgotResponse.data.message);
        }

    } catch (error) {
        console.error('❌ Erreur:', error.response?.data || error.message);
    }
}

testPasswordReset();
