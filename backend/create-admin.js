import bcrypt from 'bcrypt';
import { executeQuery } from './config/database.js';

async function createAdminUser() {
  try {
    console.log('🔧 Création de l\'utilisateur admin...');
    
    // Hacher le mot de passe
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Supprimer l'ancien utilisateur admin s'il existe
    await executeQuery('DELETE FROM users WHERE username = ?', ['admin']);
    
    // Créer le nouvel utilisateur admin
    const sql = `
      INSERT INTO users (username, full_name, email, password, role, created_at) 
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    const result = await executeQuery(sql, [
      'admin',
      'Administrateur PigeonFarm',
      'admin@pigeonfarm.com',
      hashedPassword,
      'admin'
    ]);
    
    console.log('✅ Utilisateur admin créé avec succès !');
    console.log('📋 Identifiants de connexion :');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   ID: ' + result.insertId);
    
    // Vérifier que l'utilisateur a été créé
    const user = await executeQuery('SELECT id, username, full_name, email, role FROM users WHERE username = ?', ['admin']);
    console.log('👤 Utilisateur créé :', user[0]);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur admin:', error);
  }
}

// Exécuter le script
createAdminUser().then(() => {
  console.log('✨ Script terminé');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
}); 