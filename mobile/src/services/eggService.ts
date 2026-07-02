import { query, run, saveStore } from '../db/DatabaseService';
import { Egg } from '../types';

export async function getEggs(): Promise<Egg[]> {
  return query<Egg>(
    `SELECT e.*, c.nest_number as couple_nest
     FROM eggs e LEFT JOIN couples c ON e.couple_id = c.id
     ORDER BY e.created_at DESC`,
  );
}

export async function createEgg(e: Omit<Egg, 'id'>): Promise<number> {
  const { lastId } = await run(
    `INSERT INTO eggs (couple_id, egg1_date, egg2_date, hatch_date, success1, success2, observations)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [e.couple_id, e.egg1_date || null, e.egg2_date || null, e.hatch_date || null,
     e.success1 ? 1 : 0, e.success2 ? 1 : 0, e.observations || null],
  );
  await saveStore();
  return lastId;
}

export async function updateEgg(id: number, e: Partial<Egg>): Promise<void> {
  await run(
    `UPDATE eggs SET couple_id=?, egg1_date=?, egg2_date=?, hatch_date=?,
     success1=?, success2=?, observations=?, synced=0 WHERE id=?`,
    [e.couple_id, e.egg1_date || null, e.egg2_date || null, e.hatch_date || null,
     e.success1 ? 1 : 0, e.success2 ? 1 : 0, e.observations || null, id],
  );
  await saveStore();
}

export async function deleteEgg(id: number): Promise<void> {
  await run('DELETE FROM eggs WHERE id=?', [id]);
  await saveStore();
}
