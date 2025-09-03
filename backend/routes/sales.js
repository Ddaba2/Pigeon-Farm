const express = require('express');
const router = express.Router();
const { pool } = require('../config/database.js');
const { authenticateUser } = require('../middleware/auth.js');

// GET /api/sales - Récupérer toutes les ventes
router.get('/', authenticateUser, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id,
        target_type as targetType,
        target_id as targetId,
        target_name as targetName,
        buyer_name as buyerName,
        quantity,
        unit_price as unitPrice,
        total_amount as totalAmount,
        payment_method as paymentMethod,
        date,
        observations,
        created_at as createdAt,
        updated_at as updatedAt
      FROM sales 
      WHERE user_id = ? 
      ORDER BY date DESC, created_at DESC
    `, [req.user.id]);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des ventes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des ventes'
    });
  }
});

// GET /api/sales/:id - Récupérer une vente spécifique
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id,
        target_type as targetType,
        target_id as targetId,
        target_name as targetName,
        buyer_name as buyerName,
        quantity,
        unit_price as unitPrice,
        total_amount as totalAmount,
        payment_method as paymentMethod,
        date,
        observations,
        created_at as createdAt,
        updated_at as updatedAt
      FROM sales 
      WHERE id = ? AND user_id = ?
    `, [req.params.id, req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vente non trouvée'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la vente:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la vente'
    });
  }
});

// POST /api/sales - Créer une nouvelle vente
router.post('/', authenticateUser, async (req, res) => {
  try {
    const {
      targetType,
      targetId,
      targetName,
      buyerName,
      quantity,
      unitPrice,
      totalAmount,
      paymentMethod,
      date,
      observations
    } = req.body;

    // Validation des données
    if (!targetType || !targetId || !buyerName || !quantity || !unitPrice || !paymentMethod || !date) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis'
      });
    }

    if (quantity <= 0 || unitPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La quantité et le prix unitaire doivent être supérieurs à 0'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO sales (
        user_id,
        target_type,
        target_id,
        target_name,
        buyer_name,
        quantity,
        unit_price,
        total_amount,
        payment_method,
        date,
        observations
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      targetType,
      targetId,
      targetName || null,
      buyerName,
      quantity,
      unitPrice,
      totalAmount || (quantity * unitPrice),
      paymentMethod,
      date,
      observations || null
    ]);

    // Récupérer la vente créée
    const [newSale] = await pool.execute(`
      SELECT 
        id,
        target_type as targetType,
        target_id as targetId,
        target_name as targetName,
        buyer_name as buyerName,
        quantity,
        unit_price as unitPrice,
        total_amount as totalAmount,
        payment_method as paymentMethod,
        date,
        observations,
        created_at as createdAt,
        updated_at as updatedAt
      FROM sales 
      WHERE id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      data: newSale[0],
      message: 'Vente créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la vente:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la vente'
    });
  }
});

// PUT /api/sales/:id - Mettre à jour une vente
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const {
      targetType,
      targetId,
      targetName,
      buyerName,
      quantity,
      unitPrice,
      totalAmount,
      paymentMethod,
      date,
      observations
    } = req.body;

    // Vérifier que la vente existe et appartient à l'utilisateur
    const [existingSale] = await pool.execute(`
      SELECT id FROM sales WHERE id = ? AND user_id = ?
    `, [req.params.id, req.user.id]);

    if (existingSale.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vente non trouvée'
      });
    }

    // Validation des données
    if (!targetType || !targetId || !buyerName || !quantity || !unitPrice || !paymentMethod || !date) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis'
      });
    }

    if (quantity <= 0 || unitPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La quantité et le prix unitaire doivent être supérieurs à 0'
      });
    }

    await pool.execute(`
      UPDATE sales SET
        target_type = ?,
        target_id = ?,
        target_name = ?,
        buyer_name = ?,
        quantity = ?,
        unit_price = ?,
        total_amount = ?,
        payment_method = ?,
        date = ?,
        observations = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `, [
      targetType,
      targetId,
      targetName || null,
      buyerName,
      quantity,
      unitPrice,
      totalAmount || (quantity * unitPrice),
      paymentMethod,
      date,
      observations || null,
      req.params.id,
      req.user.id
    ]);

    // Récupérer la vente mise à jour
    const [updatedSale] = await pool.execute(`
      SELECT 
        id,
        target_type as targetType,
        target_id as targetId,
        target_name as targetName,
        buyer_name as buyerName,
        quantity,
        unit_price as unitPrice,
        total_amount as totalAmount,
        payment_method as paymentMethod,
        date,
        observations,
        created_at as createdAt,
        updated_at as updatedAt
      FROM sales 
      WHERE id = ?
    `, [req.params.id]);

    res.json({
      success: true,
      data: updatedSale[0],
      message: 'Vente mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la vente:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la vente'
    });
  }
});

// DELETE /api/sales/:id - Supprimer une vente
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    // Vérifier que la vente existe et appartient à l'utilisateur
    const [existingSale] = await pool.execute(`
      SELECT id FROM sales WHERE id = ? AND user_id = ?
    `, [req.params.id, req.user.id]);

    if (existingSale.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vente non trouvée'
      });
    }

    await pool.execute(`
      DELETE FROM sales WHERE id = ? AND user_id = ?
    `, [req.params.id, req.user.id]);

    res.json({
      success: true,
      message: 'Vente supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la vente:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la vente'
    });
  }
});

module.exports = router;
