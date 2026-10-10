import { NextResponse } from 'next/server';
import { syncOaseToGoogleCalendar } from '@/lib/sync';
import { checkRateLimit, getClientIp, RATE_LIMIT_RULES } from '@/lib/rate-limit';
import { isCaptchaRequestVerified } from '@/lib/captcha';
import type { SyncOptions } from '@/types/calendar';

export async function POST(request: Request) {
  try {
    // 1. Proteksi DDoS: Batasi ukuran payload request body (maks 100 KB)
    const contentLength = Number(request.headers.get('content-length') || '0');
    if (contentLength > 100 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran payload permintaan terlalu besar.', success: false },
        { status: 413 }
      );
    }

    // 2. Proteksi SEC-06: In-memory Rate Limiting per IP Klien
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`sync:${clientIp}`, RATE_LIMIT_RULES.SYNC);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Terlalu banyak permintaan sinkronisasi dari IP Anda. Silakan coba lagi dalam ${rateLimit.retryAfterSeconds} detik.`,
          success: false,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds || 60),
          },
        }
      );
    }

    const body = await request.json().catch(() => ({}));

    // 3. Verifikasi Cloudflare Turnstile (Anti-Bot & Anti-DDoS Otomatis)
    const captchaResult = await isCaptchaRequestVerified(
      request,
      clientIp,
      body.turnstileToken
    );

    if (!captchaResult.valid) {
      return NextResponse.json(
        { error: captchaResult.error || 'Verifikasi keamanan bot gagal.', success: false },
        { status: 403 }
      );
    }

    const options: SyncOptions = {
      calendarId: body.calendarId || 'primary',
      createDedicatedCalendar: Boolean(body.createDedicatedCalendar),
      reminderMinutes: Array.isArray(body.reminderMinutes) ? body.reminderMinutes : [1440, 120, 30],
      pendingTasks: Array.isArray(body.pendingTasks) ? body.pendingTasks : undefined,
      oaseCredentials:
        body.oaseCredentials ||
        (body.username && body.password
          ? { username: body.username, password: body.password }
          : undefined),
    };

    const result = await syncOaseToGoogleCalendar(options);

    const completedMsg = result.completed ? `, ${result.completed} selesai` : '';
    return NextResponse.json({
      success: true,
      message: `Sinkronisasi selesai! ${result.created} dibuat, ${result.updated} diperbarui${completedMsg}, ${result.skipped} dilewati.`,
      result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat melakukan sinkronisasi kalender.';
    return NextResponse.json({ error: message, success: false }, { status: 500 });
  }
}
