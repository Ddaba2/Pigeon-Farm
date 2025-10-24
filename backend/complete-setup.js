const fs = require('fs');
const path = require('path');

console.log('🚀 Démarrage du script de configuration complète...');

// Vérifier si le fichier SQLite existe
const sqliteDbPath = path.join(__dirname, 'pigeon_manager.db');
const sqliteExists = fs.existsSync(sqliteDbPath);

console.log(`🔍 Fichier SQLite trouvé: ${sqliteExists ? 'Oui' : 'Non'}`);
if (sqliteExists) {
  console.log(`📁 Chemin: ${sqliteDbPath}`);
}

// Vérifier si MySQL est disponible
let mysqlAvailable = false;
try {
  require('mysql2/promise');
  mysqlAvailable = true;
  console.log('✅ MySQL disponible');
} catch (error) {
  console.log('⚠️  MySQL non disponible');
}

if (!mysqlAvailable && !sqliteExists) {
  console.log('\n❌ Aucune base de données disponible !');
  console.log('\n💡 Solutions possibles:');
  console.log('   1. Installer MySQL (suivre le guide mysql-setup-guide.md)');
  console.log('   2. Restaurer le fichier pigeon_manager.db depuis une sauvegarde');
  process.exit(1);
}

if (mysqlAvailable) {
  console.log('\n🔧 Configuration MySQL...');
  
  // Exécuter le script d'initialisation MySQL
  const { spawn } = require('child_process');
  
  const initScript = spawn('node', ['init-mysql-database.js'], {
    cwd: __dirname
  });
  
  initScript.stdout.on('data', (data) => {
    process.stdout.write(data);
  });
  
  initScript.stderr.on('data', (data) => {
    process.stderr.write(data);
  });
  
  initScript.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Configuration MySQL terminée avec succès !');
      
      // Vérifier si nous devons migrer les données depuis SQLite
      if (sqliteExists) {
        console.log('\n📋 Données SQLite détectées. Migration recommandée vers MySQL.');
        console.log('   Exécutez: node migrate-from-sqlite.js');
      }
      
      console.log('\n🎉 Configuration complète terminée !');
    } else {
      console.log(`\n❌ Erreur lors de la configuration MySQL (code: ${code})`);
      console.log('   Consultez le guide mysql-setup-guide.md pour la configuration manuelle');
    }
  });
} else {
  console.log('\n⚠️  Mode lecture seule avec SQLite');
  console.log('   Certaines fonctionnalités (modification, suppression) seront limitées');
  console.log('   Pour activer toutes les fonctionnalités, installez MySQL');
  
  console.log('\n📋 Pour installer MySQL:');
  console.log('   1. Suivez le guide: mysql-setup-guide.md');
  console.log('   2. Exécutez à nouveau ce script');
}