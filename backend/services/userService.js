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
      const sql = 'SELECT id, username, email, full_name as fullName, role, status, avatar_url, google_id, auth_provider, created_at, updated_at, last_login, phone, address, bio FROM users WHERE id = ?';
      const users = await executeQuery(sql, [id]);
      
      if (!users[0]) {
        return null;
      }

      const user = users[0];
      
      // S'assurer que les champs requis ont des valeurs par défaut
      user.status = user.status || 'active';
      user.role = user.role || 'user';
      
      if (user.avatar_url) {
        // Convertir le LONGBLOB en base64 pour l'affichage
        // Si c'est déjà un Buffer (nouveau stockage LONGBLOB)
        if (Buffer.isBuffer(user.avatar_url)) {
          user.avatar_url = `data:image/jpeg;base64,${user.avatar_url.toString('base64')}`;
        } 
        // Si c'est une string (ancien stockage ou URL HTTP)
        else if (typeof user.avatar_url === 'string') {
          // Garder tel quel si c'est déjà une data URL ou une URL HTTP
          if (!user.avatar_url.startsWith('data:') && !user.avatar_url.startsWith('http')) {
            // Ancien format base64 sans préfixe
            user.avatar_url = `data:image/jpeg;base64,${user.avatar_url}`;
          }
        }
        // S'assurer que avatar_url est toujours une string
        if (user.avatar_url && typeof user.avatar_url !== 'string') {
          user.avatar_url = String(user.avatar_url);
        }
      }
      
      return user;
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
        SELECT id, username, email, full_name, role, status, created_at, updated_at, last_login 
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
      const sql = 'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?';
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
      // Supprimer l'utilisateur directement (les contraintes de clé étrangère géreront le reste)
      const sql = 'DELETE FROM users WHERE id = ?';
      const result = await executeQuery(sql, [userId]);
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return { id: userId, deleted: true };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  }

  // ========== MÉTHODES DE PROFIL UTILISATEUR ==========

  // Changer le mot de passe d'un utilisateur
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      console.log('🔑 changePassword - userId:', userId);
      console.log('🔑 changePassword - currentPassword fourni:', !!currentPassword);
      console.log('🔑 changePassword - newPassword longueur:', newPassword?.length);
      
      // Récupérer l'utilisateur avec le mot de passe
      const sql = 'SELECT * FROM users WHERE id = ?';
      const users = await executeQuery(sql, [userId]);
      const user = users[0];
      
      if (!user) {
        console.log('❌ Utilisateur non trouvé:', userId);
        return {
          success: false,
          message: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        };
      }

      console.log('🔑 Utilisateur trouvé:', user.username);
      console.log('🔑 Password hash exists:', !!user.password);

      // Vérifier le mot de passe actuel
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      console.log('🔑 Mot de passe actuel valide:', isCurrentPasswordValid);
      
      if (!isCurrentPasswordValid) {
        console.log('❌ Mot de passe actuel incorrect');
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
      
      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      if (profileData.email !== undefined) {
        const isEmailAvailable = await this.isEmailAvailable(profileData.email, userId);
        if (!isEmailAvailable) {
          throw new Error('Cet email est déjà utilisé par un autre utilisateur');
        }
        fields.push('email = ?');
        values.push(profileData.email);
      }
      
      // Vérifier si le nom d'utilisateur est déjà utilisé par un autre utilisateur
      if (profileData.username !== undefined) {
        const isUsernameAvailable = await this.isUsernameAvailable(profileData.username, userId);
        if (!isUsernameAvailable) {
          throw new Error('Ce nom d\'utilisateur est déjà utilisé par un autre utilisateur');
        }
        fields.push('username = ?');
        values.push(profileData.username);
      }
      
      // Mettre à jour le nom complet si fourni
      if (profileData.full_name !== undefined) {
        fields.push('full_name = ?');
        values.push(profileData.full_name);
      }
      
      // Mettre à jour l'avatar si fourni
      if (profileData.avatar_url !== undefined) {
        if (profileData.avatar_url && profileData.avatar_url.length > 0) {
          // Si c'est une data URL (base64), convertir en Buffer pour stockage en LONGBLOB
          if (profileData.avatar_url.startsWith('data:')) {
            // Extraire le base64 de la data URL
            const base64Data = profileData.avatar_url.split(',')[1];
            const avatarBuffer = Buffer.from(base64Data, 'base64');
            fields.push('avatar_url = ?');
            values.push(avatarBuffer);
          } else if (profileData.avatar_url.startsWith('http://') || profileData.avatar_url.startsWith('https://')) {
            // URLs HTTP/HTTPS : stocker directement
            fields.push('avatar_url = ?');
            values.push(profileData.avatar_url);
          } else {
            console.warn('URL d\'avatar invalide fournie:', profileData.avatar_url.substring(0, 50) + '...');
          }
        } else {
          // Si avatar_url est null ou vide, le mettre à jour quand même
          fields.push('avatar_url = ?');
          values.push(profileData.avatar_url || null);
        }
      }
      
      // Mettre à jour le téléphone si fourni
      if (profileData.phone !== undefined) {
        fields.push('phone = ?');
        values.push(profileData.phone || null);
      }
      
      // Mettre à jour l'adresse si fournie
      if (profileData.address !== undefined) {
        fields.push('address = ?');
        values.push(profileData.address || null);
      }
      
      // Mettre à jour la bio si fournie
      if (profileData.bio !== undefined) {
        fields.push('bio = ?');
        values.push(profileData.bio || null);
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

  // ========== MÉTHODES GOOGLE OAUTH ==========

  // Créer un utilisateur via Google OAuth
  static async createGoogleUser(userData) {
    const { google_id, email, username, fullName, avatar_url } = userData;
    
    try {
      const sql = `
        INSERT INTO users (google_id, email, username, full_name, avatar_url, auth_provider, status, created_at, last_login) 
        VALUES (?, ?, ?, ?, ?, 'google', 'active', NOW(), NOW())
      `;
      
      const result = await executeQuery(sql, [
        google_id,
        email,
        username,
        fullName || '',
        avatar_url || null
      ]);
      
      // Récupérer l'utilisateur créé
      const newUser = await this.getUserById(result.insertId);
      return newUser;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur Google:', error);
      throw error;
    }
  }

  // Lier un compte Google à un utilisateur existant
  static async linkGoogleAccount(userId, google_id, avatar_url = null) {
    try {
      const sql = `
        UPDATE users 
        SET google_id = ?, avatar_url = COALESCE(?, avatar_url), auth_provider = 'google', updated_at = NOW() 
        WHERE id = ?
      `;
      
      await executeQuery(sql, [google_id, avatar_url, userId]);
      
      // Récupérer l'utilisateur mis à jour
      return await this.getUserById(userId);
    } catch (error) {
      console.error('Erreur lors de la liaison du compte Google:', error);
      throw error;
    }
  }

  // Récupérer un utilisateur par Google ID
  static async getUserByGoogleId(google_id) {
    try {
      const sql = 'SELECT * FROM users WHERE google_id = ?';
      const users = await executeQuery(sql, [google_id]);
      return users[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur par Google ID:', error);
      throw error;
    }
  }

  // Vérifier si un Google ID est déjà utilisé
  static async isGoogleIdAvailable(google_id, excludeUserId = null) {
    try {
      let sql = 'SELECT id FROM users WHERE google_id = ?';
      let params = [google_id];
      
      if (excludeUserId) {
        sql += ' AND id != ?';
        params.push(excludeUserId);
      }
      
      const users = await executeQuery(sql, params);
      return users.length === 0;
    } catch (error) {
      console.error('Erreur lors de la vérification du Google ID:', error);
      throw error;
    }
  }

  // Mettre à jour l'avatar d'un utilisateur
  static async updateAvatar(userId, avatar_url) {
    try {
      const sql = 'UPDATE users SET avatar_url = ?, updated_at = NOW() WHERE id = ?';
      await executeQuery(sql, [avatar_url, userId]);
      
      // Récupérer l'utilisateur mis à jour
      return await this.getUserById(userId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'avatar:', error);
      throw error;
    }
  }

  // Récupérer les utilisateurs par fournisseur d'authentification
  static async getUsersByAuthProvider(auth_provider) {
    try {
      const sql = `
        SELECT id, username, email, full_name, role, status, auth_provider, created_at, last_login 
        FROM users 
        WHERE auth_provider = ? 
        ORDER BY created_at DESC
      `;
      const users = await executeQuery(sql, [auth_provider]);
      return users;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs par fournisseur:', error);
      throw error;
    }
  }

}

module.exports = UserService; 