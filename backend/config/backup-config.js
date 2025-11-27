const path = require('path');
const os = require('os');

/**
 * Configuration des emplacements de sauvegarde
 * 
 * Vous pouvez personnaliser où les sauvegardes sont stockées en modifiant ce fichier
 */

// OPTION 1 : Sauvegarde dans le dossier backend/backups (PAR DÉFAUT)
const defaultBackupDir = path.join(__dirname, '../backups');

// OPTION 2 : Sauvegarde dans un dossier utilisateur séparé pour chaque utilisateur
// Exemple : backend/backups/user_1/, backend/backups/user_2/
const getUserBackupDir = (userId) => {
  return path.join(__dirname, '../backups', `user_${userId}`);
};

// OPTION 3 : Sauvegarde dans le dossier Documents de Windows
// Exemple : C:\Users\VotreNom\Documents\PigeonFarm-Backups\
const documentsBackupDir = path.join(
  os.homedir(), 
  'Documents', 
  'PigeonFarm-Backups'
);

// OPTION 4 : Sauvegarde sur un disque externe ou réseau
// Exemple : D:\Sauvegardes\PigeonFarm\
const externalBackupDir = 'D:\\Sauvegardes\\PigeonFarm';

// OPTION 5 : Sauvegarde dans un dossier personnalisé
const customBackupDir = 'C:\\MesSauvegardes\\PigeonFarm';

/**
 * CHOISISSEZ VOTRE CONFIGURATION ICI
 * Décommentez l'option que vous voulez utiliser
 */

// 👇 CONFIGURATION ACTIVE (modifiez cette ligne)
// RECOMMANDATION : Utilisez Documents pour synchronisation OneDrive
const activeBackupDir = documentsBackupDir;  // ← RECOMMANDÉ pour la plupart des utilisateurs

// OU gardez le dossier backend (par défaut) :
// const activeBackupDir = defaultBackupDir;

// OU choisissez une autre option :
// const activeBackupDir = externalBackupDir;
// const activeBackupDir = customBackupDir;

/**
 * Options de sauvegarde
 */
const backupOptions = {
  // Activer la sauvegarde par utilisateur (dossiers séparés)
  separateUserFolders: true,  // ✅ RECOMMANDÉ : un dossier par utilisateur
  
  // Nombre maximum de sauvegardes à conserver par utilisateur
  maxBackupsPerUser: 10,  // ✅ Conserve les 10 dernières versions
  
  // Durée de rétention en jours (0 = pas de limite)
  retentionDays: 30,  // ✅ Supprime après 30 jours
  
  // Activer la compression des sauvegardes
  enableCompression: false,  // true = fichiers .json.gz
  
  // Sauvegarde automatique
  autoBackup: {
    enabled: false,  // true = sauvegarde automatique activée
    frequency: 'weekly',  // 'daily', 'weekly', 'monthly'
    time: '02:00',  // Heure au format HH:mm
  },
  
  // Notification par email après sauvegarde
  emailNotification: {
    enabled: false,
    recipients: ['admin@pigeonfarm.com']
  }
};

/**
 * Fonction pour obtenir le répertoire de sauvegarde
 */
const getBackupDirectory = (userId = null) => {
  if (backupOptions.separateUserFolders && userId) {
    return getUserBackupDir(userId);
  }
  return activeBackupDir;
};

/**
 * Fonction pour obtenir le chemin complet d'une sauvegarde
 */
const getBackupFilePath = (userId, filename = null) => {
  const dir = getBackupDirectory(userId);
  
  if (!filename) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    filename = `backup_user${userId}_${timestamp}.json`;
  }
  
  return path.join(dir, filename);
};

/**
 * Format du nom de fichier
 * Personnalisable selon vos préférences
 */
const getBackupFilename = (userId, customName = null) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const date = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
  
  if (customName) {
    return `${customName}_${timestamp}.json`;
  }
  
  // Formats disponibles :
  // Format 1 : backup_user1_2025-10-27T14-30-00-000Z.json (PAR DÉFAUT)
  return `backup_user${userId}_${timestamp}.json`;
  
  // Format 2 : PigeonFarm_User1_27-10-2025_14h30.json
  // const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
  // return `PigeonFarm_User${userId}_${date}_${time}.json`;
  
  // Format 3 : user1_backup_20251027.json
  // const dateCompact = new Date().toISOString().split('T')[0].replace(/-/g, '');
  // return `user${userId}_backup_${dateCompact}.json`;
};

module.exports = {
  activeBackupDir,
  backupOptions,
  getBackupDirectory,
  getBackupFilePath,
  getBackupFilename,
  getUserBackupDir,
  
  // Emplacements disponibles (pour affichage dans l'interface)
  availableLocations: {
    default: defaultBackupDir,
    documents: documentsBackupDir,
    external: externalBackupDir,
    custom: customBackupDir
  }
};
