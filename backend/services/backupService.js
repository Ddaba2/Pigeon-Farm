const { executeQuery } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');
const { 
  getBackupDirectory, 
  getBackupFilePath, 
  getBackupFilename, 
  backupOptions 
} = require('../config/backup-config');

class BackupService {
  constructor() {
    // Utilise la configuration personnalisable
    this.backupDir = null; // Sera défini dynamiquement par utilisateur
  }

  // Obtenir le répertoire de sauvegarde pour un utilisateur
  getBackupDir(userId = null) {
    return getBackupDirectory(userId);
  }

  // Créer le dossier de sauvegarde s'il n'existe pas
  async ensureBackupDirectory(userId = null) {
    try {
      const backupDir = this.getBackupDir(userId);
      await fs.mkdir(backupDir, { recursive: true });
      console.log(`📁 Dossier de sauvegarde prêt: ${backupDir}`);
    } catch (error) {
      console.error('❌ Erreur création dossier backup:', error);
    }
  }

  // 📦 SAUVEGARDE : Exporter toutes les données d'un utilisateur
  async exportUserData(userId) {
    try {
      console.log(`📦 Début de l'export des données pour l'utilisateur ID: ${userId}`);

      // 1. Récupérer les données utilisateur
      const [user] = await executeQuery(
        'SELECT id, username, email, full_name, role, avatar_url, created_at FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // 2. Récupérer tous les couples
      const couples = await executeQuery(
        'SELECT * FROM couples WHERE user_id = ?',
        [userId]
      );

      // 3. Récupérer tous les œufs liés aux couples
      const coupleIds = couples.map(c => c.id);
      let eggs = [];
      if (coupleIds.length > 0) {
        const placeholders = coupleIds.map(() => '?').join(',');
        eggs = await executeQuery(
          `SELECT * FROM eggs WHERE coupleId IN (${placeholders})`,
          coupleIds
        );
      }

      // 4. Récupérer tous les pigeonneaux
      let pigeonneaux = [];
      if (coupleIds.length > 0) {
        const placeholders = coupleIds.map(() => '?').join(',');
        pigeonneaux = await executeQuery(
          `SELECT * FROM pigeonneaux WHERE coupleId IN (${placeholders})`,
          coupleIds
        );
      }

      // 5. Récupérer les enregistrements de santé
      const healthRecords = await executeQuery(
        'SELECT * FROM healthRecords WHERE user_id = ?',
        [userId]
      );

      // 6. Récupérer les ventes
      const sales = await executeQuery(
        'SELECT * FROM sales WHERE user_id = ?',
        [userId]
      );

      // 7. Récupérer les notifications
      const notifications = await executeQuery(
        'SELECT * FROM notifications WHERE user_id = ?',
        [userId]
      );

      // 8. Récupérer les préférences utilisateur
      let preferences = [];
      try {
        preferences = await executeQuery(
          'SELECT * FROM user_preferences WHERE user_id = ?',
          [userId]
        );
      } catch (error) {
        console.warn('⚠️ Table user_preferences non disponible');
      }

      // Construire l'objet de sauvegarde
      const backup = {
        metadata: {
          version: '1.0',
          exportDate: new Date().toISOString(),
          userId: userId,
          username: user.username
        },
        user: user,
        couples: couples,
        eggs: eggs,
        pigeonneaux: pigeonneaux,
        healthRecords: healthRecords,
        sales: sales,
        notifications: notifications,
        preferences: preferences,
        statistics: {
          totalCouples: couples.length,
          totalEggs: eggs.length,
          totalPigeonneaux: pigeonneaux.length,
          totalHealthRecords: healthRecords.length,
          totalSales: sales.length
        }
      };

      console.log(`✅ Export terminé - ${backup.statistics.totalCouples} couples, ${backup.statistics.totalPigeonneaux} pigeonneaux`);
      
      return backup;
    } catch (error) {
      console.error('❌ Erreur lors de l\'export:', error);
      throw new Error(`Erreur lors de l'export des données: ${error.message}`);
    }
  }

  // 💾 SAUVEGARDER : Enregistrer la sauvegarde dans un fichier
  async saveBackupToFile(userId, backupData) {
    try {
      await this.ensureBackupDirectory(userId);

      const filename = getBackupFilename(userId);
      const filepath = getBackupFilePath(userId, filename);

      await fs.writeFile(filepath, JSON.stringify(backupData, null, 2), 'utf8');

      const size = (JSON.stringify(backupData).length / 1024).toFixed(2);
      
      console.log(`✅ Sauvegarde enregistrée: ${filename}`);
      console.log(`📁 Emplacement: ${filepath}`);
      console.log(`📊 Taille: ${size} KB`);
      
      return {
        success: true,
        filename: filename,
        filepath: filepath,
        size: size + ' KB',
        location: this.getBackupDir(userId)
      };
    } catch (error) {
      console.error('❌ Erreur sauvegarde fichier:', error);
      throw new Error(`Erreur lors de l'enregistrement: ${error.message}`);
    }
  }

  // 📥 RESTAURER : Importer les données d'un utilisateur
  async importUserData(userId, backupData, options = {}) {
    try {
      const { 
        clearExisting = false, 
        skipNotifications = true 
      } = options;

      console.log(`📥 Début de l'import des données pour l'utilisateur ID: ${userId}`);

      // Vérifier la version du backup
      if (!backupData.metadata || !backupData.metadata.version) {
        throw new Error('Format de sauvegarde invalide');
      }

      let imported = {
        couples: 0,
        eggs: 0,
        pigeonneaux: 0,
        healthRecords: 0,
        sales: 0,
        notifications: 0
      };

      // Si clearExisting = true, supprimer les données existantes
      if (clearExisting) {
        console.log('🗑️ Suppression des données existantes...');
        await this.clearUserData(userId);
      }

      // 1. Importer les couples avec mapping des anciens IDs
      const coupleIdMap = new Map(); // Anciens ID -> Nouveaux ID
      
      if (backupData.couples && backupData.couples.length > 0) {
        for (const couple of backupData.couples) {
          const result = await executeQuery(
            'INSERT INTO couples (nestNumber, race, maleId, femaleId, formationDate, observations, status, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
            [
              couple.nestNumber,
              couple.race,
              couple.maleId,
              couple.femaleId,
              couple.formationDate,
              couple.observations || '',
              couple.status || 'active',
              userId,
              couple.created_at
            ]
          );
          coupleIdMap.set(couple.id, result.insertId);
          imported.couples++;
        }
      }

      // 2. Importer les œufs avec les nouveaux IDs de couples
      const eggIdMap = new Map();
      
      if (backupData.eggs && backupData.eggs.length > 0) {
        for (const egg of backupData.eggs) {
          const newCoupleId = coupleIdMap.get(egg.coupleId);
          if (newCoupleId) {
            const result = await executeQuery(
              'INSERT INTO eggs (coupleId, egg1Date, egg2Date, hatchDate1, hatchDate2, success1, success2, observations, createdAt, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
              [
                newCoupleId,
                egg.egg1Date,
                egg.egg2Date,
                egg.hatchDate1,
                egg.hatchDate2,
                egg.success1,
                egg.success2,
                egg.observations || '',
                egg.createdAt
              ]
            );
            eggIdMap.set(egg.id, result.insertId);
            imported.eggs++;
          }
        }
      }

      // 3. Importer les pigeonneaux
      if (backupData.pigeonneaux && backupData.pigeonneaux.length > 0) {
        for (const pigeonneau of backupData.pigeonneaux) {
          const newCoupleId = coupleIdMap.get(pigeonneau.coupleId);
          const newEggId = eggIdMap.get(pigeonneau.eggRecordId);
          
          if (newCoupleId) {
            await executeQuery(
              'INSERT INTO pigeonneaux (coupleId, eggRecordId, birthDate, sex, weight, weaningDate, status, salePrice, saleDate, buyer, observations, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
              [
                newCoupleId,
                newEggId,
                pigeonneau.birthDate,
                pigeonneau.sex,
                pigeonneau.weight,
                pigeonneau.weaningDate,
                pigeonneau.status,
                pigeonneau.salePrice,
                pigeonneau.saleDate,
                pigeonneau.buyer,
                pigeonneau.observations || '',
                pigeonneau.created_at
              ]
            );
            imported.pigeonneaux++;
          }
        }
      }

      // 4. Importer les enregistrements de santé
      if (backupData.healthRecords && backupData.healthRecords.length > 0) {
        for (const record of backupData.healthRecords) {
          await executeQuery(
            'INSERT INTO healthRecords (entityType, entityId, treatmentDate, treatmentType, medicationName, dosage, vetName, nextVisitDate, observations, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
            [
              record.entityType,
              record.entityId,
              record.treatmentDate,
              record.treatmentType,
              record.medicationName,
              record.dosage,
              record.vetName,
              record.nextVisitDate,
              record.observations || '',
              userId,
              record.created_at
            ]
          );
          imported.healthRecords++;
        }
      }

      // 5. Importer les ventes
      if (backupData.sales && backupData.sales.length > 0) {
        for (const sale of backupData.sales) {
          await executeQuery(
            'INSERT INTO sales (pigeonneauId, saleDate, buyerName, buyerContact, salePrice, paymentMethod, observations, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
            [
              sale.pigeonneauId,
              sale.saleDate,
              sale.buyerName,
              sale.buyerContact,
              sale.salePrice,
              sale.paymentMethod || 'cash',
              sale.observations || '',
              userId,
              sale.created_at
            ]
          );
          imported.sales++;
        }
      }

      // 6. Importer les notifications (optionnel)
      if (!skipNotifications && backupData.notifications && backupData.notifications.length > 0) {
        for (const notification of backupData.notifications) {
          await executeQuery(
            'INSERT INTO notifications (user_id, type, title, message, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [
              userId,
              notification.type,
              notification.title,
              notification.message,
              notification.is_read,
              notification.created_at
            ]
          );
          imported.notifications++;
        }
      }

      console.log(`✅ Import terminé:`, imported);

      return {
        success: true,
        imported: imported
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'import:', error);
      throw new Error(`Erreur lors de l'import des données: ${error.message}`);
    }
  }

