const { executeQuery } = require('../config/database');

class SalesService {
  // Récupérer toutes les ventes d'un utilisateur spécifique
  async getAllSales(userId) {
    try {
      const rows = await executeQuery(`
        SELECT 
          s.id,
          s.date,
          s.quantity,
          s.unit_price as unitPrice,
          s.amount as totalAmount,
          s.description,
          s.client as buyerName,
          s.payment_method as paymentMethod,
          s.created_at as createdAt,
          s.updated_at as updatedAt
        FROM sales s
        WHERE s.user_id = ?
        ORDER BY s.created_at DESC
      `, [userId]);
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des ventes: ${error.message}`);
    }
  }

  // Récupérer une vente par ID appartenant à un utilisateur spécifique
  async getSaleById(id, userId) {
    try {
      const rows = await executeQuery(`
        SELECT 
          s.id,
          s.date,
          s.quantity,
          s.unit_price as unitPrice,
          s.amount as totalAmount,
          s.description,
          s.client as buyerName,
          s.payment_method as paymentMethod,
          s.created_at as createdAt,
          s.updated_at as updatedAt
        FROM sales s
        WHERE s.id = ? AND s.user_id = ?
      `, [id, userId]);
      
      return rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de la vente: ${error.message}`);
    }
  }

  // Créer une nouvelle vente associée à un utilisateur
  async createSale(saleData, userId) {
    try {
      const { 
        date,
        quantity,
        unitPrice,
        totalAmount,
        description,
        buyerName,
        paymentMethod = 'espece'
      } = saleData;
      
      // Calculer le montant total si non fourni
      const calculatedTotal = totalAmount || (quantity * unitPrice);
      
      console.log('🔍 Création vente - Data:', saleData, 'UserId:', userId, 'Total:', calculatedTotal);
      
      const result = await executeQuery(`
        INSERT INTO sales (user_id, date, quantity, unit_price, amount, description, client, payment_method, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [userId, date, quantity, unitPrice, calculatedTotal, description || null, buyerName || null, paymentMethod]);
      
      return { 
        id: result.insertId, 
        userId,
        date,
        quantity,
        unitPrice,
        totalAmount: calculatedTotal,
        description,
        buyerName,
        paymentMethod
      };
    } catch (error) {
      console.error('❌ Erreur createSale:', error);
      throw new Error(`Erreur lors de la création de la vente: ${error.message}`);
    }
  }

  // Mettre à jour une vente appartenant à un utilisateur
  async updateSale(id, saleData, userId) {
    try {
      console.log('🔍 Mise à jour vente - ID:', id, 'Data:', saleData, 'UserId:', userId);
      
      // Vérifier d'abord que la vente appartient à l'utilisateur
      const existingSale = await this.getSaleById(id, userId);
      if (!existingSale) {
        throw new Error('Vente non trouvée ou non autorisée');
      }
      
      // Construire dynamiquement la requête UPDATE
      const fields = [];
      const values = [];
      
      // Pas besoin d'ajouter user_id aux valeurs ici, il sera ajouté à la fin
      
      if (saleData.date !== undefined) {
        fields.push('date = ?');
        values.push(saleData.date);
      }
      
      if (saleData.quantity !== undefined) {
        fields.push('quantity = ?');
        values.push(saleData.quantity);
      }
      
      if (saleData.unitPrice !== undefined) {
        fields.push('unit_price = ?');
        values.push(saleData.unitPrice);
      }
      
      if (saleData.totalAmount !== undefined) {
        fields.push('amount = ?');
        values.push(saleData.totalAmount);
      }
      
      if (saleData.description !== undefined) {
        fields.push('description = ?');
        values.push(saleData.description);
      }
      
      if (saleData.buyerName !== undefined) {
        fields.push('client = ?');
        values.push(saleData.buyerName);
      }
      
      if (saleData.paymentMethod !== undefined) {
        fields.push('payment_method = ?');
        values.push(saleData.paymentMethod);
      }
      
      if (fields.length === 0) {
        throw new Error('Aucun champ à mettre à jour');
      }
      
      fields.push('updated_at = NOW()');
      values.push(id);
      values.push(userId); // Ajouter user_id à la fin pour la clause WHERE
      
      const sql = `UPDATE sales SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
      console.log('🔍 SQL:', sql);
      console.log('🔍 Values:', values);
      
      const result = await executeQuery(sql, values);
      
      if (result.affectedRows === 0) {
        throw new Error('Vente non trouvée ou non autorisée');
      }
      
      // Récupérer la vente mise à jour
      const updatedSale = await this.getSaleById(id, userId);
      return updatedSale;
    } catch (error) {
      console.error('❌ Erreur updateSale:', error);
      throw new Error(`Erreur lors de la mise à jour de la vente: ${error.message}`);
    }
  }

  // Supprimer une vente appartenant à un utilisateur
  async deleteSale(id, userId) {
    try {
      // Vérifier d'abord que la vente appartient à l'utilisateur
      const existingSale = await this.getSaleById(id, userId);
      if (!existingSale) {
        throw new Error('Vente non trouvée ou non autorisée');
      }
      
      const result = await executeQuery('DELETE FROM sales WHERE id = ? AND user_id = ?', [id, userId]);
      
      if (result.affectedRows === 0) {
        throw new Error('Vente non trouvée ou non autorisée');
      }
      
      return { message: 'Vente supprimée avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de la vente: ${error.message}`);
    }
  }
}

module.exports = new SalesService();