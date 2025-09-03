// Test CORS pour la récupération de mot de passe
const axios = require('axios');

const BASE_URL = 'http://localhost:3002';
const TEST_EMAIL = 'dabadiallo694@gmail.com';

async function testCORS() {
    console.log('🧪 Test CORS pour la récupération de mot de passe\n');

    try {
        // Test 1: Test simple sans CORS
        console.log('1️⃣ Test simple...');
        const simpleResponse = await axios.post(`${BASE_URL}/api/forgot-password`, {
            email: TEST_EMAIL
        });
        console.log('✅ Test simple réussi:', simpleResponse.data);

        // Test 2: Test avec headers CORS
        console.log('\n2️⃣ Test avec headers CORS...');
        const corsResponse = await axios.post(`${BASE_URL}/api/forgot-password`, {
            email: TEST_EMAIL
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:5173'
            },
            withCredentials: true
        });
        console.log('✅ Test CORS réussi:', corsResponse.data);

        // Test 3: Test avec sessionId
        console.log('\n3️⃣ Test avec sessionId...');
        const sessionResponse = await axios.post(`${BASE_URL}/api/forgot-password`, {
            email: TEST_EMAIL
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': 'test-session-id'
            }
        });
        console.log('✅ Test session réussi:', sessionResponse.data);

        console.log('\n✅ Tous les tests CORS réussis');

    } catch (error) {
        console.error('❌ Erreur CORS:', error.response?.data || error.message);
        console.log('\n🔧 Détails de l\'erreur:');
        console.log('Status:', error.response?.status);
        console.log('Headers:', error.response?.headers);
        console.log('Data:', error.response?.data);
    }
}

testCORS();
