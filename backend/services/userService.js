const { executeQuery, executeTransaction } = require('../config/database.js');
const bcrypt = require('bcrypt');

class UserService {
  // Créer un nouvel utilisateur
  static async createUser(userData) {
    const { username, email, password, fullName, role = 'user' } = userData;
    
    try {
      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const sql = `
        INSERT INTO users (username, email, password, full_name, role, created_at, last_login) 
        VALUES (?, ?, ?, ?, ?, NOW(), NULL)
      `;
      
      const result = await executeQuery(sql, [username, email, hashedPassword, fullName, role]);
      
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
      const sql = 'SELECT id, username, email, full_name, role, created_at, last_login FROM users WHERE id = ?';
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
}

module.exports = UserService; 