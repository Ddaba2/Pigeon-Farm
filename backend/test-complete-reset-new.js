const axios = require('axios');

async function testCompleteReset() {
  try {
    console.log('🔍 Test complet de réinitialisation de mot de passe\n');
    
    // Étape 1: Demander un nouveau code
    console.log('1️⃣ Demande d\'un nouveau code...');
    const forgotResponse = await axios.post('http://localhost:3002/api/forgot-password', {
      email: 'dabadiallo694@gmail.com'
    });
    console.log('✅ Code demandé:', forgotResponse.data);
    
    // Attendre un peu
    console.log('\n⏳ Attendre 2 secondes...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Étape 2: Récupérer le code depuis la base de données
    console.log('\n2️⃣ Récupération du code depuis la base de données...');
    const mysql = require('mysql2/promise');
    require('dotenv').config({ path: './config.env' });
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pigeon_farm'
    });
    
    const [rows] = await connection.execute(`
      SELECT code FROM password_reset_codes 
      WHERE email = ? AND used = FALSE
      ORDER BY created_at DESC LIMIT 1
    `, ['dabadiallo694@gmail.com']);
    
    if (rows.length === 0) {
      console.log('❌ Aucun code valide trouvé');
      return;
    }
    
    const code = rows[0].code;
    console.log(`📊 Code trouvé: ${code}`);
    
    // Étape 3: Vérifier le code
    console.log('\n3️⃣ Vérification du code...');
    const verifyResponse = await axios.post('http://localhost:3002/api/verify-reset-code', {
      email: 'dabadiallo694@gmail.com',
      code: code
    });
    console.log('✅ Code vérifié:', verifyResponse.data);
    
    // Étape 4: Réinitialiser le mot de passe
    console.log('\n4️⃣ Réinitialisation du mot de passe...');
    const resetResponse = await axios.post('http://localhost:3002/api/reset-password', {
      email: 'dabadiallo694@gmail.com',
      code: code,
      newPassword: 'nouveauMotDePasse123'
    });
    console.log('✅ Mot de passe réinitialisé:', resetResponse.data);
    
    await connection.end();
    
  } catch (error) {
    console.log('❌ Erreur:', error.response?.data || error.message);
  }
}

testCompleteReset();
