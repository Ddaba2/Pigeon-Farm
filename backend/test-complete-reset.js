// Test complet de la récupération de mot de passe avec vrai code
const axios = require('axios');

const BASE_URL = 'http://localhost:3002';
const TEST_EMAIL = 'dabadiallo694@gmail.com';

async function testCompletePasswordReset() {
    console.log('🔍 Test complet de la récupération de mot de passe\n');

    try {
        // Étape 1: Demander un code de réinitialisation
        console.log('1️⃣ Demande de code de réinitialisation...');
        const forgotResponse = await axios.post(`${BASE_URL}/api/forgot-password`, {
            email: TEST_EMAIL
        });
        console.log('✅ Code demandé:', forgotResponse.data);

        // Attendre que le code soit généré
        console.log('\n⏳ Attendez 3 secondes pour que le code soit généré...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Étape 2: Récupérer le code depuis la base de données
        console.log('\n2️⃣ Récupération du code depuis la base de données...');
        const codeResponse = await axios.get(`${BASE_URL}/api/password-reset-status/${encodeURIComponent(TEST_EMAIL)}`);
        console.log('📊 Statut des codes:', codeResponse.data);

        // Étape 3: Vérifier le code (utiliser un code fictif pour tester)
        console.log('\n3️⃣ Test de vérification du code...');
        try {
            const verifyResponse = await axios.post(`${BASE_URL}/api/verify-reset-code`, {
                email: TEST_EMAIL,
                code: '1234' // Code fictif
            });
            console.log('✅ Vérification réussie:', verifyResponse.data);
        } catch (verifyError) {
            console.log('❌ Erreur de vérification (normal avec un code fictif):', verifyError.response?.data);
        }

        // Étape 4: Test de réinitialisation (devrait échouer car code non vérifié)
        console.log('\n4️⃣ Test de réinitialisation avec code non vérifié...');
        try {
            const resetResponse = await axios.post(`${BASE_URL}/api/reset-password`, {
                email: TEST_EMAIL,
                code: '1234',
                newPassword: 'nouveauMotDePasse123'
            });
            console.log('✅ Réinitialisation réussie:', resetResponse.data);
        } catch (resetError) {
            console.log('❌ Erreur de réinitialisation (attendue):', resetError.response?.data);
        }

        console.log('\n💡 Instructions pour tester avec un vrai code:');
        console.log('1. Vérifiez la console du serveur backend pour voir le code généré');
        console.log('2. Utilisez ce code dans l\'interface web');
        console.log('3. Ou utilisez ce script avec le vrai code');

    } catch (error) {
        console.error('❌ Erreur générale:', error.response?.data || error.message);
    }
}

// Test avec un vrai code (à utiliser après avoir récupéré le code depuis la console)
async function testWithRealCode(realCode) {
    console.log(`\n🔍 Test avec le vrai code: ${realCode}\n`);

    try {
        // Étape 1: Vérifier le code
        console.log('1️⃣ Vérification du code...');
        const verifyResponse = await axios.post(`${BASE_URL}/api/verify-reset-code`, {
            email: TEST_EMAIL,
            code: realCode
        });
        console.log('✅ Code vérifié:', verifyResponse.data);

        // Étape 2: Réinitialiser le mot de passe
        console.log('\n2️⃣ Réinitialisation du mot de passe...');
        const resetResponse = await axios.post(`${BASE_URL}/api/reset-password`, {
            email: TEST_EMAIL,
            code: realCode,
            newPassword: 'nouveauMotDePasse123'
        });
        console.log('✅ Mot de passe réinitialisé:', resetResponse.data);

        console.log('\n🎉 Test réussi ! Vous pouvez maintenant vous connecter avec:');
        console.log('   Username: dabad');
        console.log('   Mot de passe: nouveauMotDePasse123');

    } catch (error) {
        console.error('❌ Erreur:', error.response?.data || error.message);
    }
}

// Exécuter le test complet
testCompletePasswordReset().then(() => {
    console.log('\n' + '='.repeat(60));
    console.log('💡 Pour tester avec un vrai code, utilisez:');
    console.log('   testWithRealCode("XXXX") où XXXX est le code de la console');
});
