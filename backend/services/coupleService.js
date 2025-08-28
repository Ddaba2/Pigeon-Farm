import { executeQuery, executeTransaction } from '../config/database.js';

export class CoupleService {
  // Créer un nouveau couple
  static async createCouple(coupleData) {
    const { 
      name, 
      male, 
      female, 
      status = 'actif', 
      breed, 
      color, 
      date_formation, // ✅ Changé de dateFormation à date_formation
      notes,
      userId 
    } = coupleData;
    
    try {
      const sql = `
        INSERT INTO couples (name, male, female, status, breed, color, date_formation, notes, user_id, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const result = await executeQuery(sql, [
        name, male, female, status, breed, color, date_formation, notes, userId
      ]);
      
      // ✅ Retourner directement le résultat de l'insertion
      return {
        id: result.insertId,
        name,
        male,
        female,
        status,
        breed,
        color,
        date_formation,
        notes,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur lors de la création du couple:', error);
      throw error;
    }
  }

  // Récupérer un couple par ID
  static async getCoupleById(id) {
    try {
      const sql = `
        SELECT c.*, u.username as owner_name 
        FROM couples c 
        LEFT JOIN users u ON c.user_id = u.id 
        WHERE c.id = ?
      `;
      const couples = await executeQuery(sql, [id]);
      return couples[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du couple:', error);
      throw error;
    }
  }

  // Récupérer tous les couples d'un utilisateur
  static async getCouplesByUserId(userId, page = 1, limit = 10, filters = {}) {
    try {
      let sql = `
        SELECT c.*, u.username as owner_name 
        FROM couples c 
        LEFT JOIN users u ON c.user_id = u.id 
        WHERE c.user_id = ?
      `;
      
      const params = [userId];
      
      // Ajouter les filtres
      if (filters.status) {
        sql += ' AND c.status = ?';
        params.push(filters.status);
      }
      
      if (filters.breed) {
        sql += ' AND c.breed LIKE ?';
        params.push(`%${filters.breed}%`);
      }
      
      sql += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, (page - 1) * limit);
      
      const couples = await executeQuery(sql, params);
      
      // Compter le total
      let countSql = 'SELECT COUNT(*) as total FROM couples WHERE user_id = ?';
      const countParams = [userId];
      
      if (filters.status) {
        countSql += ' AND status = ?';
        countParams.push(filters.status);
      }
      
      if (filters.breed) {
        countSql += ' AND breed LIKE ?';
        countParams.push(`%${filters.breed}%`);
      }
      
      const [{ total }] = await executeQuery(countSql, countParams);
      
      return {
        couples,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalCouples: total,
          hasNextPage: (page - 1) * limit + limit < total,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des couples:', error);
      throw error;
    }
  }

  // Mettre à jour un couple
  static async updateCouple(id, updateData) {
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
      
      fields.push('updated_at = NOW()');
      values.push(id);
      
      const sql = `UPDATE couples SET ${fields.join(', ')} WHERE id = ?`;
      await executeQuery(sql, values);
      
      // Récupérer le couple mis à jour
      const updatedCouple = await this.getCoupleById(id);
      return updatedCouple;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du couple:', error);
      throw error;
    }
  }

  // Supprimer un couple
  static async deleteCouple(id, userId) {
    try {
      // Vérifier que l'utilisateur est propriétaire
      const couple = await this.getCoupleById(id);
      if (!couple || couple.user_id !== userId) {
        throw new Error('Couple non trouvé ou accès non autorisé');
      }
      
      const sql = 'DELETE FROM couples WHERE id = ?';
      await executeQuery(sql, [id]);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du couple:', error);
      throw error;
    }
  }

  // Récupérer les statistiques des couples
  static async getCoupleStats(userId) {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_couples,
          COUNT(CASE WHEN status = 'actif' THEN 1 END) as active_couples,
          COUNT(CASE WHEN status = 'reproduction' THEN 1 END) as breeding_couples,
          COUNT(CASE WHEN status = 'inactif' THEN 1 END) as inactive_couples,
          COUNT(DISTINCT breed) as unique_breeds
        FROM couples 
        WHERE user_id = ?
      `;
      
      const [stats] = await executeQuery(sql, [userId]);
      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
}

export default CoupleService; 