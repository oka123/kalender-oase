import { NextResponse } from 'next/server';
import { syncOaseToGoogleCalendar } from '@/lib/sync';
import type { SyncOptions } from '@/types/calendar';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const options: SyncOptions = {
      calendarId: body.calendarId || 'primary',
      createDedicatedCalendar: Boolean(body.createDedicatedCalendar),
      reminderMinutes: Array.isArray(body.reminderMinutes) ? body.reminderMinutes : [1440, 120],
      customIcalUrl: body.customIcalUrl || undefined,
    };

    const result = await syncOaseToGoogleCalendar(options);

    return NextResponse.json({
      success: true,
      message: `Sinkronisasi selesai! ${result.created} dibuat, ${result.updated} diperbarui, ${result.skipped} dilewati.`,
      result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat melakukan sinkronisasi kalender.';
    return NextResponse.json({ error: message, success: false }, { status: 500 });
  }
}
