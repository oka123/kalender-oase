import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.tokens?.access_token) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        email: session.email || null,
        name: session.name || null,
        picture: session.picture || null,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memeriksa status autentikasi';
    return NextResponse.json({ error: message, authenticated: false }, { status: 500 });
  }
}
