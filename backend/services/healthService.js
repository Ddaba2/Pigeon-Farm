import { executeQuery, executeTransaction } from '../config/database.js';

export class HealthService {
  // Créer un nouvel enregistrement de santé
  static async createHealthRecord(healthData) {
    const { 
      type, 
      targetType, 
      targetId, 
      product, 
      date, 
      nextDue, 
      observations,
      userId 
    } = healthData;
    
    try {
      const sql = `
        INSERT INTO health_records (type, target_type, target_id, product, date, next_due, observations, user_id, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      const result = await executeQuery(sql, [
        type, targetType, targetId, product, date, nextDue, observations, userId
      ]);
      
      // Récupérer l'enregistrement créé
      const newRecord = await this.getHealthRecordById(result.insertId);
      return newRecord;
    } catch (error) {
      console.error('Erreur lors de la création de l\'enregistrement de santé:', error);
      throw error;
    }
  }

  // Récupérer un enregistrement de santé par ID
  static async getHealthRecordById(id) {
    try {
      const sql = `
        SELECT h.*, 
               CASE 
                 WHEN h.target_type = 'couple' THEN c.name
                 WHEN h.target_type = 'pigeonneau' THEN CONCAT('Pigeonneau #', p.id)
                 ELSE 'N/A'
               END as target_name
        FROM health_records h 
        LEFT JOIN couples c ON h.target_type = 'couple' AND h.target_id = c.id
        LEFT JOIN pigeonneaux p ON h.target_type = 'pigeonneau' AND h.target_id = p.id
        WHERE h.id = ?
      `;
      const records = await executeQuery(sql, [id]);
      return records[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'enregistrement de santé:', error);
      throw error;
    }
  }

  // Récupérer tous les enregistrements de santé d'un utilisateur
  static async getHealthRecordsByUserId(userId, page = 1, limit = 10, filters = {}) {
    try {
      let sql = `
        SELECT h.*, 
               CASE 
                 WHEN h.target_type = 'couple' THEN c.name
                 WHEN h.target_type = 'pigeonneau' THEN CONCAT('Pigeonneau #', p.id)
                 ELSE 'N/A'
               END as target_name
        FROM health_records h 
        LEFT JOIN couples c ON h.target_type = 'couple' AND h.target_id = c.id
        LEFT JOIN pigeonneaux p ON h.target_type = 'pigeonneau' AND h.target_id = p.id
        WHERE h.user_id = ?
      `;
      
      const params = [userId];
      
      // Ajouter les filtres
      if (filters.type) {
        sql += ' AND h.type = ?';
        params.push(filters.type);
      }
      
      if (filters.targetType) {
        sql += ' AND h.target_type = ?';
        params.push(filters.targetType);
      }
      
      if (filters.product) {
        sql += ' AND h.product LIKE ?';
        params.push(`%${filters.product}%`);
      }
      
      sql += ' ORDER BY h.date DESC LIMIT ? OFFSET ?';
      params.push(limit, (page - 1) * limit);
      
      const records = await executeQuery(sql, params);
      
      // Compter le total
      let countSql = `
        SELECT COUNT(*) as total 
        FROM health_records 
        WHERE user_id = ?
      `;
      const countParams = [userId];
      
      if (filters.type) {
        countSql += ' AND type = ?';
        countParams.push(filters.type);
      }
      
      if (filters.targetType) {
        countSql += ' AND target_type = ?';
        countParams.push(filters.targetType);
      }
      
      if (filters.product) {
        countSql += ' AND product LIKE ?';
        countParams.push(`%${filters.product}%`);
      }
      
      const [{ total }] = await executeQuery(countSql, countParams);
      
      return {
        records,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasNextPage: (page - 1) * limit + limit < total,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des enregistrements de santé:', error);
      throw error;
    }
  }

  // Mettre à jour un enregistrement de santé
  static async updateHealthRecord(id, updateData) {
    try {
      const fields = [];
      const values = [];
      
      // Construire dynamiquement la requête UPDATE
      Object.keys(updateData).forEach(key => {
        if (key !== 'id' && key !== 'user_id') {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });
      
      if (fields.length === 0) {
        throw new Error('Aucun champ à mettre à jour');
      }
      
      values.push(id);
      
      const sql = `UPDATE health_records SET ${fields.join(', ')} WHERE id = ?`;
      await executeQuery(sql, values);
      
      // Récupérer l'enregistrement mis à jour
      const updatedRecord = await this.getHealthRecordById(id);
      return updatedRecord;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'enregistrement de santé:', error);
      throw error;
    }
  }

  // Supprimer un enregistrement de santé
  static async deleteHealthRecord(id, userId) {
    try {
      // Vérifier que l'utilisateur est propriétaire
      const record = await this.getHealthRecordById(id);
      if (!record || record.user_id !== userId) {
        throw new Error('Enregistrement non trouvé ou accès non autorisé');
      }
      
      const sql = 'DELETE FROM health_records WHERE id = ?';
      await executeQuery(sql, [id]);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'enregistrement de santé:', error);
      throw error;
    }
  }

  // Récupérer les traitements à venir
  static async getUpcomingTreatments(userId) {
    try {
      const sql = `
        SELECT h.*, 
               CASE 
                 WHEN h.target_type = 'couple' THEN c.name
                 WHEN h.target_type = 'pigeonneau' THEN CONCAT('Pigeonneau #', p.id)
                 ELSE 'N/A'
               END as target_name
        FROM health_records h 
        LEFT JOIN couples c ON h.target_type = 'couple' AND h.target_id = c.id
        LEFT JOIN pigeonneaux p ON h.target_type = 'pigeonneau' AND h.target_id = p.id
        WHERE h.user_id = ? AND h.next_due >= CURDATE()
        ORDER BY h.next_due ASC
      `;
      
      const records = await executeQuery(sql, [userId]);
      return records;
    } catch (error) {
      console.error('Erreur lors de la récupération des traitements à venir:', error);
      throw error;
    }
  }

  // Récupérer les statistiques de santé
  static async getHealthStats(userId) {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_records,
          COUNT(DISTINCT type) as unique_treatments,
          COUNT(DISTINCT target_type) as target_types,
          COUNT(CASE WHEN next_due >= CURDATE() THEN 1 END) as upcoming_treatments,
          COUNT(CASE WHEN next_due < CURDATE() THEN 1 END) as overdue_treatments
        FROM health_records 
        WHERE user_id = ?
      `;
      
      const [stats] = await executeQuery(sql, [userId]);
      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de santé:', error);
      throw error;
    }
  }
}

export default HealthService; 