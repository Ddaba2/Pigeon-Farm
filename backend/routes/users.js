const express = require('express');
const { authenticateUser, requireAdmin } = require('../middleware/auth.js');
const { asyncHandler } = require('../utils/errorHandler.js');
const UserService = require('../services/userService.js');
const EmailService = require('../services/emailService.js');

const router = express.Router();
const emailService = new EmailService();

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
    
    // Valider les données
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Aucune donnée à mettre à jour',
          code: 'NO_DATA'
        }
      });
    }
    
    const updatedUser = await UserService.updateProfile(req.user.id, updateData);
    
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
        message: 'Erreur lors de la mise à jour du profil: ' + error.message,
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// PUT /api/users/profile/me/password - Changer le mot de passe de l'utilisateur connecté
router.put('/profile/me/password', authenticateUser, asyncHandler(async (req, res) => {
  console.log('🔑 PUT /profile/me/password - Requête reçue');
  console.log('🔑 Utilisateur:', req.user.username, 'ID:', req.user.id);
  console.log('🔑 Body reçu:', JSON.stringify(req.body, null, 2));
  
  const { currentPassword, newPassword } = req.body;
  
  try {
    if (!currentPassword || !newPassword) {
      console.log('❌ Données manquantes - currentPassword:', !!currentPassword, 'newPassword:', !!newPassword);
      return res.status(400).json({
        success: false,
        error: {
          message: 'Mot de passe actuel et nouveau mot de passe requis',
          code: 'MISSING_PASSWORD'
        }
      });
    }

    if (newPassword.length < 6) {
      console.log('❌ Mot de passe trop court:', newPassword.length);
      return res.status(400).json({
        success: false,
        error: {
          message: 'Le nouveau mot de passe doit contenir au moins 6 caractères',
          code: 'WEAK_PASSWORD'
        }
      });
    }

    console.log('🔑 Appel de UserService.changePassword...');
    const result = await UserService.changePassword(req.user.id, currentPassword, newPassword);
    console.log('🔑 Résultat de changePassword:', result);
    
    if (!result.success) {
      console.log('❌ Échec du changement de mot de passe:', result.message);
      return res.status(400).json({
        success: false,
        error: {
          message: result.message,
          code: result.code
        }
      });
    }
    
    // Envoyer email de notification de changement de mot de passe
    try {
      const user = await UserService.getUserById(req.user.id);
      await emailService.sendPasswordChangedNotification(user);
      console.log('📧 Email de notification de changement de mot de passe envoyé');
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de notification:', emailError);
      // Ne pas faire échouer la requête si l'email échoue
    }
    
    console.log('✅ Mot de passe modifié avec succès');
    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors du changement de mot de passe:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors du changement de mot de passe: ' + error.message,
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// PUT /api/users/profile/me/avatar - Mettre à jour l'avatar de l'utilisateur
router.put('/profile/me/avatar', authenticateUser, asyncHandler(async (req, res) => {
  const { avatarUrl } = req.body;
  
  try {
    if (!avatarUrl) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'URL de l\'avatar requise',
          code: 'MISSING_AVATAR_URL'
        }
      });
    }

    const updatedUser = await UserService.updateProfile(req.user.id, { avatar_url: avatarUrl });
    
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
      message: 'Avatar mis à jour avec succès',
      data: updatedUser
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'avatar:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour de l\'avatar',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

// DELETE /api/users/profile/me - Supprimer le compte de l'utilisateur connecté
router.delete('/profile/me', authenticateUser, asyncHandler(async (req, res) => {
  console.log('🔍 DELETE /profile/me - Body reçu:', JSON.stringify(req.body, null, 2));
  console.log('🔍 Utilisateur:', req.user.username, 'ID:', req.user.id);
  
  const { password, confirmDelete } = req.body;
  
  try {
    if (!password || !confirmDelete) {
      console.log('❌ Données manquantes - password:', !!password, 'confirmDelete:', !!confirmDelete);
      return res.status(400).json({
        success: false,
        error: {
          message: 'Mot de passe et confirmation de suppression requis',
          code: 'MISSING_CONFIRMATION'
        }
      });
    }

    if (confirmDelete !== 'SUPPRIMER') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Confirmation incorrecte. Tapez "SUPPRIMER" pour confirmer.',
          code: 'INVALID_CONFIRMATION'
        }
      });
    }

    // Vérifier le mot de passe avant suppression
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

    // Vérifier que l'utilisateur a un mot de passe (comptes Google n'en ont pas)
    if (user.password) {
      const bcrypt = require('bcrypt');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Mot de passe incorrect',
            code: 'INVALID_PASSWORD'
          }
        });
      }
    }

    // Envoyer email de notification AVANT la suppression
    try {
      await emailService.sendAccountDeletedByUserNotification(user);
      console.log('📧 Email de notification de suppression envoyé');
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de notification:', emailError);
      // Ne pas faire échouer la requête si l'email échoue
    }
    
    // Supprimer le compte
    console.log('🗑️ Suppression du compte utilisateur:', req.user.id);
    await UserService.deleteUser(req.user.id);
    console.log('✅ Compte supprimé de la base de données');
    
    // Détruire la session
    const { destroySession } = require('../middleware/auth.js');
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];
    if (sessionId) {
      console.log('🗑️ Destruction de la session:', sessionId);
      await destroySession(sessionId);
    }
    
    console.log('✅ Suppression complète réussie');
    res.json({
      success: true,
      message: 'Compte supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la suppression du compte: ' + error.message,
        code: 'INTERNAL_ERROR'
      }
    });
  }
}));

module.exports = router; 