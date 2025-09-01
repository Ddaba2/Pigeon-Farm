const express = require('express');
const router = express.Router();
const eggService = require('../services/eggService');
const { authenticateUser } = require('../middleware/auth');

// Validation pour les œufs
const validateEgg = (data) => {
  const errors = [];
  
  if (!data.coupleId) {
    errors.push('ID du couple requis');
  }
  
  if (!data.egg1Date) {
    errors.push('Date du premier œuf requise');
  }
  
  if (data.success1 !== undefined && typeof data.success1 !== 'boolean') {
    errors.push('Succès du premier œuf doit être un booléen');
  }
  
  if (data.success2 !== undefined && typeof data.success2 !== 'boolean') {
    errors.push('Succès du deuxième œuf doit être un booléen');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Récupérer tous les œufs
router.get('/', authenticateUser, async (req, res) => {
  try {
    const eggs = await eggService.getAllEggs();
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
    const validation = validateEgg(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, error: validation.errors.join(', ') });
    }

    const newEgg = await eggService.createEgg(req.body);
    res.status(201).json({ success: true, data: newEgg });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mettre à jour un enregistrement d'œufs
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 PUT /eggs/:id - ID:', req.params.id);
    console.log('🔍 Body reçu:', JSON.stringify(req.body, null, 2));
    
    const validation = validateEgg(req.body);
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

module.exports = router; 