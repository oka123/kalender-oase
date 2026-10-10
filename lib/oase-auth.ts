import type { MoodleActionEvent } from "../types/calendar.ts";

/**
 * CookieJar sederhana untuk mengelola cookies antar-request HTTP
 */
class SimpleCookieJar {
  private cookies = new Map<string, string>();

  public updateFromHeaders(headers: Headers) {
    const rawCookies: string[] = [];
    if (typeof headers.getSetCookie === "function") {
      rawCookies.push(...headers.getSetCookie());
    } else {
      const headerVal = headers.get("set-cookie");
      if (headerVal) rawCookies.push(headerVal);
    }

    for (const cookieStr of rawCookies) {
      if (!cookieStr) continue;
      const firstPart = cookieStr.split(";")[0];
      const eqIdx = firstPart.indexOf("=");
      if (eqIdx !== -1) {
        const name = firstPart.slice(0, eqIdx).trim();
        const value = firstPart.slice(eqIdx + 1).trim();
        this.cookies.set(name, value);
      }
    }
  }

  public getHeader(): string {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }

  public get(name: string): string | undefined {
    return this.cookies.get(name);
  }

  public set(name: string, value: string) {
    this.cookies.set(name, value);
  }
}

/**
 * Mengambil daftar tugas yang belum dikerjakan dari OASE Moodle
 * menggunakan HTTP fetch murni tanpa Playwright
 */
