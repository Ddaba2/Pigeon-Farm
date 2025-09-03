const axios = require('axios');

async function testQuickReset() {
  try {
    console.log('🔍 Test rapide de réinitialisation\n');
    
    // Étape 1: Demander un code
    console.log('1️⃣ Demande d\'un code...');
    const forgotResponse = await axios.post('http://localhost:3002/api/forgot-password', {
      email: 'dabadiallo694@gmail.com'
    });
    console.log('✅ Code demandé');
    
    // Étape 2: Récupérer le code immédiatement
    console.log('\n2️⃣ Récupération du code...');
    const mysql = require('mysql2/promise');
    require('dotenv').config({ path: './config.env' });
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pigeon_farm'
    });
    
    const [rows] = await connection.execute(`
      SELECT code, expires_at FROM password_reset_codes 
      WHERE email = ? AND used = FALSE
      ORDER BY created_at DESC LIMIT 1
    `, ['dabadiallo694@gmail.com']);
    
    if (rows.length === 0) {
      console.log('❌ Aucun code trouvé');
      return;
    }
    
    const code = rows[0].code;
    const expiresAt = rows[0].expires_at;
    console.log(`📊 Code: ${code}, Expire: ${expiresAt}`);
    
    // Étape 3: Vérifier le code immédiatement
    console.log('\n3️⃣ Vérification du code...');
    const verifyResponse = await axios.post('http://localhost:3002/api/verify-reset-code', {
      email: 'dabadiallo694@gmail.com',
      code: code
    });
    console.log('✅ Code vérifié');
    
    // Étape 4: Réinitialiser immédiatement
    console.log('\n4️⃣ Réinitialisation...');
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

testQuickReset();
