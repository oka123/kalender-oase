import { NextResponse } from 'next/server';
import { fetchAndParseIcal } from '@/lib/ical';
import { checkRateLimit, getClientIp, RATE_LIMIT_RULES } from '@/lib/rate-limit';

export async function GET(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`preview:${clientIp}`, RATE_LIMIT_RULES.PREVIEW);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan pratinjau. Silakan coba lagi dalam ${rateLimit.retryAfterSeconds} detik.` },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds || 30),
          },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const customUrl = searchParams.get('url') || undefined;

    const events = await fetchAndParseIcal(customUrl);
    return NextResponse.json({
      events,
      total: events.length,
      hasConfiguredUrl: Boolean(process.env.OASE_ICAL_URL),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat jadwal OASE';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
