const { executeQuery } = require('../config/database');

class HealthService {
  // Récupérer tous les enregistrements de santé
  async getAllHealthRecords(userId) {
    try {
      const rows = await executeQuery(`
        SELECT 
          h.id,
          h.type,
          h.targetType,
          h.targetId,
          h.product,
          h.date,
          h.nextDue,
          h.observations,
          h.created_at,
          h.updated_at,
          CASE 
            WHEN h.targetType = 'couple' THEN c.nestNumber
            WHEN h.targetType = 'pigeonneau' THEN CONCAT('Pigeonneau #', p.id)
            ELSE 'Inconnu'
          END as targetName
        FROM healthRecords h
        LEFT JOIN couples c ON h.targetType = 'couple' AND h.targetId = c.id
        LEFT JOIN pigeonneaux p ON h.targetType = 'pigeonneau' AND h.targetId = p.id
        WHERE h.user_id = ?
        ORDER BY h.created_at DESC
      `, [userId]);
      console.log('🔍 HealthService.getAllHealthRecords - Nombre d\'enregistrements:', rows.length);
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des enregistrements de santé: ${error.message}`);
    }
  }

  // Récupérer un enregistrement de santé par ID
  async getHealthRecordById(id) {
    try {
      const rows = await executeQuery(`
        SELECT 
          h.id,
          h.type,
          h.targetType,
          h.targetId,
          h.product,
          h.date,
          h.nextDue,
          h.observations,
          h.created_at,
          h.updated_at,
          CASE 
            WHEN h.targetType = 'couple' THEN c.nestNumber
            WHEN h.targetType = 'pigeonneau' THEN CONCAT('Pigeonneau #', p.id)
            ELSE 'Inconnu'
          END as targetName
        FROM healthRecords h
        LEFT JOIN couples c ON h.targetType = 'couple' AND h.targetId = c.id
        LEFT JOIN pigeonneaux p ON h.targetType = 'pigeonneau' AND h.targetId = p.id
        WHERE h.id = ?
      `, [id]);
      
      return rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'enregistrement de santé: ${error.message}`);
    }
  }

  // Créer un nouvel enregistrement de santé
  async createHealthRecord(healthData, userId) {
    try {
      const { 
        type, 
        targetType, 
        targetId, 
        product, 
        date, 
        nextDue = null, 
        observations = '' 
      } = healthData;
      
      console.log('🔍 HealthService.createHealthRecord - Données:', JSON.stringify(healthData, null, 2));
      console.log('🔍 HealthService.createHealthRecord - User ID:', userId);
      
      const result = await executeQuery(`
        INSERT INTO healthRecords (user_id, type, targetType, targetId, product, date, nextDue, observations, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [userId, type, targetType, targetId, product, date, nextDue, observations]);
      
      console.log('✅ HealthService.createHealthRecord - Résultat:', result.insertId);
      
      // Récupérer l'enregistrement créé avec toutes les données
      const newRecord = await this.getHealthRecordById(result.insertId);
      return newRecord;
    } catch (error) {
      console.error('❌ HealthService.createHealthRecord - Erreur:', error.message);
      throw new Error(`Erreur lors de la création de l'enregistrement de santé: ${error.message}`);
    }
  }

  // Mettre à jour un enregistrement de santé
  async updateHealthRecord(id, healthData) {
    try {
      console.log('🔍 Mise à jour health record - ID:', id, 'Data:', healthData);
      
      // Construire dynamiquement la requête UPDATE
      const fields = [];
      const values = [];
      
      if (healthData.type !== undefined) {
        fields.push('type = ?');
        values.push(healthData.type);
      }
      
      if (healthData.targetType !== undefined) {
        fields.push('targetType = ?');
        values.push(healthData.targetType);
      }
      
      if (healthData.targetId !== undefined) {
        fields.push('targetId = ?');
        values.push(healthData.targetId);
      }
      
      if (healthData.product !== undefined) {
        fields.push('product = ?');
        values.push(healthData.product);
      }
      
      if (healthData.date !== undefined) {
        fields.push('date = ?');
        values.push(healthData.date);
      }
      
      if (healthData.nextDue !== undefined) {
        fields.push('nextDue = ?');
        values.push(healthData.nextDue);
      }
      
      if (healthData.observations !== undefined) {
        fields.push('observations = ?');
        values.push(healthData.observations);
      }
      
      if (fields.length === 0) {
        throw new Error('Aucun champ à mettre à jour');
      }
      
      fields.push('updated_at = NOW()');
      values.push(id);
      
      const sql = `UPDATE healthRecords SET ${fields.join(', ')} WHERE id = ?`;
      console.log('🔍 SQL:', sql);
      console.log('🔍 Values:', values);
      
      const result = await executeQuery(sql, values);
      
      if (result.affectedRows === 0) {
        throw new Error('Enregistrement de santé non trouvé');
      }
      
      // Récupérer l'enregistrement de santé mis à jour
      const updatedHealthRecord = await this.getHealthRecordById(id);
      return updatedHealthRecord;
    } catch (error) {
      console.error('❌ Erreur updateHealthRecord:', error);
      throw new Error(`Erreur lors de la mise à jour de l'enregistrement de santé: ${error.message}`);
    }
  }

  // Supprimer un enregistrement de santé
  async deleteHealthRecord(id) {
    try {
      const result = await executeQuery('DELETE FROM healthRecords WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Enregistrement de santé non trouvé');
      }
      
      return { message: 'Enregistrement de santé supprimé avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'enregistrement de santé: ${error.message}`);
    }
  }

  // Récupérer les enregistrements de santé par cible
  async getHealthRecordsByTarget(targetType, targetId) {
    try {
      const rows = await executeQuery(`
        SELECT 
          h.id,
          h.type,
          h.targetType,
          h.targetId,
          h.product,
          h.date,
          h.nextDue,
          h.observations,
          h.created_at,
          h.updated_at,
          CASE 
            WHEN h.targetType = 'couple' THEN c.nestNumber
            WHEN h.targetType = 'pigeonneau' THEN CONCAT('Pigeonneau #', p.id)
            ELSE 'Inconnu'
          END as targetName
        FROM healthRecords h
        LEFT JOIN couples c ON h.targetType = 'couple' AND h.targetId = c.id
        LEFT JOIN pigeonneaux p ON h.targetType = 'pigeonneau' AND h.targetId = p.id
        WHERE h.targetType = ? AND h.targetId = ?
        ORDER BY h.created_at DESC
      `, [targetType, targetId]);
      
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des enregistrements de santé: ${error.message}`);
    }
  }

  // Compter les enregistrements de santé par type
  async getHealthStats() {
    try {
      const rows = await executeQuery(`
        SELECT 
          type,
          COUNT(*) as count
        FROM healthRecords
        GROUP BY type
      `);
      
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  // Récupérer les enregistrements de santé par type
  async getHealthRecordsByType(type) {
    try {
      const rows = await executeQuery(`
        SELECT 
          h.id,
          h.type,
          h.targetType,
          h.targetId,
          h.product,
          h.date,
          h.nextDue,
          h.observations,
          h.created_at,
          h.updated_at,
          CASE 
            WHEN h.targetType = 'couple' THEN c.nestNumber
            WHEN h.targetType = 'pigeonneau' THEN CONCAT('Pigeonneau #', p.id)
            ELSE 'Inconnu'
          END as targetName
        FROM healthRecords h
        LEFT JOIN couples c ON h.targetType = 'couple' AND h.targetId = c.id
        LEFT JOIN pigeonneaux p ON h.targetType = 'pigeonneau' AND h.targetId = p.id
        WHERE h.type = ?
        ORDER BY h.created_at DESC
      `, [type]);
      
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des enregistrements de santé: ${error.message}`);
    }
  }

  // Récupérer les enregistrements de santé récents
  async getRecentHealthRecords(limit = 10) {
    try {
      const rows = await executeQuery(`
        SELECT 
          h.id,
          h.type,
          h.targetType,
          h.targetId,
          h.product,
          h.date,
          h.nextDue,
          h.observations,
          h.created_at,
          h.updated_at,
          CASE 
            WHEN h.targetType = 'couple' THEN c.nestNumber
            WHEN h.targetType = 'pigeonneau' THEN CONCAT('Pigeonneau #', p.id)
            ELSE 'Inconnu'
          END as targetName
        FROM healthRecords h
        LEFT JOIN couples c ON h.targetType = 'couple' AND h.targetId = c.id
        LEFT JOIN pigeonneaux p ON h.targetType = 'pigeonneau' AND h.targetId = p.id
        ORDER BY h.created_at DESC
        LIMIT ?
      `, [limit]);
      
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des enregistrements récents: ${error.message}`);
    }
  }

  // Récupérer les enregistrements de santé à venir (nextDue)
  async getUpcomingHealthRecords() {
    try {
      const rows = await executeQuery(`
        SELECT 
          h.id,
          h.type,
          h.targetType,
          h.targetId,
          h.product,
          h.date,
          h.nextDue,
          h.observations,
          h.created_at,
          h.updated_at,
          CASE 
            WHEN h.targetType = 'couple' THEN c.nestNumber
            WHEN h.targetType = 'pigeonneau' THEN CONCAT('Pigeonneau #', p.id)
            ELSE 'Inconnu'
          END as targetName
        FROM healthRecords h
        LEFT JOIN couples c ON h.targetType = 'couple' AND h.targetId = c.id
        LEFT JOIN pigeonneaux p ON h.targetType = 'pigeonneau' AND h.targetId = p.id
        WHERE h.nextDue IS NOT NULL AND h.nextDue >= CURDATE()
        ORDER BY h.nextDue ASC
      `);
      
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des enregistrements à venir: ${error.message}`);
    }
  }
}

module.exports = new HealthService(); 