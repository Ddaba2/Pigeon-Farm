const { executeQuery } = require('../config/database');

class HealthService {
  // Récupérer tous les enregistrements de santé
  async getAllHealthRecords() {
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
      `);
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
  async createHealthRecord(healthData) {
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
      
      const result = await executeQuery(`
        INSERT INTO healthRecords (type, targetType, targetId, product, date, nextDue, observations, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [type, targetType, targetId, product, date, nextDue, observations]);
      
      return { id: result.insertId, ...healthData };
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'enregistrement de santé: ${error.message}`);
    }
  }

  // Mettre à jour un enregistrement de santé
  async updateHealthRecord(id, healthData) {
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
      
      const result = await executeQuery(`
        UPDATE healthRecords 
        SET type = ?, targetType = ?, targetId = ?, product = ?, date = ?, nextDue = ?, observations = ?, updated_at = NOW()
        WHERE id = ?
      `, [type, targetType, targetId, product, date, nextDue, observations, id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Enregistrement de santé non trouvé');
      }
      
      return { id, ...healthData };
    } catch (error) {
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