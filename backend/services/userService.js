const { executeQuery, executeTransaction } = require('../config/database.js');
const bcrypt = require('bcrypt');

class UserService {
  // Créer un nouvel utilisateur
  static async createUser(userData) {
    const { username, email, password, fullName, role = 'user' } = userData;
    
    try {
      // Hacher le mot de passe seulement s'il est fourni
      const hashedPassword = password ? await bcrypt.hash(password, 12) : null;
      
      const sql = `
        INSERT INTO users (username, email, password, full_name, role, status, created_at, last_login) 
        VALUES (?, ?, ?, ?, ?, 'active', NOW(), NULL)
      `;
      
      const result = await executeQuery(sql, [
        username, 
        email, 
        hashedPassword, 
        fullName || '', 
        role
      ]);
      
      // Récupérer l'utilisateur créé
      const newUser = await this.getUserById(result.insertId);
      return newUser;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }

  // Récupérer un utilisateur par ID
  static async getUserById(id) {
    try {
      const sql = 'SELECT id, username, email, full_name, role, status, avatar_url, phone, address, bio, created_at, updated_at, last_login, login_attempts FROM users WHERE id = ?';
      const users = await executeQuery(sql, [id]);
      return users[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  }

  // Récupérer un utilisateur par nom d'utilisateur
  static async getUserByUsername(username) {
    try {
      const sql = 'SELECT * FROM users WHERE username = ?';
      const users = await executeQuery(sql, [username]);
      return users[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  }

  // Récupérer un utilisateur par email
  static async getUserByEmail(email) {
    try {
      const sql = 'SELECT * FROM users WHERE email = ?';
      const users = await executeQuery(sql, [email]);
      return users[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  }

  // Vérifier si un utilisateur existe
  static async userExists(username, email) {
    try {
      const sql = 'SELECT id FROM users WHERE username = ? OR email = ?';
      const users = await executeQuery(sql, [username, email]);
      return users.length > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'existence:', error);
      throw error;
    }
  }

  // Mettre à jour la dernière connexion
  static async updateLastLogin(userId) {
    try {
      const sql = 'UPDATE users SET last_login = NOW() WHERE id = ?';
      await executeQuery(sql, [userId]);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la dernière connexion:', error);
      throw error;
    }
  }

  // Mettre à jour le mot de passe
  static async updatePassword(userId, hashedPassword) {
    try {
      const sql = 'UPDATE users SET password = ? WHERE id = ?';
      await executeQuery(sql, [hashedPassword, userId]);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      throw error;
    }
  }

  // Récupérer tous les utilisateurs (pour admin)
  static async getAllUsers(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const sql = `
        SELECT id, username, email, full_name, role, created_at, last_login 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;
      
      const users = await executeQuery(sql, [limit, offset]);
      
      // Compter le total
      const countSql = 'SELECT COUNT(*) as total FROM users';
      const [{ total }] = await executeQuery(countSql);
      
      return {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNextPage: offset + limit < total,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  }

  // Mettre à jour un utilisateur
  static async updateUser(userId, updateData) {
    try {
      const allowedFields = ['username', 'email', 'full_name', 'role'];
      const fields = [];
      const values = [];
      
      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      if (fields.length === 0) {
        throw new Error('Aucun champ valide à mettre à jour');
      }
      
      fields.push('updated_at = NOW()');
      values.push(userId);
      
      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      await executeQuery(sql, values);
      
      // Récupérer l'utilisateur mis à jour
      return await this.getUserById(userId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  }

  // Supprimer un utilisateur
  static async deleteUser(userId) {
    try {
      const sql = 'DELETE FROM users WHERE id = ?';
      await executeQuery(sql, [userId]);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  }

  // ========== MÉTHODES D'ADMINISTRATION ==========

  // Récupérer tous les utilisateurs pour l'admin
  static async getAllUsersForAdmin() {
    try {
      const sql = `
        SELECT id, username, email, full_name, role, status, created_at, updated_at, last_login, login_attempts 
        FROM users 
        ORDER BY created_at DESC
      `;
      const users = await executeQuery(sql);
      return users;
    } catch (error) {
      console.error('Erreur lors de la récupération de tous les utilisateurs:', error);
      throw error;
    }
  }

  // Récupérer les utilisateurs récents
  static async getRecentUsers(limit = 10) {
    try {
      const sql = `
        SELECT id, username, email, full_name, role, status, created_at, last_login 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT ?
      `;
      const users = await executeQuery(sql, [limit]);
      return users;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs récents:', error);
      throw error;
    }
  }

  // Obtenir les statistiques d'administration
  static async getAdminStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as totalUsers,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeUsers,
          SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blockedUsers,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingUsers,
          SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as totalAdmins
        FROM users
      `;
      const result = await executeQuery(sql);
      return result[0];
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques admin:', error);
      throw error;
    }
  }

  // Bloquer un utilisateur
  static async blockUser(userId) {
    try {
      const sql = 'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?';
      await executeQuery(sql, ['blocked', userId]);
      
      // Récupérer l'utilisateur mis à jour
      return await this.getUserById(userId);
    } catch (error) {
      console.error('Erreur lors du blocage de l\'utilisateur:', error);
      throw error;
    }
  }

  // Débloquer un utilisateur
  static async unblockUser(userId) {
    try {
      const sql = 'UPDATE users SET status = ?, updated_at = NOW(), login_attempts = 0 WHERE id = ?';
      await executeQuery(sql, ['active', userId]);
      
      // Récupérer l'utilisateur mis à jour
      return await this.getUserById(userId);
    } catch (error) {
      console.error('Erreur lors du déblocage de l\'utilisateur:', error);
      throw error;
    }
  }

  // Supprimer un utilisateur (admin seulement)
  static async deleteUserAdmin(userId) {
    try {
      // Utiliser une transaction pour supprimer toutes les données liées
      return await executeTransaction(async (connection) => {
        // 1. Récupérer les IDs des couples de l'utilisateur
        const [couples] = await connection.execute('SELECT id FROM couples WHERE user_id = ?', [userId]);
        const coupleIds = couples.map(couple => couple.id);
        
        // 2. Supprimer les pigeonneaux liés aux couples de l'utilisateur
        if (coupleIds.length > 0) {
          const placeholders = coupleIds.map(() => '?').join(',');
          await connection.execute(`DELETE FROM pigeonneaux WHERE coupleId IN (${placeholders})`, coupleIds);
        }
        
        // 3. Supprimer les œufs liés aux couples de l'utilisateur
        if (coupleIds.length > 0) {
          const placeholders = coupleIds.map(() => '?').join(',');
          await connection.execute(`DELETE FROM eggs WHERE coupleId IN (${placeholders})`, coupleIds);
        }
        
        // 4. Supprimer les couples de l'utilisateur
        await connection.execute('DELETE FROM couples WHERE user_id = ?', [userId]);
        
        // 5. Supprimer les ventes de l'utilisateur
        await connection.execute('DELETE FROM sales WHERE user_id = ?', [userId]);
        
        // 6. Supprimer les notifications de l'utilisateur
        await connection.execute('DELETE FROM notifications WHERE user_id = ?', [userId]);
        
        // 7. Supprimer l'utilisateur
        await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
        
        return true;
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  }

  // ========== MÉTHODES DE PROFIL UTILISATEUR ==========

  // Changer le mot de passe d'un utilisateur
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      // Récupérer l'utilisateur avec le mot de passe
      const sql = 'SELECT * FROM users WHERE id = ?';
      const users = await executeQuery(sql, [userId]);
      const user = users[0];
      
      if (!user) {
        return {
          success: false,
          message: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        };
      }

      // Vérifier le mot de passe actuel
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: 'Mot de passe actuel incorrect',
          code: 'INVALID_CURRENT_PASSWORD'
        };
      }

      // Hacher le nouveau mot de passe
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      
      // Mettre à jour le mot de passe
      const updateSql = 'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?';
      await executeQuery(updateSql, [hashedNewPassword, userId]);
      
      return {
        success: true,
        message: 'Mot de passe modifié avec succès'
      };
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      return {
        success: false,
        message: 'Erreur lors du changement de mot de passe',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  // Mettre à jour les informations de profil
  static async updateProfile(userId, profileData) {
    try {
      const allowedFields = ['username', 'email', 'full_name', 'avatar_url', 'phone', 'address', 'bio'];
      const fields = [];
      const values = [];
      
      for (const [key, value] of Object.entries(profileData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      if (fields.length === 0) {
        throw new Error('Aucun champ valide à mettre à jour');
      }
      
      fields.push('updated_at = NOW()');
      values.push(userId);
      
      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      await executeQuery(sql, values);
      
      // Récupérer l'utilisateur mis à jour
      return await this.getUserById(userId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }

  // Vérifier si un email est déjà utilisé par un autre utilisateur
  static async isEmailAvailable(email, excludeUserId = null) {
    try {
      let sql = 'SELECT id FROM users WHERE email = ?';
      let params = [email];
      
      if (excludeUserId) {
        sql += ' AND id != ?';
        params.push(excludeUserId);
      }
      
      const users = await executeQuery(sql, params);
      return users.length === 0;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error);
      throw error;
    }
  }

  // Vérifier si un nom d'utilisateur est déjà utilisé par un autre utilisateur
  static async isUsernameAvailable(username, excludeUserId = null) {
    try {
      let sql = 'SELECT id FROM users WHERE username = ?';
      let params = [username];
      
      if (excludeUserId) {
        sql += ' AND id != ?';
        params.push(excludeUserId);
      }
      
      const users = await executeQuery(sql, params);
      return users.length === 0;
    } catch (error) {
      console.error('Erreur lors de la vérification du nom d\'utilisateur:', error);
      throw error;
    }
  }

}

module.exports = UserService; 