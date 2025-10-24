const express = require('express');
const router = express.Router();
const pigeonneauService = require('../services/pigeonneauService');
const { authenticateUser } = require('../middleware/auth');

// Validation pour les pigeonneaux
const validatePigeonneau = (data, isUpdate = false) => {
  console.log('🔍 Validation des données pigeonneau:', JSON.stringify(data, null, 2));
  const errors = [];
  
  // Pour la création, ces champs sont obligatoires
  if (!isUpdate) {
    if (!data.coupleId) {
      errors.push('ID du couple requis');
      console.log('❌ coupleId manquant');
    } else {
      console.log('✅ coupleId présent:', data.coupleId, typeof data.coupleId);
    }
    
    if (!data.birthDate) {
      errors.push('Date de naissance requise');
      console.log('❌ birthDate manquant');
    } else {
      console.log('✅ birthDate présent:', data.birthDate);
    }
    
    if (!data.sex || !['male', 'female', 'unknown'].includes(data.sex)) {
      errors.push('Sexe doit être male, female ou unknown');
      console.log('❌ sex invalide:', data.sex);
    } else {
      console.log('✅ sex valide:', data.sex);
    }
  } else {
    // Pour la mise à jour, valider seulement si les champs sont présents
    if (data.sex !== undefined && !['male', 'female', 'unknown'].includes(data.sex)) {
      errors.push('Sexe doit être male, female ou unknown');
      console.log('❌ sex invalide:', data.sex);
    }
  }
  
  if (data.weight !== undefined && data.weight !== null && data.weight <= 0) {
    errors.push('Poids doit être supérieur à 0');
    console.log('❌ weight invalide:', data.weight);
  } else {
    console.log('✅ weight OK:', data.weight);
  }
  
  if (data.status && !['alive', 'sold', 'dead', 'active', 'deceased'].includes(data.status)) {
    errors.push('Statut doit être alive, sold, dead, active ou deceased');
    console.log('❌ status invalide:', data.status);
  } else {
    console.log('✅ status OK:', data.status);
  }
  
  if (data.salePrice !== undefined && data.salePrice < 0) {
    errors.push('Prix de vente ne peut pas être négatif');
    console.log('❌ salePrice invalide:', data.salePrice);
  }
  
  console.log('🔍 Résultat validation pigeonneau:', { isValid: errors.length === 0, errors });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Récupérer tous les pigeonneaux
router.get('/', authenticateUser, async (req, res) => {
  try {
    // Récupérer seulement les pigeonneaux des couples de l'utilisateur connecté
    const { executeQuery } = require('../config/database');
    const pigeonneaux = await executeQuery(`
      SELECT p.* 
      FROM pigeonneaux p
      JOIN couples c ON p.coupleId = c.id
      WHERE c.user_id = ?
      ORDER BY p.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, data: pigeonneaux });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer un pigeonneau par ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const pigeonneau = await pigeonneauService.getPigeonneauById(req.params.id);
    if (!pigeonneau) {
      return res.status(404).json({ success: false, error: 'Pigeonneau non trouvé' });
    }
    
    // Vérifier que le pigeonneau appartient à l'utilisateur connecté
    const { executeQuery } = require('../config/database');
    const userPigeonneau = await executeQuery(`
      SELECT p.* 
      FROM pigeonneaux p
      JOIN couples c ON p.coupleId = c.id
      WHERE p.id = ? AND c.user_id = ?
    `, [req.params.id, req.user.id]);
    
    if (userPigeonneau.length === 0) {
      return res.status(404).json({ success: false, error: 'Pigeonneau non trouvé' });
    }
    
    res.json({ success: true, data: userPigeonneau[0] });
  } catch (error) {
    console.error('Erreur lors de la récupération du pigeonneau:', error);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
});

// Créer un nouveau pigeonneau
router.post('/', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 POST /pigeonneaux - Données reçues:', JSON.stringify(req.body, null, 2));
    console.log('🔍 Utilisateur:', req.user.username, 'ID:', req.user.id);
    
    const validation = validatePigeonneau(req.body);
    if (!validation.isValid) {
      console.log('❌ Validation échouée:', validation.errors);
      return res.status(400).json({ success: false, error: validation.errors.join(', ') });
    }

    const newPigeonneau = await pigeonneauService.createPigeonneau(req.body);
    console.log('✅ Pigeonneau créé avec succès:', newPigeonneau);
    res.status(201).json({ success: true, data: newPigeonneau });
  } catch (error) {
    console.log('❌ Erreur création pigeonneau:', error.message);
    
    // Message d'erreur plus spécifique pour les clés étrangères
    if (error.message.includes('foreign key constraint fails')) {
      const coupleId = req.body.coupleId;
      return res.status(400).json({ 
        success: false, 
        error: `Le couple avec l'ID ${coupleId} n'existe pas ou ne vous appartient pas. Veuillez sélectionner un couple valide.`
      });
    }
    
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mettre à jour un pigeonneau
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const validation = validatePigeonneau(req.body, true);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, error: validation.errors.join(', ') });
    }

    const updatedPigeonneau = await pigeonneauService.updatePigeonneau(req.params.id, req.body);
    res.json({ success: true, data: updatedPigeonneau });
  } catch (error) {
    if (error.message === 'Pigeonneau non trouvé') {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Supprimer un pigeonneau
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const result = await pigeonneauService.deletePigeonneau(req.params.id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    if (error.message === 'Pigeonneau non trouvé') {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les pigeonneaux par couple
router.get('/couple/:coupleId', authenticateUser, async (req, res) => {
  try {
    const pigeonneaux = await pigeonneauService.getPigeonneauxByCouple(req.params.coupleId);
    res.json({ success: true, data: pigeonneaux });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les statistiques des pigeonneaux
router.get('/stats/summary', authenticateUser, async (req, res) => {
  try {
    const stats = await pigeonneauService.getPigeonneauStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les statistiques de vente
router.get('/stats/sales', authenticateUser, async (req, res) => {
  try {
    const salesStats = await pigeonneauService.getSaleStats();
    res.json({ success: true, data: salesStats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les pigeonneaux par sexe
router.get('/stats/by-sex', authenticateUser, async (req, res) => {
  try {
    const sexStats = await pigeonneauService.getPigeonneauxBySex();
    res.json({ success: true, data: sexStats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 
