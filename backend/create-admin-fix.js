import bcrypt from 'bcrypt';
import { executeQuery } from './config/database.js';

async function createAdmin() {
  console.log('👑 Création d\'un utilisateur admin...\n');

  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await executeQuery('SELECT id, username FROM users WHERE username = ?', ['admin']);
    
    if (existingAdmin.length > 0) {
      console.log('✅ L\'utilisateur admin existe déjà (ID:', existingAdmin[0].id, ')');
      
      // Mettre à jour le mot de passe
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await executeQuery('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, 'admin']);
      console.log('🔐 Mot de passe admin mis à jour');
      
      return;
    }

    // Créer un nouvel utilisateur admin
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const sql = `
      INSERT INTO users (username, email, password, full_name, role, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(sql, [
      'admin',
      'admin@pigeonfarm.ml',
      hashedPassword,
      'Administrateur PigeonFarm',
      'admin'
    ]);

    console.log('✅ Utilisateur admin créé avec succès (ID:', result.insertId, ')');
    console.log('🔑 Identifiants: admin / admin123');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
  }
}

createAdmin(); 