const { executeQuery, executeTransaction } = require('../config/database');

class EggService {
  // Récupérer tous les œufs
  async getAllEggs() {
    try {
      const rows = await executeQuery(`
        SELECT 
          e.id,
          e.coupleId,
          c.nestNumber as coupleName,
          e.egg1Date,
          e.egg2Date,
          e.hatchDate1,
          e.hatchDate2,
          e.success1,
          e.success2,
          e.observations,
          e.createdAt,
          e.updated_at,
          CASE 
            WHEN e.success1 = 0 THEN 'failed'
            WHEN e.hatchDate1 IS NOT NULL AND e.success1 = 1 THEN 'hatched'
            WHEN e.hatchDate1 IS NOT NULL THEN 'hatched'
            ELSE 'incubation'
          END as status
        FROM eggs e
        LEFT JOIN couples c ON e.coupleId = c.id
        ORDER BY e.createdAt DESC
      `);
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des œufs: ${error.message}`);
    }
  }

  // Récupérer un œuf par ID
  async getEggById(id) {
    try {
      const rows = await executeQuery(`
        SELECT 
          e.id,
          e.coupleId,
          c.nestNumber as coupleName,
          e.egg1Date,
          e.egg2Date,
          e.hatchDate1,
          e.hatchDate2,
          e.success1,
          e.success2,
          e.observations,
          e.createdAt,
          e.updated_at,
          CASE 
            WHEN e.success1 = 0 THEN 'failed'
            WHEN e.hatchDate1 IS NOT NULL AND e.success1 = 1 THEN 'hatched'
            WHEN e.hatchDate1 IS NOT NULL THEN 'hatched'
            ELSE 'incubation'
          END as status
        FROM eggs e 
        LEFT JOIN couples c ON e.coupleId = c.id
        WHERE e.id = ?
      `, [id]);
      
      return rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'œuf: ${error.message}`);
    }
  }

  // Créer un nouvel enregistrement d'œufs
  async createEgg(eggData) {
    try {
      const { 
        coupleId, 
        egg1Date, 
        egg2Date = null, 
        hatchDate1 = null, 
        hatchDate2 = null, 
        success1 = false, 
        success2 = false, 
        observations = '' 
      } = eggData;
      
      // Vérifier que le couple existe et appartient à l'utilisateur
      const coupleCheck = await executeQuery(
        'SELECT id FROM couples WHERE id = ?',
        [coupleId]
      );
      
      if (coupleCheck.length === 0) {
        throw new Error("Le couple spécifié n'existe pas");
      }
      
      // Vérifier s'il existe déjà un enregistrement pour ce couple et cette date
      const existingEggs = await executeQuery(
        'SELECT id FROM eggs WHERE coupleId = ? AND egg1Date = ? AND (egg2Date = ? OR (egg2Date IS NULL AND ? IS NULL))',
        [coupleId, egg1Date, egg2Date, egg2Date]
      );
      
      if (existingEggs.length > 0) {
        throw new Error("Un enregistrement d'œufs existe déjà pour ce couple et ces dates");
      }
      
      const result = await executeQuery(
        'INSERT INTO eggs (coupleId, egg1Date, egg2Date, hatchDate1, hatchDate2, success1, success2, observations, createdAt, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [coupleId, egg1Date, egg2Date, hatchDate1, hatchDate2, success1, success2, observations]
      );
      
      return { id: result.insertId, ...eggData };
    } catch (error) {
      console.error("❌ Erreur dans createEgg:", error);
      throw new Error("Erreur lors de la création de l'enregistrement d'œufs: " + error.message);
    }
  }

  // Mettre à jour un enregistrement d'œufs
  async updateEgg(id, eggData) {
    try {
      console.log('🔍 Mise à jour œuf - ID:', id, 'Data:', eggData);
      
      // Vérifier que l'œuf existe
      const eggCheck = await executeQuery(
        'SELECT id FROM eggs WHERE id = ?',
        [id]
      );
      
      if (eggCheck.length === 0) {
        throw new Error("Enregistrement d'œufs non trouvé");
      }
      
      // Construire dynamiquement la requête UPDATE
      const fields = [];
      const values = [];
      
      // Vérifier chaque champ et l'ajouter seulement s'il est défini
      const fieldMappings = {
        coupleId: 'coupleId',
        egg1Date: 'egg1Date',
        egg2Date: 'egg2Date',
        hatchDate1: 'hatchDate1',
        hatchDate2: 'hatchDate2',
        success1: 'success1',
        success2: 'success2',
        observations: 'observations'
      };
      
      for (const [key, dbField] of Object.entries(fieldMappings)) {
        if (eggData[key] !== undefined) {
          fields.push(dbField + ' = ?');
          values.push(eggData[key]);
        }
      }
      
      if (fields.length === 0) {
        throw new Error('Aucun champ à mettre à jour');
      }
      
      fields.push('updated_at = NOW()');
      values.push(id);
      
      const sql = 'UPDATE eggs SET ' + fields.join(', ') + ' WHERE id = ?';
      console.log('🔍 SQL:', sql);
      console.log('🔍 Values:', values);
      
      const result = await executeQuery(sql, values);
      
      if (result.affectedRows === 0) {
        throw new Error("Enregistrement d'œufs non trouvé");
      }
      
      // Récupérer l'œuf mis à jour
      const updatedEgg = await this.getEggById(id);
      return updatedEgg;
    } catch (error) {
      console.error('❌ Erreur updateEgg:', error);
      throw new Error("Erreur lors de la mise à jour de l'enregistrement d'œufs: " + error.message);
    }
  }

  // Supprimer un enregistrement d'œufs
  async deleteEgg(id) {
    try {
      const result = await executeQuery('DELETE FROM eggs WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Enregistrement d\'œufs non trouvé');
      }
      
      return { message: 'Enregistrement d\'œufs supprimé avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'enregistrement d'œufs: ${error.message}`);
    }
  }

  // Récupérer les œufs par couple
  async getEggsByCouple(coupleId) {
    try {
      const rows = await executeQuery(`
        SELECT 
          e.id,
          e.coupleId,
          c.nestNumber as coupleName,
          e.egg1Date,
          e.egg2Date,
          e.hatchDate1,
          e.hatchDate2,
          e.success1,
          e.success2,
          e.observations,
          e.createdAt,
          e.updated_at
        FROM eggs e
        LEFT JOIN couples c ON e.coupleId = c.id
        WHERE e.coupleId = ?
        ORDER BY e.createdAt DESC
      `, [coupleId]);
      
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des œufs: ${error.message}`);
    }
  }

  // Compter les œufs par statut
  async getEggStats() {
    try {
      const rows = await executeQuery(`
        SELECT 
          CASE 
            WHEN success1 = 1 AND success2 = 1 THEN 'success'
            WHEN success1 = 0 AND success2 = 0 THEN 'failed'
            ELSE 'partial'
          END as status,
          COUNT(*) as count
        FROM eggs
        GROUP BY 
          CASE 
            WHEN success1 = 1 AND success2 = 1 THEN 'success'
            WHEN success1 = 0 AND success2 = 0 THEN 'failed'
            ELSE 'partial'
          END
      `);
      
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  // Calculer le taux de réussite
  async getSuccessRate() {
    try {
      const rows = await executeQuery(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN success1 = 1 THEN 1 ELSE 0 END) as success1_count,
          SUM(CASE WHEN success2 = 1 THEN 1 ELSE 0 END) as success2_count
        FROM eggs
      `);
      
      const total = rows[0].total;
      const success1Rate = total > 0 ? (rows[0].success1_count / total) * 100 : 0;
      const success2Rate = total > 0 ? (rows[0].success2_count / total) * 100 : 0;
      
      return {
        total,
        success1Rate: Math.round(success1Rate * 100) / 100,
        success2Rate: Math.round(success2Rate * 100) / 100,
        averageRate: Math.round(((success1Rate + success2Rate) / 2) * 100) / 100
      };
    } catch (error) {
      throw new Error(`Erreur lors du calcul du taux de réussite: ${error.message}`);
    }
  }

  // 🆕 NOUVELLE MÉTHODE : Créer un œuf avec éclosion et pigeonneau en une transaction
  async createEggWithHatching(eggData, pigeonneauData = null) {
    try {
      return await executeTransaction(async (connection) => {
        // Étape 1 : Vérifier que le couple existe
        const [coupleCheck] = await connection.execute(
          'SELECT id FROM couples WHERE id = ?',
          [eggData.coupleId]
        );
        
        if (coupleCheck.length === 0) {
          throw new Error("Le couple spécifié n'existe pas");
        }

        // Étape 2 : Créer l'enregistrement d'œuf
        const [eggResult] = await connection.execute(
          'INSERT INTO eggs (coupleId, egg1Date, egg2Date, hatchDate1, hatchDate2, success1, success2, observations, createdAt, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [
            eggData.coupleId,
            eggData.egg1Date,
            eggData.egg2Date || null,
            eggData.hatchDate1 || null,
            eggData.hatchDate2 || null,
            eggData.success1 || false,
            eggData.success2 || false,
            eggData.observations || ''
          ]
        );

        const eggId = eggResult.insertId;

        // Étape 3 : Si éclosion réussie et données pigeonneau fournies, créer le pigeonneau
        let pigeonneauId = null;
        if (pigeonneauData && eggData.success1) {
          const [pigeonneauResult] = await connection.execute(
            'INSERT INTO pigeonneaux (coupleId, eggRecordId, birthDate, sex, weight, weaningDate, status, salePrice, saleDate, buyer, observations, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [
              eggData.coupleId,
              eggId,
              pigeonneauData.birthDate || eggData.hatchDate1,
              pigeonneauData.sex,
              pigeonneauData.weight || null,
              pigeonneauData.weaningDate || null,
              pigeonneauData.status || 'alive',
              pigeonneauData.salePrice || null,
              pigeonneauData.saleDate || null,
              pigeonneauData.buyer || null,
              pigeonneauData.observations || ''
            ]
          );
          pigeonneauId = pigeonneauResult.insertId;
        }

        console.log('✅ Transaction réussie - Œuf ID:', eggId, 'Pigeonneau ID:', pigeonneauId || 'N/A');

        return {
          egg: { id: eggId, ...eggData },
          pigeonneau: pigeonneauId ? { id: pigeonneauId, ...pigeonneauData } : null
        };
      });
    } catch (error) {
      console.error('❌ Erreur transaction createEggWithHatching:', error);
      throw new Error('Erreur lors de la création de l\'œuf avec éclosion: ' + error.message);
    }
  }

  // 🆕 NOUVELLE MÉTHODE : Marquer un œuf comme éclos et créer le pigeonneau en une transaction
  async hatchEggAndCreatePigeonneau(eggId, hatchData, pigeonneauData) {
    try {
      return await executeTransaction(async (connection) => {
        // Étape 1 : Vérifier que l'œuf existe
        const [eggCheck] = await connection.execute(
          'SELECT id, coupleId FROM eggs WHERE id = ?',
          [eggId]
        );
        
        if (eggCheck.length === 0) {
          throw new Error("Enregistrement d'œufs non trouvé");
        }

        const egg = eggCheck[0];

        // Étape 2 : Mettre à jour l'œuf avec la date d'éclosion
        await connection.execute(
          'UPDATE eggs SET hatchDate1 = ?, success1 = ?, observations = ?, updated_at = NOW() WHERE id = ?',
          [hatchData.hatchDate, true, hatchData.observations || '', eggId]
        );

        // Étape 3 : Créer le pigeonneau
        const [pigeonneauResult] = await connection.execute(
          'INSERT INTO pigeonneaux (coupleId, eggRecordId, birthDate, sex, weight, weaningDate, status, observations, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [
            egg.coupleId,
            eggId,
            hatchData.hatchDate,
            pigeonneauData.sex,
            pigeonneauData.weight || null,
            pigeonneauData.weaningDate || null,
            'alive',
            pigeonneauData.observations || ''
          ]
        );

        const pigeonneauId = pigeonneauResult.insertId;

        console.log('✅ Transaction réussie - Œuf éclos ID:', eggId, 'Pigeonneau créé ID:', pigeonneauId);

        return {
          egg: { id: eggId, ...hatchData },
          pigeonneau: { id: pigeonneauId, ...pigeonneauData }
        };
      });
    } catch (error) {
      console.error('❌ Erreur transaction hatchEggAndCreatePigeonneau:', error);
      throw new Error('Erreur lors de l\'éclosion de l\'œuf: ' + error.message);
    }
  }
}

module.exports = new EggService(); 