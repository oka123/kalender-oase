import { NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/google';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const redirectUri = searchParams.get('redirectUri') || undefined;

    const url = getAuthorizationUrl(redirectUri);
    return NextResponse.json({ url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menghasilkan URL autentikasi Google';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
