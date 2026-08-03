import { query, run, saveStore } from '../db/DatabaseService';
import { Expense } from '../types';

export async function getExpenses(): Promise<Expense[]> {
  return query<Expense>('SELECT * FROM expenses ORDER BY date DESC');
}

export async function getExpensesByPeriod(from: string, to: string): Promise<Expense[]> {
  return query<Expense>(
    'SELECT * FROM expenses WHERE date >= ? AND date <= ? ORDER BY date DESC',
    [from, to],
  );
}

export async function getTotalExpenses(): Promise<number> {
  const rows = await query<{ total: number }>(
    'SELECT COALESCE(SUM(amount), 0) as total FROM expenses',
  );
  return rows[0]?.total ?? 0;
}

export async function createExpense(e: Omit<Expense, 'id'>): Promise<number> {
  const { lastId } = await run(
    `INSERT INTO expenses (category, date, amount, description, notes)
     VALUES (?, ?, ?, ?, ?)`,
    [e.category, e.date, e.amount, e.description || null, e.notes || null],
  );
  await saveStore();
  return lastId;
}

export async function updateExpense(id: number, e: Partial<Expense>): Promise<void> {
  const existing = await query<Expense>('SELECT * FROM expenses WHERE id = ?', [id]);
  const base = existing[0] ?? {} as Expense;
  await run(
    `UPDATE expenses SET category=?, date=?, amount=?, description=?, notes=?, synced=0
     WHERE id=?`,
    [
      e.category    ?? base.category,
      e.date        ?? base.date,
      e.amount      ?? base.amount,
      e.description ?? base.description ?? null,
      e.notes       ?? base.notes       ?? null,
      id,
    ],
  );
  await saveStore();
}

export async function deleteExpense(id: number): Promise<void> {
  await run('DELETE FROM expenses WHERE id = ?', [id]);
  await saveStore();
}
