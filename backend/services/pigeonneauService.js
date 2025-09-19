const { executeQuery } = require('../config/database');

class PigeonneauService {
  // Récupérer tous les pigeonneaux
  async getAllPigeonneaux() {
    try {
      const rows = await executeQuery(`
        SELECT 
          p.id,
          p.coupleId,
          c.nestNumber as coupleName,
          p.eggRecordId,
          p.birthDate,
          p.sex,
          p.weight,
          p.weaningDate,
          p.status,
          p.salePrice,
          p.saleDate,
          p.buyer,
          p.observations,
          p.created_at,
          p.updated_at
        FROM pigeonneaux p
        LEFT JOIN couples c ON p.coupleId = c.id
        ORDER BY p.created_at DESC
      `);
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des pigeonneaux: ${error.message}`);
    }
  }

  // Récupérer un pigeonneau par ID
  async getPigeonneauById(id) {
    try {
      const rows = await executeQuery(`
        SELECT 
          p.id,
          p.coupleId,
          c.nestNumber as coupleName,
          p.eggRecordId,
          p.birthDate,
          p.sex,
          p.weight,
          p.weaningDate,
          p.status,
          p.salePrice,
          p.saleDate,
          p.buyer,
          p.observations,
          p.created_at,
          p.updated_at
        FROM pigeonneaux p
        LEFT JOIN couples c ON p.coupleId = c.id
        WHERE p.id = ?
      `, [id]);
      
      return rows[0];
  } catch (error) {
      throw new Error(`Erreur lors de la récupération du pigeonneau: ${error.message}`);
    }
  }

  // Créer un nouveau pigeonneau
  async createPigeonneau(pigeonneauData) {
    try {
    const { 
      coupleId, 
      eggRecordId = null, 
      birthDate, 
      sex, 
      weight = null, 
      weaningDate = null, 
      status = 'alive', 
      salePrice = null, 
      saleDate = null, 
      buyer = null, 
      observations = '' 
    } = pigeonneauData;
    
      // Si aucun eggRecordId n'est fourni, créer un enregistrement d'œuf par défaut
      let finalEggRecordId = eggRecordId;
      if (!finalEggRecordId) {
        console.log('🔍 Création d\'un enregistrement d\'œuf par défaut pour le pigeonneau...');
        const eggResult = await executeQuery(`
          INSERT INTO eggs (coupleId, egg1Date, egg2Date, hatchDate1, hatchDate2, success1, success2, observations, createdAt, updated_at)
          VALUES (?, ?, NULL, ?, NULL, TRUE, FALSE, 'Enregistrement automatique pour pigeonneau', NOW(), NOW())
        `, [coupleId, birthDate, birthDate]);
        finalEggRecordId = eggResult.insertId;
        console.log('✅ Enregistrement d\'œuf créé avec ID:', finalEggRecordId);
      }

      const result = await executeQuery(`
        INSERT INTO pigeonneaux (coupleId, eggRecordId, birthDate, sex, weight, weaningDate, status, salePrice, saleDate, buyer, observations, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [coupleId, finalEggRecordId, birthDate, sex, weight, weaningDate, status, salePrice, saleDate, buyer, observations]);
      
      return { id: result.insertId, ...pigeonneauData };
    } catch (error) {
      throw new Error(`Erreur lors de la création du pigeonneau: ${error.message}`);
    }
  }

  // Mettre à jour un pigeonneau
  async updatePigeonneau(id, pigeonneauData) {
    try {
      const { 
        coupleId, 
        eggRecordId, 
        birthDate, 
        sex, 
        weight, 
        weaningDate, 
        status, 
        salePrice, 
        saleDate, 
        buyer, 
        observations 
      } = pigeonneauData;
      
      const result = await executeQuery(`
        UPDATE pigeonneaux 
        SET coupleId = ?, eggRecordId = ?, birthDate = ?, sex = ?, weight = ?, weaningDate = ?, status = ?, salePrice = ?, saleDate = ?, buyer = ?, observations = ?, updated_at = NOW()
        WHERE id = ?
      `, [coupleId, eggRecordId, birthDate, sex, weight, weaningDate, status, salePrice, saleDate, buyer, observations, id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Pigeonneau non trouvé');
      }
      
      return { id, ...pigeonneauData };
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du pigeonneau: ${error.message}`);
    }
  }

  // Supprimer un pigeonneau
  async deletePigeonneau(id) {
    try {
      const result = await executeQuery('DELETE FROM pigeonneaux WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Pigeonneau non trouvé');
      }
      
      return { message: 'Pigeonneau supprimé avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du pigeonneau: ${error.message}`);
    }
  }

  // Récupérer les pigeonneaux par couple
  async getPigeonneauxByCouple(coupleId) {
    try {
      const rows = await executeQuery(`
        SELECT 
          p.id,
          p.coupleId,
          c.nestNumber as coupleName,
          p.eggRecordId,
          p.birthDate,
          p.sex,
          p.weight,
          p.weaningDate,
          p.status,
          p.salePrice,
          p.saleDate,
          p.buyer,
          p.observations,
          p.created_at,
          p.updated_at
        FROM pigeonneaux p
        LEFT JOIN couples c ON p.coupleId = c.id
        WHERE p.coupleId = ?
        ORDER BY p.created_at DESC
      `, [coupleId]);
      
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des pigeonneaux: ${error.message}`);
    }
  }

  // Compter les pigeonneaux par statut
  async getPigeonneauStats() {
    try {
      const rows = await executeQuery(`
        SELECT 
          status,
          COUNT(*) as count
        FROM pigeonneaux
        GROUP BY status
      `);
      
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  // Calculer les statistiques de vente
  async getSaleStats() {
    try {
      const rows = await executeQuery(`
        SELECT 
          COUNT(*) as totalSold,
          SUM(salePrice) as totalRevenue,
          AVG(salePrice) as averagePrice
        FROM pigeonneaux
        WHERE status = 'sold' AND salePrice IS NOT NULL
      `);
      
      return {
        totalSold: rows[0].totalSold || 0,
        totalRevenue: rows[0].totalRevenue || 0,
        averagePrice: Math.round((rows[0].averagePrice || 0) * 100) / 100
      };
    } catch (error) {
      throw new Error(`Erreur lors du calcul des statistiques de vente: ${error.message}`);
    }
  }

  // Récupérer les pigeonneaux par sexe
  async getPigeonneauxBySex() {
    try {
      const rows = await executeQuery(`
        SELECT 
          sex,
          COUNT(*) as count
        FROM pigeonneaux
        GROUP BY sex
      `);
      
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques par sexe: ${error.message}`);
    }
  }
}

module.exports = new PigeonneauService(); 