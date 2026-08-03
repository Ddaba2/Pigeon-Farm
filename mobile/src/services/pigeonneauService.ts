import { query, run, saveStore } from '../db/DatabaseService';
import { Pigeonneau } from '../types';

export async function getPigeonneaux(): Promise<Pigeonneau[]> {
  return query<Pigeonneau>(
    `SELECT p.*, c.nest_number as couple_nest
     FROM pigeonneaux p LEFT JOIN couples c ON p.couple_id = c.id
     ORDER BY p.created_at DESC`,
  );
}

export async function createPigeonneau(p: Omit<Pigeonneau, 'id'> & { photo?: string }): Promise<number> {
  const { lastId } = await run(
    `INSERT INTO pigeonneaux
     (couple_id, egg_record_id, birth_date, sex, weight, ring_number, status, weaning_date, observations, photo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [p.couple_id, p.egg_record_id || null, p.birth_date || null, p.sex || 'inconnu',
     p.weight || null, p.ring_number || null, p.status, p.weaning_date || null,
     p.observations || null, (p as any).photo || null],
  );
  await saveStore();
  return lastId;
}

export async function updatePigeonneau(id: number, p: Partial<Pigeonneau> & { photo?: string }): Promise<void> {
  await run(
    `UPDATE pigeonneaux SET couple_id=?, birth_date=?, sex=?, weight=?, ring_number=?,
     status=?, weaning_date=?, sale_price=?, sale_date=?, buyer_name=?, observations=?, photo=?, synced=0
     WHERE id=?`,
    [p.couple_id, p.birth_date || null, p.sex || 'inconnu', p.weight || null, p.ring_number || null,
     p.status, p.weaning_date || null, p.sale_price || null, p.sale_date || null,
     p.buyer_name || null, p.observations || null, (p as any).photo || null, id],
  );
  await saveStore();
}

export async function deletePigeonneau(id: number): Promise<void> {
  // Supprimer les données liées avant le pigeonneau lui-même (pas de FK en cascade dans le schéma)
  await run('DELETE FROM health_records WHERE target_type = ? AND target_id = ?', ['pigeonneau', id]);
  await run('DELETE FROM sales WHERE target_type IN (?, ?, ?) AND target_id = ?', ['pigeonneau', 'male', 'femelle', String(id)]);
  await run('DELETE FROM pigeonneaux WHERE id=?', [id]);
  await saveStore();
}
