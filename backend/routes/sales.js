const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const salesService = require('../services/salesService');

// GET /api/sales - Récupérer toutes les ventes de l'utilisateur
router.get('/', authenticateUser, async (req, res) => {
  try {
    const sales = await salesService.getAllSales(req.user.id);

    res.json({
      success: true,
      data: sales
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des ventes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des ventes'
    });
  }
});

// GET /api/sales/:id - Récupérer une vente spécifique de l'utilisateur
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const sale = await salesService.getSaleById(req.params.id, req.user.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Vente non trouvée'
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la vente:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la vente'
    });
  }
});

// POST /api/sales - Créer une nouvelle vente pour l'utilisateur
router.post('/', authenticateUser, async (req, res) => {
  try {
    const {
      buyerName,
      quantity,
      unitPrice,
      totalAmount,
      date,
      description
    } = req.body;

    // Validation des données
    if (!buyerName || !quantity || !unitPrice || !date) {
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

    const newSale = await salesService.createSale(req.body, req.user.id);

    res.status(201).json({
      success: true,
      data: newSale,
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

// PUT /api/sales/:id - Mettre à jour une vente de l'utilisateur
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const {
      buyerName,
      quantity,
      unitPrice,
      totalAmount,
      date,
      description
    } = req.body;

    // Vérifier que la vente existe et appartient à l'utilisateur
    const existingSale = await salesService.getSaleById(req.params.id, req.user.id);

    if (!existingSale) {
      return res.status(404).json({
        success: false,
        message: 'Vente non trouvée'
      });
    }

    // Validation des données (pour la mise à jour, seulement valider les champs présents)
    if (quantity !== undefined && quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La quantité doit être supérieure à 0'
      });
    }

    if (unitPrice !== undefined && unitPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Le prix unitaire doit être supérieur à 0'
      });
    }

    const updatedSale = await salesService.updateSale(req.params.id, req.body, req.user.id);

    res.json({
      success: true,
      data: updatedSale,
      message: 'Vente mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la vente:', error);
    if (error.message === 'Vente non trouvée ou non autorisée') {
      return res.status(404).json({
        success: false,
        message: 'Vente non trouvée'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la vente'
    });
  }
});

// DELETE /api/sales/:id - Supprimer une vente de l'utilisateur
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const result = await salesService.deleteSale(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Vente supprimée avec succès'
    });
  } catch (error) {
    if (error.message === 'Vente non trouvée ou non autorisée') {
      return res.status(404).json({
        success: false,
        message: 'Vente non trouvée'
      });
    }
    console.error('Erreur lors de la suppression de la vente:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la vente'
    });
  }
});

module.exports = router;