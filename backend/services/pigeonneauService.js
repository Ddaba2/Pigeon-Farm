import { executeQuery, executeTransaction } from '../config/database.js';

export class PigeonneauService {
  // Créer un nouveau pigeonneau
  static async createPigeonneau(pigeonneauData) {
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
      observations,
      userId 
    } = pigeonneauData;
    
    try {
      const sql = `
        INSERT INTO pigeonneaux (couple_id, egg_record_id, birth_date, sex, weight, weaning_date, status, sale_price, sale_date, buyer, observations, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const result = await executeQuery(sql, [
        coupleId, eggRecordId, birthDate, sex, weight, weaningDate, status, salePrice, saleDate, buyer, observations
      ]);
      
      // Récupérer le pigeonneau créé
      const newPigeonneau = await this.getPigeonneauById(result.insertId);
      return newPigeonneau;
    } catch (error) {
      console.error('Erreur lors de la création du pigeonneau:', error);
      throw error;
    }
  }

  // Récupérer un pigeonneau par ID
  static async getPigeonneauById(id) {
    try {
      const sql = `
        SELECT p.*, c.name as couple_name, c.male, c.female, e.egg1_date, e.egg2_date
        FROM pigeonneaux p 
        LEFT JOIN couples c ON p.couple_id = c.id 
        LEFT JOIN eggs e ON p.egg_record_id = e.id
        WHERE p.id = ?
      `;
      const pigeonneaux = await executeQuery(sql, [id]);
      return pigeonneaux[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du pigeonneau:', error);
      throw error;
    }
  }

  // Récupérer tous les pigeonneaux d'un utilisateur
  static async getPigeonneauxByUserId(userId, page = 1, limit = 10, filters = {}) {
    try {
      let sql = `
        SELECT p.*, c.name as couple_name, c.male, c.female, e.egg1_date, e.egg2_date
        FROM pigeonneaux p 
        LEFT JOIN couples c ON p.couple_id = c.id 
        LEFT JOIN eggs e ON p.egg_record_id = e.id
        WHERE c.user_id = ?
      `;
      
      const params = [userId];
      
      // Ajouter les filtres
      if (filters.coupleId) {
        sql += ' AND p.couple_id = ?';
        params.push(filters.coupleId);
      }
      
      if (filters.status) {
        sql += ' AND p.status = ?';
        params.push(filters.status);
      }
      
      if (filters.sex) {
        sql += ' AND p.sex = ?';
        params.push(filters.sex);
      }
      
      sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, (page - 1) * limit);
      
      const pigeonneaux = await executeQuery(sql, params);
      
      // Compter le total
      let countSql = `
        SELECT COUNT(*) as total 
        FROM pigeonneaux p 
        LEFT JOIN couples c ON p.couple_id = c.id 
        WHERE c.user_id = ?
      `;
      const countParams = [userId];
      
      if (filters.coupleId) {
        countSql += ' AND p.couple_id = ?';
        countParams.push(filters.coupleId);
      }
      
      if (filters.status) {
        countSql += ' AND p.status = ?';
        countParams.push(filters.status);
      }
      
      if (filters.sex) {
        countSql += ' AND p.sex = ?';
        countParams.push(filters.sex);
      }
      
      const [{ total }] = await executeQuery(countSql, countParams);
      
      return {
        pigeonneaux,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPigeonneaux: total,
          hasNextPage: (page - 1) * limit + limit < total,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des pigeonneaux:', error);
      throw error;
    }
  }

  // Mettre à jour un pigeonneau
  static async updatePigeonneau(id, updateData) {
    try {
      const fields = [];
      const values = [];
      
      // Construire dynamiquement la requête UPDATE
      Object.keys(updateData).forEach(key => {
        if (key !== 'id' && key !== 'couple_id' && key !== 'egg_record_id') {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });
      
      if (fields.length === 0) {
        throw new Error('Aucun champ à mettre à jour');
      }
      
      fields.push('updated_at = NOW()');
      values.push(id);
      
      const sql = `UPDATE pigeonneaux SET ${fields.join(', ')} WHERE id = ?`;
      await executeQuery(sql, values);
      
      // Récupérer le pigeonneau mis à jour
      const updatedPigeonneau = await this.getPigeonneauById(id);
      return updatedPigeonneau;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du pigeonneau:', error);
      throw error;
    }
  }

  // Supprimer un pigeonneau
  static async deletePigeonneau(id, userId) {
    try {
      // Vérifier que l'utilisateur est propriétaire
      const pigeonneau = await this.getPigeonneauById(id);
      if (!pigeonneau) {
        throw new Error('Pigeonneau non trouvé');
      }
      
      // Vérifier la propriété via le couple
      const coupleSql = 'SELECT user_id FROM couples WHERE id = ?';
      const [{ user_id }] = await executeQuery(coupleSql, [pigeonneau.couple_id]);
      
      if (user_id !== userId) {
        throw new Error('Accès non autorisé');
      }
      
      const sql = 'DELETE FROM pigeonneaux WHERE id = ?';
      await executeQuery(sql, [id]);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du pigeonneau:', error);
      throw error;
    }
  }

  // Récupérer les statistiques des pigeonneaux
  static async getPigeonneauStats(userId) {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_pigeonneaux,
          COUNT(CASE WHEN status = 'alive' THEN 1 END) as alive_pigeonneaux,
          COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_pigeonneaux,
          COUNT(CASE WHEN status = 'dead' THEN 1 END) as dead_pigeonneaux,
          COUNT(CASE WHEN sex = 'male' THEN 1 END) as male_pigeonneaux,
          COUNT(CASE WHEN sex = 'female' THEN 1 END) as female_pigeonneaux,
          COUNT(CASE WHEN sex = 'unknown' THEN 1 END) as unknown_sex_pigeonneaux,
          AVG(weight) as average_weight
        FROM pigeonneaux p 
        LEFT JOIN couples c ON p.couple_id = c.id 
        WHERE c.user_id = ?
      `;
      
      const [stats] = await executeQuery(sql, [userId]);
      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des pigeonneaux:', error);
      throw error;
    }
  }
}

export default PigeonneauService; 