import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, RATE_LIMIT_RULES } from '@/lib/rate-limit';

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

    const response = NextResponse.json({
      siteKey,
      isConfigured: Boolean(siteKey),
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat konfigurasi CAPTCHA';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
