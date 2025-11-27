const express = require('express');
const router = express.Router();
const eggService = require('../services/eggService');
const { authenticateUser } = require('../middleware/auth');

// Validation pour les œufs
const validateEgg = (data, isUpdate = false) => {
  console.log('🔍 Validation des données œuf:', JSON.stringify(data, null, 2));
  const errors = [];
  
  // Pour la création, ces champs sont obligatoires
  if (!isUpdate) {
    if (!data.coupleId) {
      errors.push('ID du couple requis');
      console.log('❌ coupleId manquant');
    } else {
      console.log('✅ coupleId présent:', data.coupleId);
    }
    
    if (!data.egg1Date) {
      errors.push('Date du premier œuf requise');
      console.log('❌ egg1Date manquant');
    } else {
      console.log('✅ egg1Date présent:', data.egg1Date);
    }
  }
  
  if (data.success1 !== undefined && typeof data.success1 !== 'boolean') {
    errors.push('Succès du premier œuf doit être un booléen');
    console.log('❌ success1 invalide:', data.success1, typeof data.success1);
  }
  
  if (data.success2 !== undefined && typeof data.success2 !== 'boolean') {
    errors.push('Succès du deuxième œuf doit être un booléen');
    console.log('❌ success2 invalide:', data.success2, typeof data.success2);
  }
  
  console.log('🔍 Résultat validation:', { isValid: errors.length === 0, errors });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Récupérer tous les œufs
router.get('/', authenticateUser, async (req, res) => {
  try {
    // Récupérer seulement les œufs des couples de l'utilisateur connecté
    const { executeQuery } = require('../config/database');
    const eggs = await executeQuery(`
      SELECT e.* 
      FROM eggs e
      JOIN couples c ON e.coupleId = c.id
      WHERE c.user_id = ?
      ORDER BY e.createdAt DESC
    `, [req.user.id]);
    res.json({ success: true, data: eggs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer un œuf par ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const egg = await eggService.getEggById(req.params.id);
    if (!egg) {
      return res.status(404).json({ success: false, error: 'Enregistrement d\'œufs non trouvé' });
    }
    res.json({ success: true, data: egg });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Créer un nouvel enregistrement d'œufs
router.post('/', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 POST /eggs - Données reçues:', JSON.stringify(req.body, null, 2));
    console.log('🔍 Utilisateur:', req.user.username, 'ID:', req.user.id);
    
    const validation = validateEgg(req.body);
    if (!validation.isValid) {
      console.log('❌ Validation échouée:', validation.errors);
      return res.status(400).json({ success: false, error: validation.errors.join(', ') });
    }

    const newEgg = await eggService.createEgg(req.body);
    console.log('✅ Œuf créé avec succès:', newEgg);
    res.status(201).json({ success: true, data: newEgg });
  } catch (error) {
    console.log('❌ Erreur création œuf:', error.message);
    
    // Message d'erreur plus spécifique pour les clés étrangères
    if (error.message.includes('foreign key constraint fails')) {
      const coupleId = req.body.coupleId;
      return res.status(400).json({ 
        success: false, 
        error: `Le couple avec l'ID ${coupleId} n'existe pas ou ne vous appartient pas. Veuillez sélectionner un couple valide.`
      });
    }
    
    // Message d'erreur pour les duplications
    if (error.message.includes('existe déjà')) {
      return res.status(400).json({ 
        success: false, 
        error: error.message
      });
    }
    
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mettre à jour un enregistrement d'œufs
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 PUT /eggs/:id - ID:', req.params.id);
    console.log('🔍 Body reçu:', JSON.stringify(req.body, null, 2));
    
    const validation = validateEgg(req.body, true);
    console.log('🔍 Validation:', validation);
    
    if (!validation.isValid) {
      console.log('❌ Validation échouée:', validation.errors);
      return res.status(400).json({ success: false, error: validation.errors.join(', ') });
    }

    const updatedEgg = await eggService.updateEgg(req.params.id, req.body);
    console.log('✅ Mise à jour réussie:', updatedEgg);
    res.json({ success: true, data: updatedEgg });
  } catch (error) {
    console.log('❌ Erreur dans PUT /eggs/:id:', error.message);
    if (error.message === 'Enregistrement d\'œufs non trouvé') {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Supprimer un enregistrement d'œufs
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const result = await eggService.deleteEgg(req.params.id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    if (error.message === 'Enregistrement d\'œufs non trouvé') {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les œufs par couple
router.get('/couple/:coupleId', authenticateUser, async (req, res) => {
  try {
    const eggs = await eggService.getEggsByCouple(req.params.coupleId);
    res.json({ success: true, data: eggs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les statistiques des œufs
router.get('/stats/summary', authenticateUser, async (req, res) => {
  try {
    const stats = await eggService.getEggStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer le taux de réussite des œufs
router.get('/stats/success-rate', authenticateUser, async (req, res) => {
  try {
    const successRate = await eggService.getSuccessRate();
    res.json({ success: true, data: successRate });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🆕 NOUVELLE ROUTE : Créer un œuf avec éclosion et pigeonneau en une transaction
router.post('/with-hatching', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 POST /eggs/with-hatching - Données reçues:', JSON.stringify(req.body, null, 2));
    
    const { eggData, pigeonneauData } = req.body;
    
    if (!eggData || !eggData.coupleId || !eggData.egg1Date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Données d\'œuf incomplètes (coupleId et egg1Date requis)' 
      });
    }
    
    // Si pigeonneauData est fourni, vérifier le sexe
    if (pigeonneauData && !pigeonneauData.sex) {
      return res.status(400).json({ 
        success: false, 
        error: 'Sexe du pigeonneau requis' 
      });
    }
    
    const result = await eggService.createEggWithHatching(eggData, pigeonneauData);
    
    console.log('✅ Transaction réussie:', result);
    res.status(201).json({ 
      success: true, 
      data: result,
      message: pigeonneauData 
        ? 'Œuf et pigeonneau créés avec succès' 
        : 'Œuf créé avec succès'
    });
  } catch (error) {
    console.log('❌ Erreur transaction:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🆕 NOUVELLE ROUTE : Marquer un œuf comme éclos et créer le pigeonneau
router.post('/:id/hatch', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 POST /eggs/:id/hatch - ID:', req.params.id);
    console.log('🔍 Données reçues:', JSON.stringify(req.body, null, 2));
    
    const { hatchData, pigeonneauData } = req.body;
    
    if (!hatchData || !hatchData.hatchDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Date d\'éclosion requise' 
      });
    }
    
    if (!pigeonneauData || !pigeonneauData.sex) {
      return res.status(400).json({ 
        success: false, 
        error: 'Données du pigeonneau requises (au minimum le sexe)' 
      });
    }
    
    const result = await eggService.hatchEggAndCreatePigeonneau(
      req.params.id,
      hatchData,
      pigeonneauData
    );
    
    console.log('✅ Transaction réussie:', result);
    res.json({ 
      success: true, 
      data: result,
      message: 'Œuf éclos et pigeonneau créé avec succès'
    });
  } catch (error) {
    console.log('❌ Erreur transaction:', error.message);
    
    if (error.message.includes('non trouvé')) {
      return res.status(404).json({ success: false, error: error.message });
    }
    
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 