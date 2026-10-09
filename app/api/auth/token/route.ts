import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.tokens?.access_token) {
      return NextResponse.json(
        { error: 'Belum terautentikasi dengan Google' },
        { status: 401 }
      );
    }

    const refreshToken = session.tokens.refresh_token || null;

    return NextResponse.json({
      hasRefreshToken: Boolean(refreshToken),
      refreshToken,
      email: session.email,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mengambil refresh token';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
