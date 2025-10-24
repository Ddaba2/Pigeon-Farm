const { exec } = require('child_process');
const path = require('path');

// Chemin vers le fichier de migration
const migrationFile = path.join(__dirname, 'migrations', 'add_user_id_to_sales.sql');

console.log('🔍 Application de la migration pour ajouter user_id à la table sales...');

// Exécuter la migration avec MySQL
const command = `mysql -u root -p pigeon_manager < "${migrationFile}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Erreur lors de l\'application de la migration:', error.message);
    console.log('💡 Assurez-vous que:');
    console.log('   1. MySQL est démarré');
    console.log('   2. Vous avez un utilisateur root avec mot de passe');
    console.log('   3. La base de données "pigeon_manager" existe');
    console.log('   4. Le fichier de migration existe');
    return;
  }
  
  if (stderr) {
    console.log('⚠️  Avertissements:', stderr);
  }
  
  console.log('✅ Migration appliquée avec succès !');
  console.log('📋 Vérifiez que la table sales a bien été mise à jour avec la colonne user_id');
});