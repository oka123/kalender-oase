import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createOAuth2Client, getUserProfile } from '@/lib/google';
import { getSession, saveSession } from '@/lib/session';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const state = requestUrl.searchParams.get('state');

  const origin = requestUrl.origin;

  if (error) {
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(error)}`);
  }

  // Validasi proteksi CSRF state
  const cookieStore = await cookies();
  const savedStateCookie = cookieStore.get('oase_oauth_state');
  const savedState = savedStateCookie?.value;

  // Hapus cookie state (one-time token)
  cookieStore.delete('oase_oauth_state');

  if (!state || !savedState || state !== savedState) {
    return NextResponse.redirect(
      `${origin}/?auth_error=${encodeURIComponent('Validasi keamanan sesi gagal (OAuth State CSRF mismatch). Silakan ulangi proses login.')}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent('Kode otorisasi tidak ditemukan.')}`);
  }

  try {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    let profile: { email?: string | null; name?: string | null; picture?: string | null } = {};
    try {
      const userProfile = await getUserProfile(oauth2Client);
      profile = {
        email: userProfile.email,
        name: userProfile.name,
        picture: userProfile.picture,
      };
    } catch {
      // Profil opsional jika gagal diambil
    }

    const existingSession = await getSession();
    const finalTokens = {
      ...tokens,
      refresh_token: tokens.refresh_token || existingSession?.tokens?.refresh_token,
    };

    await saveSession({
      tokens: finalTokens,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    });

    return NextResponse.redirect(`${origin}/?auth=success`);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kegagalan pertukaran token Google OAuth.';
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(errorMsg)}`);
  }
}