  // 🗑️ NETTOYER : Supprimer toutes les données d'un utilisateur
  async clearUserData(userId) {
    try {
      console.log(`🗑️ Suppression des données pour l'utilisateur ID: ${userId}`);

      // Ordre important pour respecter les contraintes de clés étrangères
      await executeQuery('DELETE FROM notifications WHERE user_id = ?', [userId]);
      await executeQuery('DELETE FROM sales WHERE user_id = ?', [userId]);
      await executeQuery('DELETE FROM healthRecords WHERE user_id = ?', [userId]);
      
      // Supprimer les pigeonneaux et œufs liés aux couples de l'utilisateur
      await executeQuery(`
        DELETE p FROM pigeonneaux p
        INNER JOIN couples c ON p.coupleId = c.id
        WHERE c.user_id = ?
      `, [userId]);
      
      await executeQuery(`
        DELETE e FROM eggs e
        INNER JOIN couples c ON e.coupleId = c.id
        WHERE c.user_id = ?
      `, [userId]);
      
      await executeQuery('DELETE FROM couples WHERE user_id = ?', [userId]);

      console.log(`✅ Données supprimées pour l'utilisateur ID: ${userId}`);
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      throw new Error(`Erreur lors du nettoyage: ${error.message}`);
    }
  }

  // 📋 LISTER : Obtenir la liste des sauvegardes disponibles
  async listBackups(userId = null) {
    try {
      const backupDir = this.getBackupDir(userId);
      await this.ensureBackupDirectory(userId);
      
      const files = await fs.readdir(backupDir);
      const backups = [];

      for (const file of files) {
        if (file.endsWith('.json') && file.startsWith('backup_')) {
          const filepath = path.join(backupDir, file);
          const stats = await fs.stat(filepath);
          
          // Filtrer par userId si spécifié
          if (userId && !file.includes(`user${userId}_`)) {
            continue;
          }

          backups.push({
            filename: file,
            filepath: filepath,
            size: (stats.size / 1024).toFixed(2) + ' KB',
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
          });
        }
      }

      return backups.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('❌ Erreur liste backups:', error);
      return [];
    }
  }

  // 📖 LIRE : Charger une sauvegarde depuis un fichier
  async loadBackupFromFile(filename, userId = null) {
    try {
      const backupDir = this.getBackupDir(userId);
      const filepath = path.join(backupDir, filename);
      const data = await fs.readFile(filepath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Erreur chargement backup:', error);
      throw new Error(`Erreur lors du chargement: ${error.message}`);
    }
  }
}

module.exports = new BackupService();
