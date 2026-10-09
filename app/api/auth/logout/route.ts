import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';

export async function POST() {
  try {
    await clearSession();
    return NextResponse.json({ success: true, message: 'Berhasil keluar' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal melakukan logout';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
