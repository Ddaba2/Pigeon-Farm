const { executeQuery } = require('./config/database.js');
const bcrypt = require('bcrypt');

async function createAdmin() {
  console.log('👤 Création d\'un utilisateur admin...\n');

  try {
    // Vérifier s'il existe déjà un admin
    const existingAdmins = await executeQuery('SELECT * FROM users WHERE role = "admin"');
    
    if (existingAdmins.length > 0) {
      console.log('⚠️  Des administrateurs existent déjà:\n');
      existingAdmins.forEach(admin => {
        console.log(`   - ${admin.username} (${admin.email})`);
      });
      console.log('\nPour créer un nouvel admin, supprimez d\'abord les admins existants.');
      return;
    }

    // Créer un nouvel utilisateur admin
    const username = 'admin';
    const email = 'admin@pigeonfarm.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 12);

    await executeQuery(`
      INSERT INTO users (username, email, password, full_name, role, status, created_at)
      VALUES (?, ?, ?, ?, 'admin', 'active', NOW())
    `, [username, email, hashedPassword, 'Administrateur']);

    console.log('✅ Utilisateur admin créé avec succès!\n');
    console.log('📋 Informations de connexion:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   Email: ${email}\n`);
    console.log('⚠️  IMPORTANT: Changez le mot de passe après la première connexion!');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createAdmin()
  .then(() => {
    console.log('\n👋 Au revoir!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });

