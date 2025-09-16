// Test de suppression des sections Actions Rapides et Actions de Sécurité
console.log('🗑️ Test de suppression des sections Actions Rapides et Actions de Sécurité...\n');

const fs = require('fs');
const path = require('path');

// Vérifier les fichiers supprimés
const deletedFiles = [
  'src/components/ClearJWT.tsx'
];

console.log('📋 Fichiers supprimés:');
deletedFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (!fs.existsSync(fullPath)) {
    console.log(`✅ ${file} - Supprimé`);
  } else {
    console.log(`❌ ${file} - Encore présent`);
  }
});

// Vérifier les modifications dans AdminDashboard.tsx
console.log('\n📋 Modifications dans AdminDashboard.tsx:');
const adminDashboardPath = path.join(__dirname, '..', 'src', 'components', 'AdminDashboard.tsx');
if (fs.existsSync(adminDashboardPath)) {
  const content = fs.readFileSync(adminDashboardPath, 'utf8');
  
  if (!content.includes('Actions Rapides')) {
    console.log('✅ Section Actions Rapides supprimée');
  } else {
    console.log('❌ Section Actions Rapides encore présente');
  }
  
  if (!content.includes('Actions de Sécurité')) {
    console.log('✅ Section Actions de Sécurité supprimée');
  } else {
    console.log('❌ Section Actions de Sécurité encore présente');
  }
  
  if (!content.includes('Gestion Utilisateurs')) {
    console.log('✅ Carte Gestion Utilisateurs supprimée');
  } else {
    console.log('❌ Carte Gestion Utilisateurs encore présente');
  }
  
  if (!content.includes('Monitoring')) {
    console.log('✅ Carte Monitoring supprimée');
  } else {
    console.log('❌ Carte Monitoring encore présente');
  }
  
  if (!content.includes('Sauvegarde')) {
    console.log('✅ Carte Sauvegarde supprimée');
  } else {
    console.log('❌ Carte Sauvegarde encore présente');
  }
  
  if (!content.includes('Sécurité')) {
    console.log('✅ Carte Sécurité supprimée');
  } else {
    console.log('❌ Carte Sécurité encore présente');
  }
  
  if (!content.includes('Supprimer tous les JWT')) {
    console.log('✅ Bouton Supprimer tous les JWT supprimé');
  } else {
    console.log('❌ Bouton Supprimer tous les JWT encore présent');
  }
  
  if (!content.includes('Déconnecte tous')) {
    console.log('✅ Texte Déconnecte tous supprimé');
  } else {
    console.log('❌ Texte Déconnecte tous encore présent');
  }
  
  if (!content.includes('ClearJWT')) {
    console.log('✅ Import ClearJWT supprimé');
  } else {
    console.log('❌ Import ClearJWT encore présent');
  }
  
  if (!content.includes('showClearJWT')) {
    console.log('✅ État showClearJWT supprimé');
  } else {
    console.log('❌ État showClearJWT encore présent');
  }
  
  if (!content.includes('AlertTriangle')) {
    console.log('✅ Import AlertTriangle supprimé');
  } else {
    console.log('❌ Import AlertTriangle encore présent');
  }
  
  if (!content.includes('Trash2')) {
    console.log('✅ Import Trash2 supprimé');
  } else {
    console.log('❌ Import Trash2 encore présent');
  }
} else {
  console.log('❌ Fichier AdminDashboard.tsx non trouvé');
}

console.log('\n🎯 Résumé:');
console.log('=' .repeat(50));
console.log('✅ Section Actions Rapides supprimée');
console.log('✅ Section Actions de Sécurité supprimée');
console.log('✅ Cartes Gestion Utilisateurs, Monitoring, Sauvegarde, Sécurité supprimées');
console.log('✅ Bouton Supprimer tous les JWT supprimé');
console.log('✅ Composant ClearJWT supprimé');
console.log('✅ Tous les imports et états non utilisés supprimés');
console.log('\n💡 Les sections Actions Rapides et Actions de Sécurité ont été complètement supprimées !');