export async function fetchPendingOaseTasks(
  username: string,
  password: string,
): Promise<MoodleActionEvent[]> {
  const jar = new SimpleCookieJar();
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

  // 1. Dapatkan halaman login Moodle OASE untuk menemukan tautan OAuth2 Unud
  const initRes = await fetch("https://oase.unud.ac.id/login/index.php", {
    headers: { "User-Agent": userAgent },
    redirect: "manual",
  });
  jar.updateFromHeaders(initRes.headers);
  const initHtml = await initRes.text();

  const oauthLinkMatch = initHtml.match(
    /href="([^"]*auth\/oauth2\/login\.php[^"]*)"/,
  );
  if (!oauthLinkMatch) {
    throw new Error(
      "Gagal menemukan tautan SSO OAuth2 di halaman login OASE UNUD.",
    );
  }
  const oauthLoginUrl = oauthLinkMatch[1].replace(/&amp;/g, "&");

  // 2. Klik tautan SSO OAuth2 di OASE (Moodle me-redirect ke oauth2.unud.ac.id/oauth/authorize)
  const oauthRes = await fetch(oauthLoginUrl, {
    headers: {
      Cookie: jar.getHeader(),
      "User-Agent": userAgent,
    },
    redirect: "manual",
  });
  jar.updateFromHeaders(oauthRes.headers);

  const authorizeUrl = oauthRes.headers.get("location");
  if (!authorizeUrl) {
    throw new Error(
      "Gagal mendapatkan URL otorisasi SSO Unud (tidak ada header Location redirect).",
    );
  }

  // 3. Kunjungi URL otorisasi SSO (me-redirect ke oauth2.unud.ac.id/login)
  const authRes = await fetch(authorizeUrl, {
    headers: {
      Cookie: jar.getHeader(),
      "User-Agent": userAgent,
    },
    redirect: "manual",
  });
  jar.updateFromHeaders(authRes.headers);

  const loginPageUrl = authRes.headers.get("location");
  if (!loginPageUrl) {
    throw new Error("Gagal dialihkan ke form login SSO Unud.");
  }

  // 4. Buka halaman login SSO Unud dan ekstrak CSRF token Laravel (_token)
  const loginPageRes = await fetch(loginPageUrl, {
    headers: {
      Cookie: jar.getHeader(),
      "User-Agent": userAgent,
    },
  });
  jar.updateFromHeaders(loginPageRes.headers);
  const loginHtml = await loginPageRes.text();

  const csrfMatch = loginHtml.match(/name="_token"\s+value="([^"]+)"/);
  if (!csrfMatch) {
    throw new Error(
      "Gagal mengekstrak CSRF token dari halaman login SSO Unud.",
    );
  }
  const csrfToken = csrfMatch[1];

  const xsrfToken = jar.get("XSRF-TOKEN");
  const decodedXsrf = xsrfToken ? decodeURIComponent(xsrfToken) : undefined;

  const formActionMatch = loginHtml.match(/<form[^>]*action="([^"]+)"/);
  const rawAction = formActionMatch
    ? formActionMatch[1].replace(/&amp;/g, "&")
    : "/login";
  const postLoginUrl = new URL(
    rawAction,
    "https://oauth2.unud.ac.id",
  ).toString();

  // 5. Kirimkan form kredensial SSO Unud
  const formData = new URLSearchParams();
  formData.append("_token", csrfToken);
  formData.append("username", username.trim());
  formData.append("password", password);

  const ssoHeaders: Record<string, string> = {
    Cookie: jar.getHeader(),
    "Content-Type": "application/x-www-form-urlencoded",
    Origin: "https://oauth2.unud.ac.id",
    Referer: loginPageUrl,
    "User-Agent": userAgent,
  };
  if (decodedXsrf) {
    ssoHeaders["X-XSRF-TOKEN"] = decodedXsrf;
  }

  const postRes = await fetch(postLoginUrl, {
    method: "POST",
    headers: ssoHeaders,
    body: formData.toString(),
    redirect: "manual",
  });
  jar.updateFromHeaders(postRes.headers);

  const afterPostLocation = postRes.headers.get("location");
  if (!afterPostLocation) {
    throw new Error(
      "SSO Unud tidak mengembalikan respon pengalihan (redirect) setelah login.",
    );
  }

  // Jika dialihkan kembali ke /login, berarti kredensial username/password salah
  if (
    afterPostLocation.includes("/login") &&
    !afterPostLocation.includes("return_to")
  ) {
    throw new Error(
      "Kredensial OASE_USERNAME atau OASE_PASSWORD SSO Universitas Udayana tidak cocok.",
    );
  }

  // 6. Ikuti alur pengalihan OAuth2 hingga kembali ke Moodle OASE
  let currentRedirectUrl: string | null = afterPostLocation;
  let oaseSessionFound = false;

  // Ikuti redirect berantai (maksimal 20 kali hingga tiba di landing page Moodle)
  for (let i = 0; i < 20 && currentRedirectUrl; i++) {
    const nextUrlObj = new URL(currentRedirectUrl, "https://oauth2.unud.ac.id");
    const hostname = nextUrlObj.hostname.toLowerCase();

    // Validasi Keamanan SEC-NEW-04: Kunci domain redirect agar tidak mengirim cookie sesi ke host pihak ketiga
    const isAllowedHost =
      hostname === "oase.unud.ac.id" ||
      hostname === "oauth2.unud.ac.id" ||
      hostname.endsWith(".unud.ac.id");

    if (!isAllowedHost || nextUrlObj.protocol !== "https:") {
      throw new Error(
        `Pengalihan ke domain tidak tepercaya ditolak demi keamanan: ${nextUrlObj.origin}`,
      );
    }

    const nextUrl = nextUrlObj.toString();
    const followRes: Response = await fetch(nextUrl, {
      headers: {
        Cookie: jar.getHeader(),
        "User-Agent": userAgent,
      },
      redirect: "manual",
    });
    jar.updateFromHeaders(followRes.headers);

    if (jar.get("MoodleSession")) {
      oaseSessionFound = true;
    }

    currentRedirectUrl = followRes.headers.get("location");
    if (!currentRedirectUrl) {
      break;
    }
  }

  // 7. Kunjungi dashboard Moodle OASE (/my/) untuk mengekstrak sesskey internal user
  let dashboardRes = await fetch("https://oase.unud.ac.id/my/", {
    headers: {
      Cookie: jar.getHeader(),
      "User-Agent": userAgent,
    },
  });
  jar.updateFromHeaders(dashboardRes.headers);
  let dashboardHtml = await dashboardRes.text();

  // Ekstrak sesskey dari M.cfg.sesskey atau tautan sesskey di halaman dashboard
  let sesskeyMatch =
    dashboardHtml.match(/"sesskey":"([^"]+)"/) ||
    dashboardHtml.match(/sesskey=([a-zA-Z0-9]+)/);

  if (!sesskeyMatch) {
    // Fallback ke halaman depan
    dashboardRes = await fetch("https://oase.unud.ac.id/", {
      headers: {
        Cookie: jar.getHeader(),
        "User-Agent": userAgent,
      },
    });
    jar.updateFromHeaders(dashboardRes.headers);
    dashboardHtml = await dashboardRes.text();
    sesskeyMatch =
      dashboardHtml.match(/"sesskey":"([^"]+)"/) ||
      dashboardHtml.match(/sesskey=([a-zA-Z0-9]+)/);
  }

  if (!sesskeyMatch) {
    // Jika tidak menemukan sesskey, periksa apakah login berhasil
    if (!oaseSessionFound && !jar.get("MoodleSession")) {
      throw new Error(
        "Gagal mendapatkan MoodleSession setelah login SSO. Pastikan username dan password OASE valid.",
      );
    }
    throw new Error(
      "Berhasil login namun gagal menemukan sesskey internal Moodle OASE.",
    );
  }

  const sesskey = sesskeyMatch[1];
  const moodleSession = jar.get("MoodleSession");

  if (!moodleSession) {
    throw new Error("Cookie MoodleSession tidak ditemukan di cookie jar.");
  }

  // 8. Panggil API Moodle core_calendar_get_action_events_by_timesort
  // Ambil tugas yang belum dikerjakan dari 7 hari yang lalu hingga masa depan
  const yesterdayTimestamp = Math.floor(Date.now() / 1000) - 7 * 86400;
  const ajaxUrl = `https://oase.unud.ac.id/lib/ajax/service.php?sesskey=${encodeURIComponent(sesskey)}&info=core_calendar_get_action_events_by_timesort`;

  const payload = [
    {
      index: 0,
      methodname: "core_calendar_get_action_events_by_timesort",
      args: {
        timesortfrom: yesterdayTimestamp,
        limitnum: 50,
        limittononsuspendedevents: true,
      },
    },
  ];

  const ajaxRes = await fetch(ajaxUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `MoodleSession=${moodleSession}`,
      "User-Agent": userAgent,
    },
    body: JSON.stringify(payload),
  });

  if (!ajaxRes.ok) {
    throw new Error(
      `Gagal memanggil API Moodle AJAX timeline (HTTP ${ajaxRes.status})`,
    );
  }

  const ajaxData = await ajaxRes.json();
  if (Array.isArray(ajaxData) && ajaxData[0]?.error) {
    const errItem = ajaxData[0];
    const exc = errItem.exception;
    let detailMsg = "Unknown error";
    if (typeof exc === "object" && exc !== null) {
      detailMsg = exc.message || exc.errorcode || JSON.stringify(exc);
    } else if (exc) {
      detailMsg = String(exc);
    } else if (errItem.message) {
      detailMsg = String(errItem.message);
    }
    console.error(
      "[OASE Moodle AJAX Error Details]:",
      JSON.stringify(errItem, null, 2),
    );
    throw new Error(`Error dari API Moodle OASE: ${detailMsg}`);
  }

  const events: MoodleActionEvent[] = ajaxData[0]?.data?.events || [];
  return events;
}
