const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_PREFIX = 'pbkdf2:';
const SHA256_PREFIX = 'sha256:';

// Hache un PIN avec PBKDF2 (résistant au brute-force sur 4 chiffres)
export async function hashPIN(pin: string, userSalt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(userSalt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  );
  const hex = Array.from(new Uint8Array(bits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${PBKDF2_PREFIX}${hex}`;
}

// Hash SHA-256 legacy (utilisé uniquement pour la migration)
async function hashPIN_SHA256_legacy(pin: string, userSalt: string): Promise<string> {
  const APP_SALT = 'pigeon-farm-mali-v1';
  const data = new TextEncoder().encode(`${pin}:${userSalt}:${APP_SALT}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Vérifie le PIN et migre automatiquement SHA-256 → PBKDF2 si nécessaire
// Retourne { valid: boolean, newHash?: string } — si newHash est défini, l'appelant doit l'enregistrer
export async function verifyPIN(
  pin: string,
  userSalt: string,
  storedHash: string,
): Promise<{ valid: boolean; newHash?: string }> {
  if (storedHash.startsWith(PBKDF2_PREFIX)) {
    const expected = await hashPIN(pin, userSalt);
    return { valid: expected === storedHash };
  }

  // Ancien format SHA-256 (sans préfixe ou avec préfixe sha256:)
  const rawHash = storedHash.startsWith(SHA256_PREFIX)
    ? storedHash.slice(SHA256_PREFIX.length)
    : storedHash;
  const legacyHash = await hashPIN_SHA256_legacy(pin, userSalt);
  if (legacyHash === rawHash) {
    // Migration transparente vers PBKDF2
    const newHash = await hashPIN(pin, userSalt);
    return { valid: true, newHash };
  }
  return { valid: false };
}

// Salt unique par utilisateur (id + date de création)
export function buildUserSalt(userId: number, createdAt: string): string {
  return `${userId}:${createdAt}`;
}
