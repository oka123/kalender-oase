import type { MoodleActionEvent, OaseEvent, OaseEventType } from '../types/calendar.ts';

/**
 * Membersihkan HTML string menjadi teks polos yang rapi
 */
export function stripHtml(html?: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

/**
 * Menentukan tipe event OASE berdasarkan module Moodle dan judul event
 */
export function detectMoodleEventType(modulename?: string, name?: string): OaseEventType {
  const mod = (modulename || '').toLowerCase();
  const title = (name || '').toLowerCase();

  if (title.includes('uts') || title.includes('uas') || title.includes('ujian') || title.includes('exam')) {
    return 'exam';
  }

  if (mod === 'quiz' || title.includes('kuis') || title.includes('quiz')) {
    return 'quiz';
  }

  if (mod === 'assign' || title.includes('tugas') || title.includes('assignment') || title.includes('tm') || title.includes('tk')) {
    return 'assignment';
  }

  if (mod === 'forum' || title.includes('diskusi') || title.includes('discussion')) {
    return 'discussion';
  }

  return 'general';
}

/**
 * Memvalidasi dan membersihkan URL agar hanya menerima skema web yang aman (https atau http)
 * Mencegah serangan JavaScript pseudo-protocol (javascript:...) atau data URI
 */
export function sanitizeWebUrl(url?: string): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Mengonversi daftar tugas yang belum dikerjakan dari API Moodle ke format internal OaseEvent
 */
export function convertMoodleTasksToOaseEvents(tasks: MoodleActionEvent[]): OaseEvent[] {
  return tasks.map((task) => {
    const rawSummary = task.name || task.activityname || 'Tugas OASE';
    const cleanTitle = task.activityname?.trim() || rawSummary.replace(/\s+is due\s*$/i, '').trim();
    const courseName = task.course?.fullname?.trim() || 'Umum';
    const eventType = detectMoodleEventType(task.modulename, rawSummary);

    const startDate = new Date(task.timestart * 1000);
    // Batas waktu / deadline di Moodle adalah point-in-time (tanpa durasi rentang waktu jika timeduration 0)
    const durationMs = (task.timeduration && task.timeduration > 0 ? task.timeduration : 0) * 1000;
    const endDate = new Date(startDate.getTime() + durationMs);

    const rawDescription = task.description || '';
    const cleanDescription = stripHtml(rawDescription);

    const safeTaskUrl = sanitizeWebUrl(task.url);
    const safeActionUrl = sanitizeWebUrl(task.action?.url);

    const links: { label: string; url: string }[] = [];
    if (safeTaskUrl) {
      links.push({ label: 'Buka Tugas di OASE', url: safeTaskUrl });
    }
    if (safeActionUrl && safeActionUrl !== safeTaskUrl) {
      links.push({ label: task.action?.name || 'Kumpulkan Tugas', url: safeActionUrl });
    }

    return {
      uid: `${task.id}@oase.unud.ac.id`,
      summary: rawSummary,
      cleanTitle,
      description: rawDescription,
      cleanDescription,
      courseName,
      eventType,
      start: startDate,
      end: endDate,
      isDeadline: true,
      url: safeTaskUrl || safeActionUrl,
      links,
      lastModified: new Date(),
    };
  });
}
