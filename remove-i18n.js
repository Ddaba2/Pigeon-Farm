const fs = require('fs');
const path = require('path');

// Liste des fichiers à traiter
const files = [
  'src/components/UsersManagement.tsx',
  'src/components/Statistics.tsx',
  'src/components/Profile.tsx',
  'src/components/PrivacyPolicy.tsx',
  'src/components/PigeonnalManagement.tsx',
  'src/components/NotificationContext.tsx',
  'src/components/HealthTracking.tsx',
  'src/components/EggTracking.tsx',
  'src/components/Documentation.tsx',
  'src/components/CoupleHistory.tsx',
  'src/components/BackupRestore.tsx',
  'src/components/AuditLogs.tsx'
];

// Mappings de traductions communes
const translations = {
  // Navigation et titres
  'dashboard': 'Tableau de bord',
  'couples': 'Couples',
  'eggs': 'Œufs',
  'pigeonneaux': 'Pigeonneaux',
  'health': 'Santé',
  'statistics': 'Statistiques',
  'backup': 'Sauvegarde',
  'help': 'Aide',
  'users': 'Utilisateurs',
  'profile': 'Profil',
  'settings': 'Paramètres',
  
  // Actions
  'add': 'Ajouter',
  'edit': 'Modifier',
  'delete': 'Supprimer',
  'save': 'Enregistrer',
  'cancel': 'Annuler',
  'close': 'Fermer',
  'submit': 'Soumettre',
  'confirm': 'Confirmer',
  'back': 'Retour',
  'next': 'Suivant',
  'previous': 'Précédent',
  
  // Statuts
  'active': 'Actif',
  'inactive': 'Inactif',
  'pending': 'En attente',
  'completed': 'Terminé',
  'error': 'Erreur',
  'success': 'Succès',
  'warning': 'Avertissement',
  
  // Formulaires
  'name': 'Nom',
  'email': 'Email',
  'password': 'Mot de passe',
  'username': 'Nom d\'utilisateur',
  'description': 'Description',
  'notes': 'Notes',
  'date': 'Date',
  'status': 'Statut',
  'type': 'Type',
  'quantity': 'Quantité',
  'price': 'Prix',
  
  // Messages
  'loading': 'Chargement...',
  'noData': 'Aucune donnée',
  'noResults': 'Aucun résultat',
  'errorOccurred': 'Une erreur est survenue',
  'successMessage': 'Opération réussie',
  'confirmDelete': 'Êtes-vous sûr de vouloir supprimer ?',
  
  // Spécifique aux pigeons
  'male': 'Mâle',
  'female': 'Femelle',
  'couple': 'Couple',
  'egg': 'Œuf',
  'pigeonneau': 'Pigeonneau',
  'breeding': 'Reproduction',
  'hatching': 'Éclosion',
  'healthRecord': 'Fiche de santé',
  'vaccination': 'Vaccination',
  'treatment': 'Traitement',
  
  // Temps
  'today': 'Aujourd\'hui',
  'yesterday': 'Hier',
  'tomorrow': 'Demain',
  'thisWeek': 'Cette semaine',
  'thisMonth': 'Ce mois',
  'thisYear': 'Cette année',
  
  // Général
  'yes': 'Oui',
  'no': 'Non',
  'ok': 'OK',
  'all': 'Tous',
  'none': 'Aucun',
  'other': 'Autre',
  'unknown': 'Inconnu',
  'notDefined': 'Non défini',
  'notAvailable': 'Non disponible'
};

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Fichier non trouvé: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Supprimer l'import useTranslation
  const importRegex = /import\s+\{\s*useTranslation\s*\}\s+from\s+['"]react-i18next['"];?\s*\n?/g;
  if (importRegex.test(content)) {
    content = content.replace(importRegex, '');
    modified = true;
    console.log(`✅ Import useTranslation supprimé dans ${filePath}`);
  }
  
  // Supprimer les déclarations const { t } = useTranslation();
  const declarationRegex = /const\s+\{\s*t\s*\}\s*=\s*useTranslation\(\);?\s*\n?/g;
  if (declarationRegex.test(content)) {
    content = content.replace(declarationRegex, '');
    modified = true;
    console.log(`✅ Déclaration useTranslation supprimée dans ${filePath}`);
  }
  
  // Remplacer les appels t('key') par les traductions
  const tCallRegex = /t\(['"`]([^'"`]+)['"`]\)/g;
  let match;
  while ((match = tCallRegex.exec(content)) !== null) {
    const key = match[1];
    const translation = translations[key] || key;
    content = content.replace(match[0], `"${translation}"`);
    modified = true;
    console.log(`✅ ${match[0]} → "${translation}" dans ${filePath}`);
  }
  
  // Remplacer les appels t('key', { count: n }) par des textes conditionnels
  const tCallWithCountRegex = /t\(['"`]([^'"`]+)['"`],\s*\{\s*count:\s*([^}]+)\s*\}\)/g;
  while ((match = tCallWithCountRegex.exec(content)) !== null) {
    const key = match[1];
    const countVar = match[2];
    let replacement;
    
    if (key === 'couple') {
      replacement = `${countVar} === 1 ? 'couple' : 'couples'`;
    } else if (key === 'egg') {
      replacement = `${countVar} === 1 ? 'œuf' : 'œufs'`;
    } else if (key === 'pigeonneau') {
      replacement = `${countVar} === 1 ? 'pigeonneau' : 'pigeonneaux'`;
    } else {
      replacement = `"${translations[key] || key}"`;
    }
    
    content = content.replace(match[0], replacement);
    modified = true;
    console.log(`✅ ${match[0]} → ${replacement} dans ${filePath}`);
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fichier mis à jour: ${filePath}`);
  } else {
    console.log(`ℹ️  Aucune modification nécessaire: ${filePath}`);
  }
}

console.log('🔄 Début de la suppression des références i18n...\n');

files.forEach(file => {
  processFile(file);
});

console.log('\n✅ Suppression des références i18n terminée !');
console.log('\n📋 Prochaines étapes :');
console.log('1. Vérifier que l\'application compile sans erreurs');
console.log('2. Tester l\'interface utilisateur');
console.log('3. Corriger manuellement les traductions manquantes si nécessaire'); 