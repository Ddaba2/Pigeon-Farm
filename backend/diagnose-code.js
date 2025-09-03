const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function diagnoseCode() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pigeon_farm'
  });

  try {
    console.log('🔍 Diagnostic du code de réinitialisation\n');
    
    // Récupérer tous les codes pour cet email
    const [rows] = await connection.execute(`
      SELECT code, used, expires_at, created_at 
      FROM password_reset_codes 
      WHERE email = ? 
      ORDER BY created_at DESC 
      LIMIT 5
    `, ['dabadiallo694@gmail.com']);
    
    console.log('📊 Codes trouvés:');
    rows.forEach((row, index) => {
      console.log(`   ${index + 1}. Code: ${row.code}, Utilisé: ${row.used}, Expire: ${row.expires_at}`);
    });
    
    // Vérifier la requête exacte utilisée dans reset-password
    console.log('\n🔍 Test de la requête reset-password...');
    const [resetRows] = await connection.execute(`
      SELECT * FROM password_reset_codes 
      WHERE email = ? AND code = ? AND expires_at > NOW() AND used = TRUE
    `, ['dabadiallo694@gmail.com', rows[0]?.code || '0000']);
    
    console.log(`   Résultat: ${resetRows.length} ligne(s) trouvée(s)`);
    
    if (resetRows.length === 0) {
      console.log('\n🔍 Vérification des conditions une par une...');
      
      // Vérifier chaque condition séparément
      const [emailRows] = await connection.execute(`
        SELECT * FROM password_reset_codes WHERE email = ?
      `, ['dabadiallo694@gmail.com']);
      console.log(`   - Email match: ${emailRows.length} ligne(s)`);
      
      const [codeRows] = await connection.execute(`
        SELECT * FROM password_reset_codes WHERE email = ? AND code = ?
      `, ['dabadiallo694@gmail.com', rows[0]?.code || '0000']);
      console.log(`   - Code match: ${codeRows.length} ligne(s)`);
      
      const [expiredRows] = await connection.execute(`
        SELECT * FROM password_reset_codes WHERE email = ? AND code = ? AND expires_at > NOW()
      `, ['dabadiallo694@gmail.com', rows[0]?.code || '0000']);
      console.log(`   - Non expiré: ${expiredRows.length} ligne(s)`);
      
      const [usedRows] = await connection.execute(`
        SELECT * FROM password_reset_codes WHERE email = ? AND code = ? AND used = TRUE
      `, ['dabadiallo694@gmail.com', rows[0]?.code || '0000']);
      console.log(`   - Utilisé: ${usedRows.length} ligne(s)`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await connection.end();
  }
}

diagnoseCode();
