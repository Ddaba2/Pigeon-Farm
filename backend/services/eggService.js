import { executeQuery, executeTransaction } from '../config/database.js';

export class EggService {
  // Créer un nouvel enregistrement d'œufs
  static async createEgg(eggData) {
    const { 
      coupleId, 
      egg1Date, 
      egg2Date, 
      hatchDate1, 
      hatchDate2, 
      success1, 
      success2, 
      observations,
      userId 
    } = eggData;
    
    try {
      const sql = `
        INSERT INTO eggs (couple_id, egg1_date, egg2_date, hatch_date1, hatch_date2, success1, success2, observations, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const result = await executeQuery(sql, [
        coupleId, egg1Date, egg2Date, hatchDate1, hatchDate2, success1, success2, observations
      ]);
      
      // Récupérer l'enregistrement créé
      const newEgg = await this.getEggById(result.insertId);
      return newEgg;
    } catch (error) {
      console.error('Erreur lors de la création de l\'enregistrement d\'œufs:', error);
      throw error;
    }
  }

  // Récupérer un enregistrement d'œufs par ID
  static async getEggById(id) {
    try {
      const sql = `
        SELECT e.*, c.name as couple_name, c.male, c.female
        FROM eggs e 
        LEFT JOIN couples c ON e.couple_id = c.id 
        WHERE e.id = ?
      `;
      const eggs = await executeQuery(sql, [id]);
      return eggs[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'enregistrement d\'œufs:', error);
      throw error;
    }
  }

  // Récupérer tous les enregistrements d'œufs d'un utilisateur
  static async getEggsByUserId(userId, page = 1, limit = 10, filters = {}) {
    try {
      let sql = `
        SELECT e.*, c.name as couple_name, c.male, c.female
        FROM eggs e 
        LEFT JOIN couples c ON e.couple_id = c.id 
        WHERE c.user_id = ?
      `;
      
      const params = [userId];
      
      // Ajouter les filtres
      if (filters.coupleId) {
        sql += ' AND e.couple_id = ?';
        params.push(filters.coupleId);
      }
      
      if (filters.success !== undefined) {
        sql += ' AND (e.success1 = ? OR e.success2 = ?)';
        params.push(filters.success, filters.success);
      }
      
      sql += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, (page - 1) * limit);
      
      const eggs = await executeQuery(sql, params);
      
      // Compter le total
      let countSql = `
        SELECT COUNT(*) as total 
        FROM eggs e 
        LEFT JOIN couples c ON e.couple_id = c.id 
        WHERE c.user_id = ?
      `;
      const countParams = [userId];
      
      if (filters.coupleId) {
        countSql += ' AND e.couple_id = ?';
        countParams.push(filters.coupleId);
      }
      
      if (filters.success !== undefined) {
        countSql += ' AND (e.success1 = ? OR e.success2 = ?)';
        countParams.push(filters.success, filters.success);
      }
      
      const [{ total }] = await executeQuery(countSql, countParams);
      
      return {
        eggs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalEggs: total,
          hasNextPage: (page - 1) * limit + limit < total,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des enregistrements d\'œufs:', error);
      throw error;
    }
  }

  // Mettre à jour un enregistrement d'œufs
  static async updateEgg(id, updateData) {
    try {
      const fields = [];
      const values = [];
      
      // Construire dynamiquement la requête UPDATE
      Object.keys(updateData).forEach(key => {
        if (key !== 'id' && key !== 'couple_id') {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });
      
      if (fields.length === 0) {
        throw new Error('Aucun champ à mettre à jour');
      }
      
      fields.push('updated_at = NOW()');
      values.push(id);
      
      const sql = `UPDATE eggs SET ${fields.join(', ')} WHERE id = ?`;
      await executeQuery(sql, values);
      
      // Récupérer l'enregistrement mis à jour
      const updatedEgg = await this.getEggById(id);
      return updatedEgg;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'enregistrement d\'œufs:', error);
      throw error;
    }
  }

  // Supprimer un enregistrement d'œufs
  static async deleteEgg(id, userId) {
    try {
      // Vérifier que l'utilisateur est propriétaire
      const egg = await this.getEggById(id);
      if (!egg) {
        throw new Error('Enregistrement d\'œufs non trouvé');
      }
      
      // Vérifier la propriété via le couple
      const coupleSql = 'SELECT user_id FROM couples WHERE id = ?';
      const [{ user_id }] = await executeQuery(coupleSql, [egg.couple_id]);
      
      if (user_id !== userId) {
        throw new Error('Accès non autorisé');
      }
      
      const sql = 'DELETE FROM eggs WHERE id = ?';
      await executeQuery(sql, [id]);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'enregistrement d\'œufs:', error);
      throw error;
    }
  }

  // Récupérer les statistiques des œufs
  static async getEggStats(userId) {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_eggs,
          COUNT(CASE WHEN success1 = 1 OR success2 = 1 THEN 1 END) as successful_hatches,
          COUNT(CASE WHEN success1 = 0 OR success2 = 0 THEN 1 END) as failed_hatches,
          COUNT(CASE WHEN success1 IS NULL AND success2 IS NULL THEN 1 END) as pending_hatches
        FROM eggs e 
        LEFT JOIN couples c ON e.couple_id = c.id 
        WHERE c.user_id = ?
      `;
      
      const [stats] = await executeQuery(sql, [userId]);
      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des œufs:', error);
      throw error;
    }
  }
}

export default EggService; 