const APP_SALT = 'pigeon-farm-mali-v1';

export async function hashPIN(pin: string, userSalt: string): Promise<string> {
  const data = new TextEncoder().encode(`${pin}:${userSalt}:${APP_SALT}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPIN(pin: string, userSalt: string, storedHash: string): Promise<boolean> {
  const hash = await hashPIN(pin, userSalt);
  return hash === storedHash;
}

// Salt unique par utilisateur (id + date de création)
export function buildUserSalt(userId: number, createdAt: string): string {
  return `${userId}:${createdAt}`;
}
