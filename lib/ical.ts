import { sync } from 'node-ical';
import type { OaseEvent, OaseEventType } from '@/types/calendar';

/**
 * Normalisasi URL iCal (mengubah webcal:// menjadi https:// dan menghapus spasi ekstra)
 */
export function normalizeIcalUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  if (url.startsWith('webcal://')) {
    url = 'https://' + url.slice('webcal://'.length);
  } else if (url.startsWith('http://') && !url.includes('localhost')) {
    // Utamakan HTTPS untuk keamanan kecuali localhost
    url = 'https://' + url.slice('http://'.length);
  }
  return url;
}

/**
 * Validasi ketat URL iCal untuk mencegah Server-Side Request Forgery (SSRF)
 * Hanya mengizinkan protokol HTTPS dan domain resmi Universitas Udayana (oase.unud.ac.id / *.unud.ac.id)
 */
export function validateAndNormalizeIcalUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('URL kalender iCal tidak boleh kosong.');
  }

  const normalized = normalizeIcalUrl(rawUrl);

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error('Format URL kalender tidak valid.');
  }

  // Wajib protokol HTTPS
  if (parsed.protocol !== 'https:') {
    throw new Error('URL kalender wajib menggunakan protokol aman HTTPS.');
  }

  const hostname = parsed.hostname.toLowerCase();
  const isDevOrTest = process.env.NODE_ENV !== 'production';

  // Izinkan localhost hanya pada environment dev/test jika dibutuhkan
  if (isDevOrTest && (hostname === 'localhost' || hostname === '127.0.0.1')) {
    return normalized;
  }

  // Tolak seluruh IP privat, metadata service, dan domain luar
  const isOfficialDomain = hostname === 'oase.unud.ac.id' || hostname.endsWith('.unud.ac.id');
  if (!isOfficialDomain) {
    throw new Error(
      `Domain kalender "${hostname}" tidak diizinkan demi keamanan. Hanya URL kalender dari oase.unud.ac.id yang didukung.`
    );
  }

  return normalized;
}

/**
 * Ekstraksi tipe event, judul bersih, dan status deadline dari summary Moodle
 */
export function parseEventSummary(rawSummary: string): {
  cleanTitle: string;
  eventType: OaseEventType;
  isDeadline: boolean;
} {
  const summary = (rawSummary || 'Untitled Event').trim();
  let cleanTitle = summary;
  let isDeadline = false;
  const eventType: OaseEventType = 'general';

  // Deteksi penanda due date Moodle
  const dueSuffixMatch = summary.match(/^(.*?)\s+is due$/i);
  if (dueSuffixMatch) {
    cleanTitle = dueSuffixMatch[1].trim();
    isDeadline = true;
  } else if (/closes$/i.test(summary)) {
    isDeadline = true;
  }

  // Kategori tidak lagi diklasifikasikan secara heuristik karena sering tidak valid
  return { cleanTitle, eventType, isDeadline };
}

/**
 * Ekstraksi link dan pembersihan format deskripsi Moodle iCal
 */
export function parseEventDescription(rawDescription: string): {
  cleanDescription: string;
  links: { label: string; url: string }[];
  primaryUrl?: string;
} {
  if (!rawDescription) {
    return { cleanDescription: '', links: [] };
  }

  const links: { label: string; url: string }[] = [];
  const text = rawDescription.replace(/\u00a0/g, ' ').trim();

  // Regex mencari format Moodle: [1] https://... atau [2] https://...
  const moodleLinkRegex = /\[(\d+)\]\s+(https?:\/\/[^\s]+)/g;
  let match: RegExpExecArray | null;
  while ((match = moodleLinkRegex.exec(text)) !== null) {
    const label = `Link [${match[1]}]`;
    const url = match[2].trim().replace(/&amp;/g, '&');
    links.push({ label, url });
  }

  // Cari URL umum lainnya jika belum ada link yang terdeteksi
  if (links.length === 0) {
    const generalUrlRegex = /(https?:\/\/[^\s]+)/g;
    let urlMatch: RegExpExecArray | null;
    let counter = 1;
    while ((urlMatch = generalUrlRegex.exec(text)) !== null) {
      const url = urlMatch[1].trim().replace(/&amp;/g, '&');
      links.push({ label: `Link ${counter++}`, url });
    }
  }

  // Tentukan primary URL (prioritaskan URL OASE UNUD)
  const oaseLink = links.find((l) => l.url.includes('oase.unud.ac.id'));
  const primaryUrl = oaseLink ? oaseLink.url : links[0]?.url;

  // Bersihkan bagian blok "Links:\n------\n" dari deskripsi utama
  const cleanDescription = text
    .split(/Links:\s*------/i)[0]
    .trim()
    .replace(/\t/g, ' ')
    .replace(/\n{3,}/g, '\n\n');

  return {
    cleanDescription,
    links,
    primaryUrl,
  };
}

/**
 * Parse isi teks file iCalendar (.ics) menjadi array OaseEvent
 */
export function parseIcalData(icsContent: string): OaseEvent[] {
  if (!icsContent || typeof icsContent !== 'string') {
    throw new Error('Konten iCal kosong atau tidak valid.');
  }

  const parsed = sync.parseICS(icsContent);
  const events: OaseEvent[] = [];

  for (const key of Object.keys(parsed)) {
    const item = parsed[key];
    if (!item || item.type !== 'VEVENT') continue;

    const summary = typeof item.summary === 'string' ? item.summary : '';
    const description = typeof item.description === 'string' ? item.description : '';
    const categories = item.categories as unknown;
    let courseName = 'Umum';
    if (Array.isArray(categories)) {
      courseName = categories.join(', ');
    } else if (typeof categories === 'string') {
      courseName = categories.trim() || 'Umum';
    }

    const { cleanTitle, eventType, isDeadline } = parseEventSummary(summary);
    const { cleanDescription, links, primaryUrl } = parseEventDescription(description);

    const startDate = item.start ? new Date(item.start) : new Date();
    const endDate = item.end ? new Date(item.end) : new Date(startDate.getTime());

    const lastModified = item.lastmodified ? new Date(item.lastmodified) : undefined;

    events.push({
      uid: item.uid || key,
      summary,
      cleanTitle,
      description,
      cleanDescription,
      courseName,
      eventType,
      start: startDate,
      end: endDate,
      isDeadline,
      url: primaryUrl,
      links,
      lastModified,
    });
  }

  // Urutkan berdasarkan tanggal start terdekat
  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/**
 * Ambil feed iCal dari URL dan parse ke bentuk OaseEvent[]
 */
export async function fetchAndParseIcal(rawUrl?: string): Promise<OaseEvent[]> {
  const targetUrl = rawUrl || process.env.OASE_ICAL_URL;
  if (!targetUrl) {
    throw new Error('URL iCal OASE belum dikonfigurasi. Silakan isi URL di konfigurasi atau environment variable OASE_ICAL_URL.');
  }

  const normalizedUrl = validateAndNormalizeIcalUrl(targetUrl);

  const response = await fetch(normalizedUrl, {
    headers: {
      'User-Agent': 'OASE-Academic-Calendar-Sync/1.0',
      'Accept': 'text/calendar, text/plain, */*',
    },
    signal: AbortSignal.timeout(12000), // Timeout 12 detik untuk mencegah Slowloris DoS
    // Cache sebentar untuk mencegah spam request berulang ke server OASE
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil data dari server OASE: ${response.status} ${response.statusText}`);
  }

  const icsText = await response.text();
  return parseIcalData(icsText);
}
