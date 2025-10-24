const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const { validatePasswordStrength } = require('./utils/validation');
require('dotenv').config({ path: './config.env' });

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pigeon_manager',
  port: process.env.DB_PORT || 3306
};

async function createSecureAdmin() {
  let connection;
  
  try {
    // Connexion à la base de données
    console.log('🔌 Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connexion réussie !');

    // Mot de passe fort pour l'admin
    const adminPassword = 'AdminPigeonFarm2024!';
    
    // Validation du mot de passe selon la nouvelle politique
    console.log('🔒 Validation du mot de passe...');
    const passwordValidation = validatePasswordStrength(adminPassword);
    
    if (!passwordValidation.isValid) {
      console.error('❌ Le mot de passe ne respecte pas la politique de sécurité :');
      passwordValidation.errors.forEach(error => console.error(`   - ${error}`));
      return;
    }
    
    console.log('✅ Mot de passe validé !');
    console.log(`   Force: ${passwordValidation.strength}%`);
    console.log(`   Exigences: ${Object.values(passwordValidation.requirements).filter(Boolean).length}/6`);

    // Hachage du mot de passe
    console.log('🔐 Hachage du mot de passe...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    console.log('✅ Mot de passe haché !');

    // Vérifier si l'admin existe déjà
    console.log('🔍 Vérification de l\'existence de l\'admin...');
    const [existingAdmins] = await connection.execute(
      'SELECT id, username, email FROM users WHERE role = "admin"'
    );

    if (existingAdmins.length > 0) {
      console.log('⚠️  Des administrateurs existent déjà :');
      existingAdmins.forEach(admin => {
        console.log(`   - ${admin.username} (${admin.email})`);
      });
      
      // Mettre à jour le mot de passe de l'admin existant
      const [updateResult] = await connection.execute(
        'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE role = "admin" AND username = "admin"',
        [hashedPassword]
      );
      
      if (updateResult.affectedRows > 0) {
        console.log('✅ Mot de passe de l\'admin mis à jour !');
      } else {
        console.log('ℹ️  Aucun admin "admin" trouvé pour la mise à jour');
      }
    } else {
      // Créer un nouvel admin
      console.log('👤 Création du compte administrateur...');
      const [insertResult] = await connection.execute(
        `INSERT INTO users (username, email, password, full_name, role, status, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          'admin',
          'admin@pigeonfarm.com',
          hashedPassword,
          'Administrateur PigeonFarm',
          'admin',
          'active'
        ]
      );
      
      console.log('✅ Compte administrateur créé !');
      console.log(`   ID: ${insertResult.insertId}`);
    }

    // Afficher les informations de connexion
    console.log('\n🎯 INFORMATIONS DE CONNEXION ADMIN :');
    console.log('=====================================');
    console.log(`👤 Nom d'utilisateur: admin`);
    console.log(`📧 Email: admin@pigeonfarm.com`);
    console.log(`🔑 Mot de passe: ${adminPassword}`);
    console.log(`🌐 URL de connexion: http://localhost:5173`);
    console.log('=====================================');
    
    console.log('\n⚠️  IMPORTANT :');
    console.log('- Changez ce mot de passe après votre première connexion');
    console.log('- Ce mot de passe respecte la nouvelle politique de sécurité');
    console.log('- Gardez ces informations en sécurité');

    // Afficher les admins existants
    console.log('\n📋 Administrateurs dans la base de données :');
    const [allAdmins] = await connection.execute(
      'SELECT id, username, email, role, status, created_at FROM users WHERE role = "admin"'
    );
    
    allAdmins.forEach(admin => {
      console.log(`   ${admin.id}. ${admin.username} (${admin.email}) - ${admin.status} - ${new Date(admin.created_at).toLocaleDateString('fr-FR')}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin :', error.message);
    console.error('Détails:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion fermée');
    }
  }
}

// Exécuter le script
if (require.main === module) {
  createSecureAdmin();
}

module.exports = { createSecureAdmin };