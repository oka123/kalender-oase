import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import { getAuthorizationUrl } from '@/lib/google';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const redirectUri = searchParams.get('redirectUri') || undefined;

    // Generate token kriptografis acak untuk melindungi alur OAuth dari Login CSRF
    const state = crypto.randomBytes(32).toString('hex');

    const cookieStore = await cookies();
    cookieStore.set('oase_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 600, // Berlaku 10 menit
    });

    const url = getAuthorizationUrl(redirectUri, state);
    return NextResponse.json({ url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menghasilkan URL autentikasi Google';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
