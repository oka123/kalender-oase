import { NextResponse } from 'next/server';
import { fetchAndParseIcal } from '@/lib/ical';

export async function GET(request: Request) {
  try {
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
