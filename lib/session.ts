import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import type { GoogleSessionData } from '../types/calendar.ts';

const COOKIE_NAME = 'oase_google_session';
const ALGORITHM = 'aes-256-gcm';

// Dapatkan encryption key 32-byte dari environment secret
function getEncryptionKey(): Buffer {
  const secret = process.env.SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || 'default-kalender-oase-secret-fallback-key-32b';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Enkripsi data session menjadi string base64url yang aman
 */
export function encryptSession(data: GoogleSessionData): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const jsonString = JSON.stringify(data);
  const encrypted = Buffer.concat([cipher.update(jsonString, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Format: iv:tag:encrypted (semua hex)
  return `${iv.toString('hex')}.${tag.toString('hex')}.${encrypted.toString('hex')}`;
}

/**
 * Dekripsi string session kembali menjadi GoogleSessionData
 */
export function decryptSession(sessionToken: string): GoogleSessionData | null {
  try {
    const parts = sessionToken.split('.');
    if (parts.length !== 3) return null;

    const [ivHex, tagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8')) as GoogleSessionData;
  } catch {
    return null;
  }
}

/**
 * Simpan data session ke HTTP-only cookie
 */
export async function saveSession(data: GoogleSessionData): Promise<void> {
  const encrypted = encryptSession(data);
  const cookieStore = await cookies();
  
  // Berlaku 30 hari jika memiliki refresh_token
  const maxAge = 30 * 24 * 60 * 60;

  cookieStore.set(COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
}

/**
 * Ambil data session dari HTTP-only cookie
 */
export async function getSession(): Promise<GoogleSessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) return null;

    return decryptSession(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * Hapus data session cookie
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
