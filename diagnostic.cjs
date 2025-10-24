/**
 * Script de diagnostic pour identifier les problèmes dans l'application Pigeon Farm
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnostic de l\'application Pigeon Farm');
console.log('========================================');

// 1. Vérifier la configuration de la base de données
console.log('\n1. Vérification de la configuration de la base de données...');

// Vérifier si le fichier config.env existe
const configEnvPath = path.join(__dirname, 'backend', 'config.env');
if (fs.existsSync(configEnvPath)) {
  console.log('✅ Fichier config.env trouvé');
  const configContent = fs.readFileSync(configEnvPath, 'utf8');
  console.log('📄 Contenu du fichier config.env:');
  console.log(configContent);
} else {
  console.log('❌ Fichier config.env non trouvé');
}

// 2. Vérifier la configuration du backend
console.log('\n2. Vérification de la configuration du backend...');

const configJsPath = path.join(__dirname, 'backend', 'config', 'config.js');
if (fs.existsSync(configJsPath)) {
  console.log('✅ Fichier config.js trouvé');
  const config = require('./backend/config/config.js');
  console.log('📄 Configuration du backend:');
  console.log(`   Port: ${config.config.port}`);
  console.log(`   Environment: ${config.config.nodeEnv}`);
  console.log(`   Database: ${config.config.database.name} sur ${config.config.database.host}:${config.config.database.port}`);
} else {
  console.log('❌ Fichier config.js non trouvé');
}

// 3. Vérifier la configuration de la base de données
console.log('\n3. Vérification de la configuration de la base de données...');

const databaseJsPath = path.join(__dirname, 'backend', 'config', 'database.js');
if (fs.existsSync(databaseJsPath)) {
  console.log('✅ Fichier database.js trouvé');
  
  // Vérifier si MySQL est installé
  try {
    require('mysql2/promise');
    console.log('✅ Module MySQL2 trouvé');
  } catch (error) {
    console.log('❌ Module MySQL2 non trouvé:', error.message);
  }
} else {
  console.log('❌ Fichier database.js non trouvé');
}

// 4. Vérifier les dépendances
console.log('\n4. Vérification des dépendances...');

const packageJsonPath = path.join(__dirname, 'backend', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log('📄 Dépendances du backend:');
  
  const requiredDeps = ['mysql2', 'express', 'bcryptjs', 'cors', 'cookie-parser'];
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`   ❌ ${dep}: non trouvé`);
    }
  });
} else {
  console.log('❌ Fichier package.json du backend non trouvé');
}

// 5. Vérifier la structure de la base de données
console.log('\n5. Vérification de la structure de la base de données...');

const dbSchemaPath = path.join(__dirname, 'backend', 'db_schema.sql');
if (fs.existsSync(dbSchemaPath)) {
  console.log('✅ Fichier db_schema.sql trouvé');
  const schemaContent = fs.readFileSync(dbSchemaPath, 'utf8');
  
  // Compter les tables
  const tableMatches = schemaContent.match(/CREATE TABLE IF NOT EXISTS (\w+)/g);
  if (tableMatches) {
    console.log(`   📊 Tables définies: ${tableMatches.length}`);
    tableMatches.forEach(match => {
      const tableName = match.replace('CREATE TABLE IF NOT EXISTS ', '');
      console.log(`      - ${tableName}`);
    });
  }
} else {
  console.log('❌ Fichier db_schema.sql non trouvé');
}

// 6. Vérifier les services
console.log('\n6. Vérification des services...');

const servicesDir = path.join(__dirname, 'backend', 'services');
if (fs.existsSync(servicesDir)) {
  console.log('✅ Répertoire des services trouvé');
  const services = fs.readdirSync(servicesDir);
  console.log(`   📄 Services disponibles: ${services.length}`);
  services.forEach(service => {
    console.log(`      - ${service}`);
  });
} else {
  console.log('❌ Répertoire des services non trouvé');
}

// 7. Vérifier les routes
console.log('\n7. Vérification des routes...');

const routesDir = path.join(__dirname, 'backend', 'routes');
if (fs.existsSync(routesDir)) {
  console.log('✅ Répertoire des routes trouvé');
  const routes = fs.readdirSync(routesDir);
  console.log(`   📄 Routes disponibles: ${routes.length}`);
  routes.forEach(route => {
    console.log(`      - ${route}`);
  });
} else {
  console.log('❌ Répertoire des routes non trouvé');
}

console.log('\n📋 Résumé des problèmes identifiés:');
console.log('====================================');

console.log('\n🔍 Problèmes potentiels à résoudre:');
console.log('1. MySQL peut ne pas être installé ou en cours d\'exécution');
console.log('2. Les dépendances MySQL2 peuvent ne pas être installées');
console.log('3. La base de données "pigeon_manager" peut ne pas exister');
console.log('4. Les identifiants de connexion à la base de données peuvent être incorrects');

console.log('\n🔧 Solutions recommandées:');
console.log('1. Installer MySQL sur votre système');
console.log('2. Exécuter "npm install" dans le répertoire backend');
console.log('3. Créer la base de données "pigeon_manager"');
console.log('4. Vérifier les identifiants dans le fichier config.env');

console.log('\n🚀 Commandes à exécuter:');
console.log('   cd backend');
console.log('   npm install');
console.log('   npm run init-db  # Si disponible');
console.log('   npm start');

console.log('\n✅ Diagnostic terminé');