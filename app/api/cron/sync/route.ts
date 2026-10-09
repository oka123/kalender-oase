import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { syncOaseToGoogleCalendar } from '@/lib/sync';

function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

async function handleCronSync(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;

    // Fail-Closed: Tolak eksekusi jika CRON_SECRET belum dikonfigurasi di server
    if (!cronSecret) {
      return NextResponse.json(
        { error: 'Konfigurasi server belum lengkap: CRON_SECRET wajib disetel untuk mengamankan endpoint cron webhook.' },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get('authorization') || '';
    const expectedAuth = `Bearer ${cronSecret}`;

    if (!timingSafeCompare(authHeader, expectedAuth)) {
      return NextResponse.json(
        { error: 'Tidak diizinkan: Kredensial Authorization CRON_SECRET tidak valid atau tidak cocok.' },
        { status: 401 }
      );
    }

    const rawRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const refreshToken = rawRefreshToken?.trim().replace(/^["']|["']$/g, '');

    if (!refreshToken) {
      return NextResponse.json(
        {
          error:
            'GOOGLE_REFRESH_TOKEN belum diset di environment variables Vercel. Silakan masukkan refresh token akun Anda di dashboard Vercel.',
        },
        { status: 400 }
      );
    }

    if (refreshToken.startsWith('ya29.')) {
      return NextResponse.json(
        {
          error:
            'Token yang dikonfigurasi adalah Access Token sementara (berawalan ya29...), bukan Refresh Token (1//...). Token sementara akan kadaluarsa setelah 1 jam. Silakan login pada web dan salin GOOGLE_REFRESH_TOKEN yang benar (diawali 1//).',
        },
        { status: 400 }
      );
    }

    // Buat client OAuth2 secara eksplisit dengan token yang telah disanitasi
    const { getAuthenticatedOAuth2Client } = await import('@/lib/google');
    const oauth2Client = await getAuthenticatedOAuth2Client(refreshToken);

    if (!oauth2Client) {
      return NextResponse.json(
        { error: 'Gagal menginisialisasi OAuth Client dengan GOOGLE_REFRESH_TOKEN yang diberikan.' },
        { status: 500 }
      );
    }

    // Eksekusi sinkronisasi ke kalender khusus OASE
    const result = await syncOaseToGoogleCalendar(
      {
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'dedicated',
        createDedicatedCalendar: true,
        reminderMinutes: [1440, 120], // 1 hari & 2 jam sebelum batas waktu
      },
      oauth2Client
    );

    return NextResponse.json({
      success: true,
      message: `Sinkronisasi webhook otomatis berhasil! (${result.created} dibuat, ${result.updated} diperbarui, ${result.skipped} dilewati)`,
      result,
    });
  } catch (error: unknown) {
    const rawMessage = error instanceof Error ? error.message : String(error);
    let userFriendlyMessage = rawMessage;

    if (rawMessage.includes('unauthorized_client')) {
      userFriendlyMessage =
        'Google OAuth (unauthorized_client): Kredensial tidak valid. Penyebab utama: (1) GOOGLE_REFRESH_TOKEN di Vercel tidak sesuai dengan GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET di Vercel (misal token dibuat dengan Client ID berbeda atau dari localhost), (2) Status OAuth Consent Screen di Google Cloud Console masih "Testing" sehingga token otomatis kadaluarsa setelah 7 hari (ubah ke "In production"), atau (3) Kredensial dicabut. Solusi: Buka web produksi di Vercel, login ulang dengan Google, lalu salin token dari menu GitHub Actions ke GOOGLE_REFRESH_TOKEN di Vercel.';
    } else if (rawMessage.includes('invalid_grant')) {
      userFriendlyMessage =
        'Google OAuth (invalid_grant): Refresh token telah kadaluarsa atau dicabut oleh Google. Silakan login ulang pada web produksi Anda untuk mendapatkan token baru.';
    }

    return NextResponse.json(
      { success: false, error: userFriendlyMessage, rawError: rawMessage },
      { status: 500 }
    );
  }
}

// Mendukung pemanggilan melalui POST maupun GET (kompatibel dengan GitHub Actions curl dan Vercel Cron bawaan)
export async function POST(request: Request) {
  return handleCronSync(request);
}

export async function GET(request: Request) {
  return handleCronSync(request);
}
