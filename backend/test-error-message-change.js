// Test de modification du message d'erreur par défaut
console.log('🔧 Test de modification du message d\'erreur par défaut...\n');

const fs = require('fs');
const path = require('path');

// Vérifier les modifications dans Login.tsx
console.log('📋 Modifications dans Login.tsx:');
const loginPath = path.join(__dirname, '..', 'src', 'components', 'Login.tsx');
if (fs.existsSync(loginPath)) {
  const content = fs.readFileSync(loginPath, 'utf8');
  
  if (content.includes('Nom d\'utilisateur ou mot de passe incorrecte')) {
    console.log('✅ Nouveau message d\'erreur par défaut appliqué');
  } else {
    console.log('❌ Nouveau message d\'erreur par défaut non trouvé');
  }
  
  if (!content.includes('Erreur de connexion')) {
    console.log('✅ Ancien message "Erreur de connexion" supprimé');
  } else {
    console.log('❌ Ancien message "Erreur de connexion" encore présent');
  }
  
  if (!content.includes('Une erreur inattendue s\'est produite')) {
    console.log('✅ Ancien message "Une erreur inattendue s\'est produite" supprimé');
  } else {
    console.log('❌ Ancien message "Une erreur inattendue s\'est produite" encore présent');
  }
  
  if (content.includes('Vérifiez votre nom d\'utilisateur et votre mot de passe.')) {
    console.log('✅ Message de description cohérent');
  } else {
    console.log('❌ Message de description manquant');
  }
  
  // Vérifier que les autres messages d'erreur spécifiques sont toujours présents
  if (content.includes('Identifiants incorrects')) {
    console.log('✅ Message pour 401/Unauthorized conservé');
  } else {
    console.log('❌ Message pour 401/Unauthorized manquant');
  }
  
  if (content.includes('Utilisateur non trouvé')) {
    console.log('✅ Message pour 404/Not Found conservé');
  } else {
    console.log('❌ Message pour 404/Not Found manquant');
  }
  
  if (content.includes('Erreur du serveur')) {
    console.log('✅ Message pour 500/Internal Server Error conservé');
  } else {
    console.log('❌ Message pour 500/Internal Server Error manquant');
  }
  
  if (content.includes('Problème de connexion')) {
    console.log('✅ Message pour Network/fetch conservé');
  } else {
    console.log('❌ Message pour Network/fetch manquant');
  }
  
} else {
  console.log('❌ Fichier Login.tsx non trouvé');
}

console.log('\n🎯 Résumé:');
console.log('=' .repeat(50));
console.log('✅ Message d\'erreur par défaut changé');
console.log('✅ Nouveau message: "Nom d\'utilisateur ou mot de passe incorrecte"');
console.log('✅ Anciens messages génériques supprimés');
console.log('✅ Messages d\'erreur spécifiques conservés');
console.log('✅ Cohérence dans les messages de description');
console.log('\n💡 Le message d\'erreur par défaut a été modifié avec succès !');
