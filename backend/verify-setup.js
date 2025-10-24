#!/usr/bin/env node

/**
 * Script de vérification complète de la configuration de PigeonFarm
 * 
 * Ce script vérifie :
 * 1. L'installation des dépendances
 * 2. La configuration de la base de données
 * 3. La création de l'administrateur
 * 4. L'export des modules
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification complète de la configuration de PigeonFarm');
console.log('=====================================================\n');

// Vérifier l'installation des dépendances
console.log('1. Vérification des dépendances...');
try {
  const packageLock = require('./package-lock.json');
  console.log('   ✅ package-lock.json trouvé');
  
  const nodeModulesExists = fs.existsSync('./node_modules');
  if (nodeModulesExists) {
    console.log('   ✅ node_modules trouvé');
  } else {
    console.log('   ⚠️  node_modules non trouvé (exécutez "npm install")');
  }
} catch (error) {
  console.log('   ❌ Erreur lors de la vérification des dépendances:', error.message);
}

// Vérifier les fichiers de configuration
console.log('\n2. Vérification des fichiers de configuration...');
const configFiles = [
  'config.env',
  'env.example'
];

configFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  if (exists) {
    console.log(`   ✅ ${file} trouvé`);
  } else {
    console.log(`   ❌ ${file} manquant`);
  }
});

// Vérifier les scripts principaux
console.log('\n3. Vérification des scripts...');
const scripts = [
  'init-database.js',
  'create-admin-secure.js',
  'setup.js',
  'test-connection.js'
];

scripts.forEach(script => {
  const exists = fs.existsSync(path.join(__dirname, script));
  if (exists) {
    console.log(`   ✅ ${script} trouvé`);
  } else {
    console.log(`   ❌ ${script} manquant`);
  }
});

// Vérifier les exports des modules
console.log('\n4. Vérification des exports des modules...');
const modules = [
  { file: 'init-database.js', export: 'initializeDatabase' },
  { file: 'create-admin-secure.js', export: 'createSecureAdmin' },
  { file: 'setup.js', export: 'setupApplication' },
  { file: 'test-connection.js', export: 'testConnection' }
];

modules.forEach(module => {
  try {
    const mod = require(`./${module.file}`);
    if (typeof mod[module.export] === 'function') {
      console.log(`   ✅ ${module.file} exporte ${module.export}`);
    } else {
      console.log(`   ❌ ${module.file} n'exporte pas ${module.export}`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur lors de l'import de ${module.file}:`, error.message);
  }
});

// Vérifier package.json
console.log('\n5. Vérification de package.json...');
try {
  const packageJson = require('./package.json');
  console.log('   ✅ package.json trouvé');
  
  const requiredScripts = ['setup', 'test:connection'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`   ✅ Script npm "${script}" configuré`);
    } else {
      console.log(`   ❌ Script npm "${script}" manquant`);
    }
  });
} catch (error) {
  console.log('   ❌ Erreur lors de la vérification de package.json:', error.message);
}

console.log('\n🎉 Vérification terminée !');
console.log('=====================================================');
console.log('\nPour tester la configuration :');
console.log('   npm run test:connection');
console.log('\nPour configurer l\'application :');
console.log('   npm run setup');
console.log('\nPour les utilisateurs Windows :');
console.log('   Double-cliquez sur setup-backend.bat');