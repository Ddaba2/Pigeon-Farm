// Script de test pour la réinitialisation de mot de passe
// Usage: node test-password-reset.js

import axios from 'axios';

const BASE_URL = 'http://localhost:3002';
const TEST_EMAIL = 'test@example.com'; // Email de test depuis db_schema.sql

async function testPasswordReset() {
    console.log('🧪 Test de la fonctionnalité de réinitialisation de mot de passe\n');

    try {
        // Test 1: Demande de réinitialisation
        console.log('1️⃣ Test de la demande de réinitialisation...');
        const forgotResponse = await axios.post(`${BASE_URL}/api/forgot-password`, {
            email: TEST_EMAIL
        });
        
        if (forgotResponse.data.success) {
            console.log('✅ Demande de réinitialisation réussie');
            console.log('📧 Email:', forgotResponse.data.email);
            console.log('💬 Message:', forgotResponse.data.message);
        } else {
            console.log('❌ Échec de la demande de réinitialisation');
            console.log('💬 Message:', forgotResponse.data.message);
        }

        // Test 2: Vérification du statut
        console.log('\n2️⃣ Test de la vérification du statut...');
        const statusResponse = await axios.get(`${BASE_URL}/api/password-reset-status/${encodeURIComponent(TEST_EMAIL)}`);
        
        if (statusResponse.data.success) {
            console.log('✅ Statut vérifié');
            console.log('🔑 Code actif:', statusResponse.data.hasActiveCode);
            if (statusResponse.data.expiresAt) {
                console.log('⏰ Expire à:', statusResponse.data.expiresAt);
            }
        } else {
            console.log('❌ Échec de la vérification du statut');
        }

        // Test 3: Test avec un email inexistant
        console.log('\n3️⃣ Test avec un email inexistant...');
        try {
            const invalidResponse = await axios.post(`${BASE_URL}/api/forgot-password`, {
                email: 'inexistant@example.com'
            });
            console.log('❌ Devrait avoir échoué avec un email inexistant');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('✅ Correctement rejeté pour un email inexistant');
                console.log('💬 Message:', error.response.data.message);
            } else {
                console.log('❌ Erreur inattendue:', error.message);
            }
        }

        console.log('\n🎉 Tests terminés !');
        console.log('\n📋 Pour tester complètement :');
        console.log('   1. Vérifiez la console du serveur pour le code de réinitialisation');
        console.log('   2. Utilisez le code dans l\'interface frontend');
        console.log('   3. Testez la réinitialisation du mot de passe');

    } catch (error) {
        console.error('❌ Erreur lors des tests:', error.message);
        if (error.response) {
            console.error('📊 Statut:', error.response.status);
            console.error('📝 Données:', error.response.data);
        }
    }
}

// Vérification de la connectivité
async function checkConnectivity() {
    try {
        console.log('🔍 Vérification de la connectivité...');
        const response = await axios.get(`${BASE_URL}/api/health`);
        if (response.data.success) {
            console.log('✅ Serveur accessible');
            return true;
        }
    } catch (error) {
        console.log('❌ Serveur inaccessible:', error.message);
        return false;
    }
}

// Fonction principale
async function main() {
    console.log('🚀 Démarrage des tests de réinitialisation de mot de passe\n');
    
    const isConnected = await checkConnectivity();
    if (!isConnected) {
        console.log('❌ Impossible de continuer sans connexion au serveur');
        console.log('💡 Assurez-vous que le serveur backend est démarré sur le port 3002');
        return;
    }

    await testPasswordReset();
}

// Exécution si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { testPasswordReset, checkConnectivity }; 