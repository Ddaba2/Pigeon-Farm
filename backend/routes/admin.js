const express = require('express');
const { authenticateUser, requireAdmin } = require('../middleware/auth.js');
const { asyncHandler } = require('../utils/errorHandler.js');
const UserService = require('../services/userService.js');

const router = express.Router();

// ========== ROUTES D'ADMINISTRATION ==========

// GET /api/admin/stats - Statistiques d'administration
router.get('/stats', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const stats = await UserService.getAdminStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques admin:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des statistiques',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// GET /api/admin/users - Récupérer tous les utilisateurs (admin)
router.get('/users', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const users = await UserService.getAllUsersForAdmin();
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des utilisateurs',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// GET /api/admin/users/recent - Utilisateurs récents
router.get('/users/recent', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const users = await UserService.getRecentUsers(limit);
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs récents:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des utilisateurs récents',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// PUT /api/admin/users/:id/block - Bloquer un utilisateur
router.put('/users/:id/block', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (!userId || userId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'ID utilisateur invalide',
          code: 'INVALID_USER_ID'
        }
      });
    }

    // Vérifier que l'admin ne se bloque pas lui-même
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Vous ne pouvez pas bloquer votre propre compte',
          code: 'CANNOT_BLOCK_SELF'
        }
      });
    }

    const updatedUser = await UserService.blockUser(userId);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: updatedUser,
      message: 'Utilisateur bloqué avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du blocage de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors du blocage de l\'utilisateur',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// PUT /api/admin/users/:id/unblock - Débloquer un utilisateur
router.put('/users/:id/unblock', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (!userId || userId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'ID utilisateur invalide',
          code: 'INVALID_USER_ID'
        }
      });
    }

    const updatedUser = await UserService.unblockUser(userId);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: updatedUser,
      message: 'Utilisateur débloqué avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du déblocage de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors du déblocage de l\'utilisateur',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// DELETE /api/admin/users/:id - Supprimer un utilisateur
router.delete('/users/:id', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (!userId || userId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'ID utilisateur invalide',
          code: 'INVALID_USER_ID'
        }
      });
    }

    // Vérifier que l'admin ne se supprime pas lui-même
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Vous ne pouvez pas supprimer votre propre compte',
          code: 'CANNOT_DELETE_SELF'
        }
      });
    }

    // Vérifier que l'utilisateur existe avant de le supprimer
    const user = await UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    await UserService.deleteUserAdmin(userId);

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la suppression de l\'utilisateur',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

module.exports = router;
