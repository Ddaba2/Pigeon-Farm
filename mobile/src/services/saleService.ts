import { query, run, saveStore } from '../db/DatabaseService';
import { Sale } from '../types';

export async function getSales(): Promise<Sale[]> {
  return query<Sale>('SELECT * FROM sales ORDER BY date DESC');
}

export async function createSale(s: Omit<Sale, 'id' | 'amount'>): Promise<number> {
  const amount = s.quantity * s.unit_price;
  const { lastId } = await run(
    `INSERT INTO sales (target_type, target_id, date, quantity, unit_price, amount, buyer_name, payment_method, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [s.target_type, s.target_id || null, s.date, s.quantity, s.unit_price, amount,
     s.buyer_name || null, s.payment_method, s.notes || null],
  );
  // Marquer le pigeonneau comme vendu si la vente lui est liée
  if (s.target_id && ['pigeonneau', 'male', 'femelle'].includes(s.target_type)) {
    await run(
      `UPDATE pigeonneaux SET status = 'vendu', sale_price = ?, sale_date = ?, buyer_name = ?, synced = 0 WHERE id = ?`,
      [amount, s.date, s.buyer_name || null, s.target_id],
    );
  }
  await saveStore();
  return lastId;
}

export async function updateSale(id: number, s: Partial<Sale>): Promise<void> {
  // Récupérer les valeurs existantes pour éviter d'écraser les champs non fournis
  const existing = await query<Sale>('SELECT * FROM sales WHERE id = ?', [id]);
  const base = existing[0] ?? {} as Sale;
  const quantity   = s.quantity   ?? base.quantity   ?? 0;
  const unit_price = s.unit_price ?? base.unit_price ?? 0;
  const amount = quantity * unit_price;
  const target_type = s.target_type ?? base.target_type;
  const target_id   = s.target_id   ?? base.target_id ?? null;
  const buyer_name  = s.buyer_name  ?? base.buyer_name ?? null;
  const date        = s.date        ?? base.date;
  await run(
    `UPDATE sales SET target_type=?, target_id=?, date=?, quantity=?, unit_price=?, amount=?,
     buyer_name=?, payment_method=?, notes=?, synced=0 WHERE id=?`,
    [
      target_type,
      target_id,
      date,
      quantity,
      unit_price,
      amount,
      buyer_name,
      s.payment_method ?? base.payment_method,
      s.notes          ?? base.notes        ?? null,
      id,
    ],
  );
  // Garder le pigeonneau lié cohérent avec la vente (même logique qu'à la création)
  if (target_id && ['pigeonneau', 'male', 'femelle'].includes(target_type)) {
    await run(
      `UPDATE pigeonneaux SET status = 'vendu', sale_price = ?, sale_date = ?, buyer_name = ?, synced = 0 WHERE id = ?`,
      [amount, date, buyer_name, target_id],
    );
  }
  await saveStore();
}

export async function deleteSale(id: number): Promise<void> {
  await run('DELETE FROM sales WHERE id=?', [id]);
  await saveStore();
}
