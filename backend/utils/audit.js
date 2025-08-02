import pool from '../config/database.js';

export async function logAudit({ entity, entityId, action, userId, details }) {
  await pool.query(
    'INSERT INTO audit_logs (entity, entityId, action, userId, details) VALUES (?, ?, ?, ?, ?)',
    [entity, entityId, action, userId, JSON.stringify(details)]
  );
} 