import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getAuthenticatedOAuth2Client } from '@/lib/google';
import type { GoogleCalendarItem } from '@/types/calendar';

export async function GET() {
  try {
    const oauth2Client = await getAuthenticatedOAuth2Client();
    if (!oauth2Client) {
      return NextResponse.json(
        { error: 'Belum terautentikasi dengan Google Calendar' },
        { status: 401 }
      );
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.calendarList.list({
      minAccessRole: 'writer',
    });

    const items = response.data.items || [];
    const calendars: GoogleCalendarItem[] = items.map((cal) => ({
      id: cal.id || 'primary',
      summary: cal.summary || 'Tanpa Judul',
      primary: Boolean(cal.primary),
      backgroundColor: cal.backgroundColor || '#2c49b6',
    }));

    return NextResponse.json({ calendars });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mengambil daftar kalender Google';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
