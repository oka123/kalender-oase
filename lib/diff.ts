import type { calendar_v3 } from 'googleapis';
import type { OaseEvent } from '../types/calendar.ts';

/**
 * Buat format deskripsi event Google Calendar yang rapi dan informatif
 */
export function buildEventDescription(event: OaseEvent): string {
  const parts: string[] = [];

  parts.push(`📚 Mata Kuliah: ${event.courseName}`);
  parts.push(`🏷️ Kategori: ${event.eventType.toUpperCase()}`);

  if (event.url) {
    parts.push(`🔗 Buka di OASE: ${event.url}`);
  }

  if (event.links && event.links.length > 0) {
    const extraLinks = event.links
      .filter((l) => l.url !== event.url)
      .map((l) => `  • ${l.label}: ${l.url}`)
      .join('\n');
    if (extraLinks) {
      parts.push(`\nLampiran Link:\n${extraLinks}`);
    }
  }

  if (event.cleanDescription) {
    parts.push(`\n📝 Catatan / Instruksi:\n${event.cleanDescription}`);
  }

  parts.push('\n---\nSinkronisasi otomatis oleh OASE Academic Calendar Sync');
  return parts.join('\n');
}

/**
 * Bangun reminder overrides untuk event Google Calendar
 */
export function buildReminderOverrides(reminderMinutes: number[]): calendar_v3.Schema$Event['reminders'] {
  if (!reminderMinutes || reminderMinutes.length === 0) {
    return { useDefault: true };
  }

  return {
    useDefault: false,
    overrides: reminderMinutes.map((mins) => ({
      method: 'popup',
      minutes: mins,
    })),
  };
}

/**
 * Menghitung perbedaan (diff) antara OASE event dan event di Google Calendar
 */
export function isEventChanged(
  existing: calendar_v3.Schema$Event,
  incoming: OaseEvent,
  formattedDescription: string
): boolean {
  // Cek perubahan judul
  if (existing.summary !== incoming.summary) return true;

  // Cek perubahan waktu mulai atau akhir
  const existingStart = existing.start?.dateTime ? new Date(existing.start.dateTime).getTime() : 0;
  const existingEnd = existing.end?.dateTime ? new Date(existing.end.dateTime).getTime() : 0;

  if (Math.abs(existingStart - incoming.start.getTime()) > 1000) return true;
  if (Math.abs(existingEnd - incoming.end.getTime()) > 1000) return true;

  // Cek perubahan deskripsi
  if ((existing.description || '').trim() !== formattedDescription.trim()) return true;

  return false;
}
