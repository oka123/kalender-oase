import { NextResponse } from 'next/server';
import { createOAuth2Client, getUserProfile } from '@/lib/google';
import { saveSession } from '@/lib/session';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');

  const origin = requestUrl.origin;

  if (error) {
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(error)}`);
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

    await saveSession({
      tokens,
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
