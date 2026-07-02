import { query, run, saveStore } from '../db/DatabaseService';
import { Couple } from '../types';

export async function getCouples(): Promise<Couple[]> {
  return query<Couple>('SELECT * FROM couples ORDER BY CAST(nest_number AS INTEGER), nest_number');
}

export async function createCouple(c: Omit<Couple, 'id'>): Promise<number> {
  const { lastId } = await run(
    `INSERT INTO couples (nest_number, male_ring, female_ring, race, formation_date, status, observations)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [c.nest_number, c.male_ring || null, c.female_ring || null, c.race || null,
     c.formation_date || null, c.status, c.observations || null],
  );
  await saveStore();
  return lastId;
}

export async function updateCouple(id: number, c: Partial<Couple>): Promise<void> {
  await run(
    `UPDATE couples SET nest_number=?, male_ring=?, female_ring=?, race=?,
     formation_date=?, status=?, observations=?, updated_at=datetime('now'), synced=0
     WHERE id=?`,
    [c.nest_number, c.male_ring || null, c.female_ring || null, c.race || null,
     c.formation_date || null, c.status, c.observations || null, id],
  );
  await saveStore();
}

export async function deleteCouple(id: number): Promise<void> {
  await run('DELETE FROM couples WHERE id=?', [id]);
  await saveStore();
}
