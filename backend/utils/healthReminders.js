import pool from '../config/database.js';

export async function generateHealthReminders(daysAhead = 7) {
  // Chercher les healthRecords avec nextDue dans les X prochains jours
  const [records] = await pool.query(
    `SELECT * FROM healthRecords WHERE nextDue IS NOT NULL AND nextDue <= DATE_ADD(CURDATE(), INTERVAL ? DAY)`,
    [daysAhead]
  );
  let created = 0;
  for (const record of records) {
    // Vérifier si une notification existe déjà pour ce rappel
    const [existing] = await pool.query(
      'SELECT id FROM notifications WHERE type = ? AND entityType = ? AND entityId = ? AND message LIKE ? AND isRead = 0',
      [
        'rappel_sanitaire',
        'healthRecords',
        record.id,
        `%${record.product}%`
      ]
    );
    if (existing.length === 0) {
      // Créer la notification
      const message = `Rappel sanitaire : ${record.type} (${record.product}) prévu le ${new Date(record.nextDue).toLocaleDateString('fr-FR')}`;
      await pool.query(
        'INSERT INTO notifications (type, message, entityType, entityId) VALUES (?, ?, ?, ?)',
        ['rappel_sanitaire', message, 'healthRecords', record.id]
      );
      created++;
    }
  }
  return created;
} 