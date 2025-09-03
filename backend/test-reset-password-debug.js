// Test détaillé de la réinitialisation de mot de passe
const axios = require('axios');

const BASE_URL = 'http://localhost:3002';
const TEST_EMAIL = 'dabadiallo694@gmail.com';

async function testResetPasswordDebug() {
    console.log('🔍 Test détaillé de la réinitialisation de mot de passe\n');

    try {
        // Test 1: Demande de réinitialisation
        console.log('1️⃣ Demande de réinitialisation...');
        const forgotResponse = await axios.post(`${BASE_URL}/api/forgot-password`, {
            email: TEST_EMAIL
        });
        console.log('✅ Demande réussie:', forgotResponse.data);

        // Attendre un peu pour que le code soit généré
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Test 2: Vérification du code (utiliser un code fictif pour tester)
        console.log('\n2️⃣ Test de vérification du code...');
        const verifyResponse = await axios.post(`${BASE_URL}/api/verify-reset-code`, {
            email: TEST_EMAIL,
            code: '1234' // Code fictif pour tester
        });
        console.log('📧 Réponse vérification:', verifyResponse.data);

        // Test 3: Réinitialisation du mot de passe
        console.log('\n3️⃣ Test de réinitialisation du mot de passe...');
        const resetResponse = await axios.post(`${BASE_URL}/api/reset-password`, {
            email: TEST_EMAIL,
            code: '1234', // Même code fictif
            newPassword: 'nouveauMotDePasse123'
        });
        console.log('🔑 Réponse réinitialisation:', resetResponse.data);

    } catch (error) {
        console.error('❌ Erreur détectée:');
        if (error.response) {
            console.error('📊 Status:', error.response.status);
            console.error('📄 Données:', error.response.data);
            console.error('🔗 URL:', error.response.config.url);
            console.error('📝 Méthode:', error.response.config.method);
            console.error('📦 Body:', error.response.config.data);
        } else {
            console.error('❌ Erreur réseau:', error.message);
        }
    }
}

// Test avec un vrai code depuis la base de données
async function testWithRealCode() {
    console.log('\n🔍 Test avec un vrai code depuis la base de données\n');

    try {
        // 1. Demander un nouveau code
        console.log('1️⃣ Demande d\'un nouveau code...');
        const forgotResponse = await axios.post(`${BASE_URL}/api/forgot-password`, {
            email: TEST_EMAIL
        });
        console.log('✅ Code demandé:', forgotResponse.data);

        // 2. Attendre et récupérer le code depuis la console du serveur
        console.log('\n2️⃣ Vérifiez la console du serveur pour voir le code généré');
        console.log('💡 Le code sera affiché dans la console du serveur backend');
        console.log('💡 Utilisez ce code pour tester la réinitialisation');

    } catch (error) {
        console.error('❌ Erreur:', error.response?.data || error.message);
    }
}

// Exécuter les tests
testResetPasswordDebug().then(() => {
    console.log('\n' + '='.repeat(50));
    testWithRealCode();
});
