import { google } from 'googleapis';
import { syncOaseToGoogleCalendar } from '../lib/sync.ts';

async function runCliSync() {
  console.log('='.repeat(60));
  console.log('🚀 Memulai Sinkronisasi Otomatis OASE ke Google Calendar');
  console.log(`⏰ Waktu Eksekusi: ${new Date().toISOString()} (${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })} WITA)`);
  console.log('='.repeat(60));

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const icalUrl = process.env.OASE_ICAL_URL;
  const targetCalendarId = process.env.GOOGLE_CALENDAR_ID || 'dedicated';

  // Validasi environment variable
  const missingEnv: string[] = [];
  if (!clientId) missingEnv.push('GOOGLE_CLIENT_ID');
  if (!clientSecret) missingEnv.push('GOOGLE_CLIENT_SECRET');
  if (!refreshToken) missingEnv.push('GOOGLE_REFRESH_TOKEN');
  if (!icalUrl) missingEnv.push('OASE_ICAL_URL');

  if (missingEnv.length > 0) {
    console.error(`❌ GAGAL: Environment variable berikut belum dikonfigurasi: ${missingEnv.join(', ')}`);
    console.error('Silakan atur variabel tersebut pada GitHub Repository Secrets.');
    process.exit(1);
  }

  try {
    // Inisialisasi OAuth2 Client langsung menggunakan Refresh Token
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
    );
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    console.log('📡 Mengambil dan memparsing feed iCal dari OASE UNUD...');
    const result = await syncOaseToGoogleCalendar(
      {
        calendarId: targetCalendarId,
        createDedicatedCalendar: targetCalendarId === 'dedicated',
        reminderMinutes: [1440, 120], // 1 hari dan 2 jam sebelum deadline
        customIcalUrl: icalUrl,
      },
      oauth2Client
    );

    console.log('\n✅ SINKRONISASI BERHASIL!');
    console.log(`📅 Target Kalender : "${result.calendarName}" (ID: ${result.calendarId})`);
    console.log(`📊 Total Acara      : ${result.totalEvents}`);
    console.log(`✨ Baru Ditambahkan : +${result.created}`);
    console.log(`🔄 Diperbarui       : ${result.updated}`);
    console.log(`⏭️  Sudah Sinkron    : ${result.skipped}`);

    if (result.errors.length > 0) {
      console.warn(`\n⚠️ ${result.errors.length} Acara Mengalami Peringatan:`);
      for (const err of result.errors) {
        console.warn(`  - [${err.eventId}] ${err.title}: ${err.message}`);
      }
    }

    console.log('='.repeat(60));
    process.exit(0);
  } catch (error: unknown) {
    console.error('\n❌ TERJADI KESALAHAN PADA PROSES SINKRONISASI:');
    if (error instanceof Error) {
      console.error(error.message);
      if (error.stack) console.error(error.stack);
    } else {
      console.error(String(error));
    }
    console.log('='.repeat(60));
    process.exit(1);
  }
}

runCliSync();
