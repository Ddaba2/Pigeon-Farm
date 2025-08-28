import { executeQuery, executeTransaction } from '../config/database.js';

export class SaleService {
  // Créer une nouvelle vente
  static async createSale(saleData) {
    const { 
      date, 
      quantity, 
      unitPrice, 
      amount, 
      description, 
      client,
      userId 
    } = saleData;
    
    try {
      const sql = `
        INSERT INTO sales (date, quantity, unit_price, amount, description, client, user_id, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      const result = await executeQuery(sql, [
        date, quantity, unitPrice, amount, description, client, userId
      ]);
      
      // Récupérer la vente créée
      const newSale = await this.getSaleById(result.insertId);
      return newSale;
    } catch (error) {
      console.error('Erreur lors de la création de la vente:', error);
      throw error;
    }
  }

  // Récupérer une vente par ID
  static async getSaleById(id) {
    try {
      const sql = 'SELECT * FROM sales WHERE id = ?';
      const sales = await executeQuery(sql, [id]);
      return sales[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la vente:', error);
      throw error;
    }
  }

  // Récupérer toutes les ventes d'un utilisateur
  static async getSalesByUserId(userId, page = 1, limit = 10, filters = {}) {
    try {
      let sql = 'SELECT * FROM sales WHERE user_id = ?';
      const params = [userId];
      
      // Ajouter les filtres
      if (filters.dateFrom) {
        sql += ' AND date >= ?';
        params.push(filters.dateFrom);
      }
      
      if (filters.dateTo) {
        sql += ' AND date <= ?';
        params.push(filters.dateTo);
      }
      
      if (filters.client) {
        sql += ' AND client LIKE ?';
        params.push(`%${filters.client}%`);
      }
      
      if (filters.minAmount) {
        sql += ' AND amount >= ?';
        params.push(filters.minAmount);
      }
      
      if (filters.maxAmount) {
        sql += ' AND amount <= ?';
        params.push(filters.maxAmount);
      }
      
      sql += ' ORDER BY date DESC LIMIT ? OFFSET ?';
      params.push(limit, (page - 1) * limit);
      
      const sales = await executeQuery(sql, params);
      
      // Compter le total
      let countSql = 'SELECT COUNT(*) as total FROM sales WHERE user_id = ?';
      const countParams = [userId];
      
      if (filters.dateFrom) {
        countSql += ' AND date >= ?';
        countParams.push(filters.dateFrom);
      }
      
      if (filters.dateTo) {
        countSql += ' AND date <= ?';
        countParams.push(filters.dateTo);
      }
      
      if (filters.client) {
        countSql += ' AND client LIKE ?';
        countParams.push(`%${filters.client}%`);
      }
      
      if (filters.minAmount) {
        countSql += ' AND amount >= ?';
        countParams.push(filters.minAmount);
      }
      
      if (filters.maxAmount) {
        countSql += ' AND amount <= ?';
        countParams.push(filters.maxAmount);
      }
      
      const [{ total }] = await executeQuery(countSql, countParams);
      
      return {
        sales,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalSales: total,
          hasNextPage: (page - 1) * limit + limit < total,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des ventes:', error);
      throw error;
    }
  }

  // Mettre à jour une vente
  static async updateSale(id, updateData) {
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
      
      const sql = `UPDATE sales SET ${fields.join(', ')} WHERE id = ?`;
      await executeQuery(sql, values);
      
      // Récupérer la vente mise à jour
      const updatedSale = await this.getSaleById(id);
      return updatedSale;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la vente:', error);
      throw error;
    }
  }

  // Supprimer une vente
  static async deleteSale(id, userId) {
    try {
      // Vérifier que l'utilisateur est propriétaire
      const sale = await this.getSaleById(id);
      if (!sale || sale.user_id !== userId) {
        throw new Error('Vente non trouvée ou accès non autorisé');
      }
      
      const sql = 'DELETE FROM sales WHERE id = ?';
      await executeQuery(sql, [id]);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la vente:', error);
      throw error;
    }
  }

  // Récupérer les statistiques des ventes
  static async getSaleStats(userId, period = 'all') {
    try {
      let dateFilter = '';
      const params = [userId];
      
      if (period === 'month') {
        dateFilter = 'AND date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
      } else if (period === 'year') {
        dateFilter = 'AND date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
      }
      
      const sql = `
        SELECT 
          COUNT(*) as total_sales,
          SUM(quantity) as total_quantity,
          SUM(amount) as total_amount,
          AVG(amount) as average_amount,
          MIN(amount) as min_amount,
          MAX(amount) as max_amount,
          COUNT(DISTINCT client) as unique_clients
        FROM sales 
        WHERE user_id = ? ${dateFilter}
      `;
      
      const [stats] = await executeQuery(sql, params);
      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des ventes:', error);
      throw error;
    }
  }

  // Récupérer les meilleurs clients
  static async getTopClients(userId, limit = 10) {
    try {
      const sql = `
        SELECT 
          client,
          COUNT(*) as total_sales,
          SUM(amount) as total_amount,
          AVG(amount) as average_amount
        FROM sales 
        WHERE user_id = ? AND client IS NOT NULL
        GROUP BY client 
        ORDER BY total_amount DESC 
        LIMIT ?
      `;
      
      const clients = await executeQuery(sql, [userId, limit]);
      return clients;
    } catch (error) {
      console.error('Erreur lors de la récupération des meilleurs clients:', error);
      throw error;
    }
  }

  // Récupérer l'évolution des ventes par mois
  static async getSalesByMonth(userId, year) {
    try {
      const sql = `
        SELECT 
          MONTH(date) as month,
          COUNT(*) as total_sales,
          SUM(amount) as total_amount
        FROM sales 
        WHERE user_id = ? AND YEAR(date) = ?
        GROUP BY MONTH(date)
        ORDER BY month
      `;
      
      const monthlySales = await executeQuery(sql, [userId, year]);
      return monthlySales;
    } catch (error) {
      console.error('Erreur lors de la récupération des ventes par mois:', error);
      throw error;
    }
  }
}

export default SaleService; 