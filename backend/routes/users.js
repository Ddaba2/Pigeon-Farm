import express from 'express';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errorHandler.js';
import UserService from '../services/userService.js';

const router = express.Router();

// GET /api/users - Récupérer tous les utilisateurs (admin seulement)
router.get('/', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    
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

// GET /api/users/:id - Récupérer un utilisateur par ID
router.get('/:id', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id);
  
  try {
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
    
    // Ne pas renvoyer le mot de passe
    delete user.password;
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération de l\'utilisateur',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// PUT /api/users/:id - Mettre à jour un utilisateur
router.put('/:id', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id);
  const updateData = req.body;
  
  try {
    // Ne pas permettre la mise à jour du mot de passe via cette route
    delete updateData.password;
    
    const updatedUser = await UserService.updateUser(userId, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        }
      });
    }
    
    // Ne pas renvoyer le mot de passe
    delete updatedUser.password;
    
    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: updatedUser
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour de l\'utilisateur',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// DELETE /api/users/:id - Supprimer un utilisateur
router.delete('/:id', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id);
  
  try {
    await UserService.deleteUser(userId);
    
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

// GET /api/users/profile - Profil de l'utilisateur connecté
router.get('/profile/me', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const user = await UserService.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        }
      });
    }
    
    // Ne pas renvoyer le mot de passe
    delete user.password;
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération du profil',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// PUT /api/users/profile/me - Mettre à jour le profil de l'utilisateur connecté
router.put('/profile/me', authenticateUser, asyncHandler(async (req, res) => {
  const updateData = req.body;
  
  try {
    // Ne pas permettre la mise à jour du mot de passe via cette route
    delete updateData.password;
    delete updateData.role;
    
    const updatedUser = await UserService.updateUser(req.user.id, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        }
      });
    }
    
    // Ne pas renvoyer le mot de passe
    delete updatedUser.password;
    
    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: updatedUser
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour du profil',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

export default router; 