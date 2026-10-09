import { NextResponse } from 'next/server';
import { syncOaseToGoogleCalendar } from '@/lib/sync';

async function handleCronSync(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    
    // Verifikasi Authorization Header jika CRON_SECRET dikonfigurasi
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      const expectedAuth = `Bearer ${cronSecret}`;

      if (authHeader !== expectedAuth) {
        return NextResponse.json(
          { error: 'Tidak diizinkan: Kredensial CRON_SECRET tidak valid atau tidak cocok.' },
          { status: 401 }
        );
      }
    }

    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    if (!refreshToken) {
      return NextResponse.json(
        {
          error:
            'GOOGLE_REFRESH_TOKEN belum diset di environment variables Vercel. Silakan masukkan refresh token akun Anda di dashboard Vercel.',
        },
        { status: 400 }
      );
    }

    // Eksekusi sinkronisasi ke kalender khusus OASE
    const result = await syncOaseToGoogleCalendar({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'dedicated',
      createDedicatedCalendar: true,
      reminderMinutes: [1440, 120], // 1 hari & 2 jam sebelum batas waktu
    });

    return NextResponse.json({
      success: true,
      message: `Sinkronisasi webhook otomatis berhasil! (${result.created} dibuat, ${result.updated} diperbarui, ${result.skipped} dilewati)`,
      result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kegagalan pada background cron sync.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// Mendukung pemanggilan melalui POST maupun GET (kompatibel dengan GitHub Actions curl dan Vercel Cron bawaan)
export async function POST(request: Request) {
  return handleCronSync(request);
}

export async function GET(request: Request) {
  return handleCronSync(request);
}
