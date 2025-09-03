// Test détaillé de la récupération de mot de passe
const axios = require('axios');

const BASE_URL = 'http://localhost:3002';
const TEST_EMAIL = 'dabadiallo694@gmail.com';

async function testForgotPasswordDetailed() {
    console.log('🔍 Test détaillé de la récupération de mot de passe\n');

    try {
        // Test 1: Vérifier que le serveur répond
        console.log('1️⃣ Test de connectivité...');
        const healthResponse = await axios.get(`${BASE_URL}/api/health`);
        console.log('✅ Serveur accessible:', healthResponse.data);

        // Test 2: Test avec email valide
        console.log('\n2️⃣ Test avec email valide...');
        const forgotResponse = await axios.post(`${BASE_URL}/api/forgot-password`, {
            email: TEST_EMAIL
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Réponse réussie:', forgotResponse.data);

        // Test 3: Vérifier que le code a été créé en base
        console.log('\n3️⃣ Vérification en base de données...');
        const { executeQuery } = require('./config/database.js');
        
        const codes = await executeQuery(
            'SELECT * FROM password_reset_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1',
            [TEST_EMAIL]
        );
        
        if (codes.length > 0) {
            console.log('✅ Code trouvé en base:', {
                id: codes[0].id,
                email: codes[0].email,
                code: codes[0].code,
                expires_at: codes[0].expires_at,
                used: codes[0].used
            });
        } else {
            console.log('❌ Aucun code trouvé en base');
        }

    } catch (error) {
        console.error('❌ Erreur détaillée:');
        console.log('Status:', error.response?.status);
        console.log('Status Text:', error.response?.statusText);
        console.log('Headers:', error.response?.headers);
        console.log('Data:', error.response?.data);
        console.log('Message:', error.message);
        
        if (error.response?.data) {
            console.log('\n🔧 Erreur du serveur:', error.response.data);
        }
    }
}

testForgotPasswordDetailed();
