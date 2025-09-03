const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function getCurrentCode() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pigeon_farm'
  });

  try {
    console.log('🔍 Récupération du code de réinitialisation actuel...\n');
    
    const [rows] = await connection.execute(`
      SELECT code, email, created_at, expires_at, used 
      FROM password_reset_codes 
      WHERE email = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `, ['dabadiallo694@gmail.com']);

    if (rows.length === 0) {
      console.log('❌ Aucun code trouvé pour cet email');
      return;
    }

    const code = rows[0];
    console.log('📊 Code trouvé:');
    console.log(`   Code: ${code.code}`);
    console.log(`   Email: ${code.email}`);
    console.log(`   Créé le: ${code.created_at}`);
    console.log(`   Expire le: ${code.expires_at}`);
    console.log(`   Utilisé: ${code.used ? 'Oui' : 'Non'}`);
    
    const now = new Date();
    const expiresAt = new Date(code.expires_at);
    
    if (now > expiresAt) {
      console.log('\n⚠️  Ce code a expiré !');
    } else if (code.used) {
      console.log('\n⚠️  Ce code a déjà été utilisé !');
    } else {
      console.log('\n✅ Ce code est valide et peut être utilisé !');
      console.log(`\n🎯 Utilisez ce code dans l'interface web: ${code.code}`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await connection.end();
  }
}

getCurrentCode();
