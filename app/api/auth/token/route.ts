import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

function validateSameOrigin(request: Request): boolean {
  // 1. Proteksi Browser Modern: Sec-Fetch-Site
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite && secFetchSite === "cross-site") {
    return false;
  }

  // 2. Proteksi Origin & Referer
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const requestUrl = new URL(request.url);

  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== requestUrl.host) return false;
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host !== requestUrl.host) return false;
    } catch {
      return false;
    }
  }

  return true;
}

async function handleTokenRequest(request: Request) {
  try {
    if (!validateSameOrigin(request)) {
      return NextResponse.json(
        { error: "Akses ditolak: Permintaan lintas-asal (cross-origin) tidak diizinkan." },
        { status: 403 },
      );
    }

    const session = await getSession();

    if (!session || !session.tokens?.access_token) {
      return NextResponse.json(
        { error: "Belum terautentikasi dengan Google" },
        { status: 401 },
      );
    }

    const refreshToken = session.tokens.refresh_token || null;

    const response = NextResponse.json({
      hasRefreshToken: Boolean(refreshToken),
      refreshToken,
      email: session.email,
    });

    // Cegah browser atau proxy menyimpan token sensitif ke dalam cache
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("X-Content-Type-Options", "nosniff");

    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal mengambil refresh token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return handleTokenRequest(request);
}

export async function GET(request: Request) {
  return handleTokenRequest(request);
}

