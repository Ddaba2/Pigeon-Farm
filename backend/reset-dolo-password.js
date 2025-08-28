import bcrypt from 'bcrypt';
import { executeQuery } from './config/database.js';

async function resetDoloPassword() {
  console.log('🔐 Réinitialisation du mot de passe de dolo...\n');

  try {
    // Créer un nouveau mot de passe hashé
    const newPassword = 'dolo123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Mettre à jour le mot de passe
    await executeQuery('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, 'dolo']);
    
    console.log('✅ Mot de passe de dolo mis à jour');
    console.log('🔑 Nouveaux identifiants: dolo / dolo123');
    
    // Vérifier la mise à jour
    const user = await executeQuery('SELECT id, username, role FROM users WHERE username = ?', ['dolo']);
    console.log('👤 Utilisateur dolo:', user[0]);

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
  }
}

resetDoloPassword(); 