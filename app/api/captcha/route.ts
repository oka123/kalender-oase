import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, RATE_LIMIT_RULES } from '@/lib/rate-limit';
import {
  CAPTCHA_COOKIE_NAME,
  generateCaptchaCookieValue,
  validateCaptchaCookieValue,
  verifyTurnstileToken,
} from '@/lib/captcha';

export async function GET(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`captcha:${clientIp}`, RATE_LIMIT_RULES.CAPTCHA);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan konfigurasi CAPTCHA. Silakan tunggu beberapa saat.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds || 30),
          },
        }
      );
    }

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

    // Cek apakah klien ini sudah pernah terverifikasi sebelumnya
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader
        .split(';')
        .map((c) => c.trim().split('='))
        .filter(([k]) => Boolean(k))
        .map(([k, ...v]) => [k, decodeURIComponent(v.join('='))])
    );
    const currentCookie = cookies[CAPTCHA_COOKIE_NAME];
    const isVerified = Boolean(currentCookie && validateCaptchaCookieValue(currentCookie, clientIp));

    const response = NextResponse.json({
      siteKey,
      isConfigured: Boolean(siteKey),
      isVerified,
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat konfigurasi CAPTCHA';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`captcha:${clientIp}`, RATE_LIMIT_RULES.CAPTCHA);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan verifikasi. Silakan coba lagi dalam ${rateLimit.retryAfterSeconds} detik.`,
          success: false,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds || 30),
          },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const token = body?.token;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token Turnstile tidak valid atau tidak disertakan.', success: false },
        { status: 400 }
      );
    }

    // Verifikasi token ke Cloudflare Turnstile
    const verifyResult = await verifyTurnstileToken(token, clientIp);
    if (!verifyResult.valid) {
      return NextResponse.json(
        {
          error: verifyResult.error || 'Verifikasi keamanan bot gagal.',
          success: false,
        },
        { status: 400 }
      );
    }

    // Buat signed cookie yang menandai verifikasi berhasil (berlaku 2 jam)
    const cookieValue = generateCaptchaCookieValue(clientIp);
    const response = NextResponse.json({
      success: true,
      message: 'Verifikasi keamanan Cloudflare Turnstile berhasil.',
    });

    // Pasang HttpOnly cookie
    response.cookies.set(CAPTCHA_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 2 * 60 * 60, // 2 Jam
    });

    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses verifikasi CAPTCHA';
    return NextResponse.json({ error: message, success: false }, { status: 500 });
  }
}
