import { query, run, saveStore } from '../db/DatabaseService';
import { HealthRecord } from '../types';

export async function getHealthRecords(): Promise<HealthRecord[]> {
  return query<HealthRecord>('SELECT * FROM health_records ORDER BY date DESC');
}

export async function getUpcomingDue(): Promise<HealthRecord[]> {
  const inTwoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
  return query<HealthRecord>(
    'SELECT * FROM health_records WHERE next_due IS NOT NULL AND next_due <= ? ORDER BY next_due ASC',
    [inTwoWeeks],
  );
}

export async function createHealthRecord(h: Omit<HealthRecord, 'id'>): Promise<number> {
  const { lastId } = await run(
    `INSERT INTO health_records (type, target_type, target_id, date, product, dose, next_due, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [h.type, h.target_type || 'tous', h.target_id || null, h.date,
     h.product || null, h.dose || null, h.next_due || null, h.notes || null],
  );
  await saveStore();
  return lastId;
}

export async function updateHealthRecord(id: number, h: Partial<HealthRecord>): Promise<void> {
  await run(
    `UPDATE health_records SET type=?, target_type=?, date=?, product=?, dose=?, next_due=?, notes=?, synced=0
     WHERE id=?`,
    [h.type, h.target_type || 'tous', h.date, h.product || null,
     h.dose || null, h.next_due || null, h.notes || null, id],
  );
  await saveStore();
}

export async function deleteHealthRecord(id: number): Promise<void> {
  await run('DELETE FROM health_records WHERE id=?', [id]);
  await saveStore();
}
