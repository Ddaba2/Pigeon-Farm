import { query, run, saveStore } from '../db/DatabaseService';

export interface SyncResult {
  synced: number;
  errors: string[];
}

const TABLES = [
  { name: 'couples',        endpoint: 'mobile/couples' },
  { name: 'eggs',           endpoint: 'mobile/eggs' },
  { name: 'pigeonneaux',    endpoint: 'mobile/pigeonneaux' },
  { name: 'health_records', endpoint: 'mobile/health' },
  { name: 'sales',          endpoint: 'mobile/sales' },
];

export function getSyncApiUrl(): string {
  return localStorage.getItem('sync_api_url') || '';
}

export function setSyncApiUrl(url: string): void {
  localStorage.setItem('sync_api_url', url);
}

export function getSyncToken(): string {
  return localStorage.getItem('sync_token') || '';
}

export function setSyncToken(token: string): void {
  localStorage.setItem('sync_token', token);
}

async function syncTable(
  tableName: string,
  endpoint: string,
  baseUrl: string,
  token: string,
): Promise<SyncResult> {
  const rows = await query<Record<string, unknown>>(`SELECT * FROM ${tableName} WHERE synced = 0`);
  let synced = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const res = await fetch(`${baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(row),
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) {
        const body = await res.json().catch(() => ({}));
        await run(`UPDATE ${tableName} SET synced=1, server_id=? WHERE id=?`, [body.id ?? null, row.id]);
        synced++;
      } else {
        errors.push(`${tableName}#${row.id}: ${res.status}`);
      }
    } catch {
      errors.push(`${tableName}#${row.id}: hors ligne`);
    }
  }

  return { synced, errors };
}

export async function syncAll(): Promise<SyncResult> {
  const baseUrl = getSyncApiUrl();
  const token = getSyncToken();

  if (!baseUrl) return { synced: 0, errors: ['URL du serveur non configurée'] };

  let totalSynced = 0;
  const allErrors: string[] = [];

  for (const { name, endpoint } of TABLES) {
    const { synced, errors } = await syncTable(name, endpoint, baseUrl, token);
    totalSynced += synced;
    allErrors.push(...errors);
  }

  if (totalSynced > 0) await saveStore();
  return { synced: totalSynced, errors: allErrors };
}

export async function getPendingCount(): Promise<number> {
  let total = 0;
  for (const { name } of TABLES) {
    const rows = await query<{ count: number }>(`SELECT COUNT(*) as count FROM ${name} WHERE synced = 0`);
    total += rows[0]?.count ?? 0;
  }
  return total;
}
