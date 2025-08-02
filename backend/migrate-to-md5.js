import pool from './config/database.js';
import crypto from 'crypto';

// Fonction pour hasher avec MD5
const hashMD5 = (password) => {
  return crypto.createHash('md5').update(password).digest('hex');
};

// Mots de passe par défaut en MD5
const defaultPasswords = {
  'admin': hashMD5('admin'),
  'user': hashMD5('user'),
  'password': hashMD5('password'),
  '123456': hashMD5('123456'),
  'test': hashMD5('test')
};

async function migrateToMD5() {
  try {
    console.log('🔄 Début de la migration vers MD5...');
    
    // Récupérer tous les utilisateurs
    const [users] = await pool.query('SELECT id, username, password FROM users');
    
    console.log(`📊 ${users.length} utilisateurs trouvés`);
    
    let updatedCount = 0;
    
    for (const user of users) {
      // Vérifier si le mot de passe est déjà en MD5 (32 caractères hexadécimaux)
      if (user.password && user.password.length === 32 && /^[a-f0-9]{32}$/i.test(user.password)) {
        console.log(`✅ Utilisateur ${user.username} : mot de passe déjà en MD5`);
        continue;
      }
      
      // Si le mot de passe n'est pas en MD5, le remplacer par un mot de passe par défaut
      let newPassword;
      
      // Essayer de trouver un mot de passe par défaut basé sur le nom d'utilisateur
      if (defaultPasswords[user.username.toLowerCase()]) {
        newPassword = defaultPasswords[user.username.toLowerCase()];
        console.log(`🔄 Utilisateur ${user.username} : migration vers mot de passe par défaut`);
      } else {
        // Utiliser 'password' comme mot de passe par défaut
        newPassword = defaultPasswords['password'];
        console.log(`🔄 Utilisateur ${user.username} : migration vers mot de passe 'password'`);
      }
      
      // Mettre à jour le mot de passe
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, user.id]);
      updatedCount++;
    }
    
    console.log(`✅ Migration terminée ! ${updatedCount} utilisateurs mis à jour`);
    console.log('\n📋 Mots de passe par défaut :');
    console.log('- admin : admin');
    console.log('- user : user');
    console.log('- password : password');
    console.log('- 123456 : 123456');
    console.log('- test : test');
    console.log('- autres utilisateurs : password');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await pool.end();
  }
}

// Exécuter la migration
migrateToMD5(); 