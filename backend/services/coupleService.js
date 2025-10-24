const { executeQuery } = require('../config/database');

class CoupleService {
  // Récupérer tous les couples
  async getAllCouples() {
    try {
      const rows = await executeQuery(`
        SELECT 
          c.id,
          c.nestNumber as name,
          c.race as breed,
          c.maleId,
          c.femaleId,
          c.formationDate,
          c.observations,
          c.status,
          c.created_at,
          c.updated_at
        FROM couples c
        ORDER BY c.created_at DESC
      `);
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des couples: ${error.message}`);
    }
  }

  // Récupérer un couple par ID
  async getCoupleById(id) {
    try {
      const rows = await executeQuery(`
        SELECT 
          c.id,
          c.nestNumber as name,
          c.race as breed,
          c.maleId,
          c.femaleId,
          c.formationDate,
          c.observations,
          c.status,
          c.created_at,
          c.updated_at
        FROM couples c
        WHERE c.id = ?
      `, [id]);
      
      return rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du couple: ${error.message}`);
    }
  }

  // Créer un nouveau couple
  async createCouple(coupleData) {
    try {
      const { 
        nestNumber, 
        race, 
        male, 
        female,
        maleId,
        femaleId,
        formationDate, 
        observations = '', 
        status = 'active', 
        userId 
      } = coupleData;
      
      // Accepter soit male/female soit maleId/femaleId
      const finalMaleId = maleId || male;
      const finalFemaleId = femaleId || female;
      
      const result = await executeQuery(`
        INSERT INTO couples (nestNumber, race, maleId, femaleId, formationDate, observations, status, user_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [nestNumber, race, finalMaleId, finalFemaleId, formationDate, observations, status, userId]);
      
      return { id: result.insertId, ...coupleData };
    } catch (error) {
      throw new Error(`Erreur lors de la création du couple: ${error.message}`);
    }
  }

  // Mettre à jour un couple
  async updateCouple(id, coupleData) {
    try {
      console.log('🔍 Mise à jour couple - ID:', id, 'Data:', coupleData);
      
      // Construire dynamiquement la requête UPDATE
      const fields = [];
      const values = [];
      
      if (coupleData.nestNumber !== undefined) {
        fields.push('nestNumber = ?');
        values.push(coupleData.nestNumber);
      }
      
      if (coupleData.race !== undefined) {
        fields.push('race = ?');
        values.push(coupleData.race);
      }
      
      if (coupleData.male !== undefined) {
        fields.push('maleId = ?');
        values.push(coupleData.male);
      }
      
      if (coupleData.female !== undefined) {
        fields.push('femaleId = ?');
        values.push(coupleData.female);
      }
      
      if (coupleData.formationDate !== undefined) {
        fields.push('formationDate = ?');
        values.push(coupleData.formationDate);
      }
      
      if (coupleData.observations !== undefined) {
        fields.push('observations = ?');
        values.push(coupleData.observations);
      }
      
      if (coupleData.status !== undefined) {
        fields.push('status = ?');
        values.push(coupleData.status);
      }
      
      if (fields.length === 0) {
        throw new Error('Aucun champ à mettre à jour');
      }
      
      fields.push('updated_at = NOW()');
      values.push(id);
      
      const sql = `UPDATE couples SET ${fields.join(', ')} WHERE id = ?`;
      console.log('🔍 SQL:', sql);
      console.log('🔍 Values:', values);
      
      const result = await executeQuery(sql, values);
      
      if (result.affectedRows === 0) {
        throw new Error('Couple non trouvé');
      }
      
      // Récupérer le couple mis à jour
      const updatedCouple = await this.getCoupleById(id);
      return updatedCouple;
    } catch (error) {
      console.error('❌ Erreur updateCouple:', error);
      throw new Error(`Erreur lors de la mise à jour du couple: ${error.message}`);
    }
  }

  // Supprimer un couple
  async deleteCouple(id) {
    try {
      const result = await executeQuery('DELETE FROM couples WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Couple non trouvé');
      }
      
      return { message: 'Couple supprimé avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du couple: ${error.message}`);
    }
  }

  // Récupérer les couples par utilisateur
  async getCouplesByUser(userId) {
    try {
      const rows = await executeQuery(`
        SELECT 
          c.id,
          c.nestNumber as name,
          c.race as breed,
          c.maleId,
          c.femaleId,
          c.formationDate,
          c.observations,
          c.status,
          c.created_at,
          c.updated_at
        FROM couples c
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
      `, [userId]);
      
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des couples: ${error.message}`);
    }
  }

  // Compter les couples par statut
  async getCoupleStats() {
    try {
      const rows = await executeQuery(`
        SELECT 
          status,
          COUNT(*) as count
        FROM couples 
        GROUP BY status
      `);
      
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }
}

module.exports = new CoupleService(); 