/**
 * Modul Verifikasi Keamanan Anti-Bot & Anti-DDoS menggunakan Cloudflare Turnstile
 */

export interface TurnstileVerifyResult {
  valid: boolean;
  error?: string;
  hostname?: string;
  challengeTs?: string;
}

/**
 * Validasi token Cloudflare Turnstile ke endpoint siteverify resmi Cloudflare
 */
export async function verifyTurnstileToken(
  token?: string,
  remoteip?: string
): Promise<TurnstileVerifyResult> {
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return {
      valid: false,
      error: 'Token verifikasi Cloudflare Turnstile tidak ditemukan.',
    };
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    // Jika secret key belum diatur sama sekali di environment
    return {
      valid: false,
      error: 'Konfigurasi TURNSTILE_SECRET_KEY belum diatur pada server.',
    };
  }

  try {
    const formData = new URLSearchParams({
      secret: secretKey,
      response: token.trim(),
    });

    if (remoteip) {
      formData.append('remoteip', remoteip);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
      signal: AbortSignal.timeout(8000), // Timeout 8 detik demi mencegah blocking
    });

    if (!response.ok) {
      return {
        valid: false,
        error: `Server Cloudflare merespons dengan status HTTP ${response.status}`,
      };
    }

    const data = (await response.json()) as {
      success: boolean;
      'error-codes'?: string[];
      challenge_ts?: string;
      hostname?: string;
    };

    if (data.success) {
      return {
        valid: true,
        hostname: data.hostname,
        challengeTs: data.challenge_ts,
      };
    }

    const errorCodes = data['error-codes']?.join(', ') || 'invalid-input-response';
    return {
      valid: false,
      error: `Verifikasi Cloudflare Turnstile gagal (${errorCodes}). Silakan coba lagi.`,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Koneksi ke verifikasi Cloudflare gagal.';
    return {
      valid: false,
      error: `Gagal memverifikasi ke server Cloudflare: ${msg}`,
    };
  }
}
