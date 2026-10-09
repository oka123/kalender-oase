/**
 * In-memory sliding window Rate Limiter untuk mitigasi DDoS dan brute-force API
 */

interface RateLimitRecord {
  timestamps: number[];
  blockedUntil?: number;
}

interface RateLimitConfig {
  maxRequests: number; // Jumlah maksimal permintaan dalam window
  windowMs: number; // Durasi window dalam milidetik (misal 60.000 ms = 1 menit)
  blockDurationMs?: number; // Durasi pemblokiran jika batas terlampaui (opsional)
}

// In-memory store per prefix/route
const ipStore = new Map<string, RateLimitRecord>();

// Bersihkan entri lama setiap 5 menit agar memori tetap hemat dan aman
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  lastCleanup = now;
  for (const [key, record] of ipStore.entries()) {
    // Buang timestamp yang sudah di luar window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    const isBlocked = record.blockedUntil && record.blockedUntil > now;
    if (record.timestamps.length === 0 && !isBlocked) {
      ipStore.delete(key);
    }
  }
}

/**
 * Ekstraksi alamat IP klien dari request headers
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;

  // Header dari Cloudflare
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  // Header dari proxy / load balancer (Vercel, AWS, Nginx)
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0];
    if (firstIp) return firstIp.trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  retryAfterSeconds?: number;
}

/**
 * Periksa apakah request dari klien tertentu melampaui batas rate limit
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  cleanupExpiredEntries(config.windowMs);

  let record = ipStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    ipStore.set(identifier, record);
  }

  // Jika sedang diblokir sementara
  if (record.blockedUntil && record.blockedUntil > now) {
    const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetSeconds: retryAfter,
      retryAfterSeconds: retryAfter,
    };
  }

  // Buang timestamp yang lebih tua dari windowMs
  record.timestamps = record.timestamps.filter(
    (ts) => now - ts < config.windowMs,
  );

  // Periksa apakah batas terlampaui
  if (record.timestamps.length >= config.maxRequests) {
    if (config.blockDurationMs) {
      record.blockedUntil = now + config.blockDurationMs;
    }

    const oldestTs = record.timestamps[0] || now;
    const resetSeconds = Math.ceil((oldestTs + config.windowMs - now) / 1000);

    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetSeconds: Math.max(1, resetSeconds),
      retryAfterSeconds: Math.max(1, resetSeconds),
    };
  }

  // Catat request saat ini
  record.timestamps.push(now);

  const remaining = Math.max(0, config.maxRequests - record.timestamps.length);
  const oldestTs = record.timestamps[0] || now;
  const resetSeconds = Math.max(
    1,
    Math.ceil((oldestTs + config.windowMs - now) / 1000),
  );

  return {
    success: true,
    limit: config.maxRequests,
    remaining,
    resetSeconds,
  };
}

/**
 * Aturan Rate Limiting bawaan untuk masing-masing rute
 */
export const RATE_LIMIT_RULES = {
  // Sinkronisasi kalender: Maks 60x per menit per IP (mencegah kehabisan kuota Google API & spamming)
  SYNC: {
    maxRequests: 60,
    windowMs: 60 * 1000,
    blockDurationMs: 60 * 1000,
  },
  // Preview iCal: Maks 60x per menit per IP
  PREVIEW: {
    maxRequests: 60,
    windowMs: 60 * 1000,
    blockDurationMs: 30 * 1000,
  },
  // OAuth URL & Auth endpoints: Maks 60x per menit per IP
  AUTH: {
    maxRequests: 60,
    windowMs: 60 * 1000,
  },
  // Captcha generation: Maks 60x per menit per IP
  CAPTCHA: {
    maxRequests: 60,
    windowMs: 60 * 1000,
  },
} as const;
