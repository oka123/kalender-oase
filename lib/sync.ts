import { google, type calendar_v3 } from "googleapis";
import type { SyncOptions, SyncResult } from "../types/calendar.ts";
import { getAuthenticatedOAuth2Client } from "./google.ts";
import { fetchAndParseIcal } from "./ical.ts";
import {
  buildEventDescription,
  buildReminderOverrides,
  isEventChanged,
} from "./diff.ts";

export { isEventChanged };

const DEDICATED_CALENDAR_NAME = "OASE UNUD - Akademik";
const DEDICATED_CALENDAR_DESC =
  "Kalender sinkronisasi jadwal tugas, kuis, dan ujian OASE Moodle Universitas Udayana.";

/**
 * Mencari atau membuat kalender khusus OASE di akun Google Calendar pengguna
 */
export async function getOrCreateDedicatedCalendar(
  calendar: calendar_v3.Calendar,
): Promise<{ id: string; summary: string }> {
  // Ambil daftar kalender pengguna
  const calendarList = await calendar.calendarList.list({
    minAccessRole: "writer",
  });
  const items = calendarList.data.items || [];

  const existingCalendar = items.find(
    (cal) =>
      cal.summary?.trim().toLowerCase() ===
      DEDICATED_CALENDAR_NAME.toLowerCase(),
  );

  if (existingCalendar && existingCalendar.id) {
    return {
      id: existingCalendar.id,
      summary: existingCalendar.summary || DEDICATED_CALENDAR_NAME,
    };
  }

  // Jika belum ada, buat kalender baru
  const newCal = await calendar.calendars.insert({
    requestBody: {
      summary: DEDICATED_CALENDAR_NAME,
      description: DEDICATED_CALENDAR_DESC,
      timeZone: "Asia/Makassar", // Default zona waktu Bali (WITA)
    },
  });

  if (!newCal.data.id) {
    throw new Error("Gagal membuat kalender khusus di Google Calendar.");
  }

  return {
    id: newCal.data.id,
    summary: newCal.data.summary || DEDICATED_CALENDAR_NAME,
  };
}

/**
 * Eksekusi proses sinkronisasi event iCal OASE ke Google Calendar
 */
export async function syncOaseToGoogleCalendar(
  options: SyncOptions,
  explicitOAuth2Client?: InstanceType<typeof google.auth.OAuth2>,
): Promise<SyncResult> {
  const oauth2Client =
    explicitOAuth2Client || (await getAuthenticatedOAuth2Client());
  if (!oauth2Client) {
    throw new Error(
      "Pengguna belum terautentikasi dengan Google Calendar. Silakan hubungkan akun Google atau set GOOGLE_REFRESH_TOKEN.",
    );
  }

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  // 1. Tentukan kalender tujuan
  let targetCalendarId = options.calendarId || "primary";
  let targetCalendarName = "Primary Calendar";

  if (options.createDedicatedCalendar || targetCalendarId === "dedicated") {
    const dedicated = await getOrCreateDedicatedCalendar(calendar);
    targetCalendarId = dedicated.id;
    targetCalendarName = dedicated.summary;
  } else if (targetCalendarId !== "primary") {
    try {
      const calInfo = await calendar.calendars.get({
        calendarId: targetCalendarId,
      });
      targetCalendarName = calInfo.data.summary || targetCalendarId;
    } catch {
      targetCalendarName = targetCalendarId;
    }
  }

  // 2. Ambil event dari iCal OASE
  const oaseEvents = await fetchAndParseIcal(options.customIcalUrl);

  // 3. Ambil daftar event yang sudah tersinkronisasi di Google Calendar
  // Ambil event dari 60 hari yang lalu hingga 1 tahun ke depan untuk menghemat quota
  const timeMin = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

  const existingEventsRes = await calendar.events.list({
    calendarId: targetCalendarId,
    timeMin,
    maxResults: 2500,
    singleEvents: true,
  });

  const existingItems = existingEventsRes.data.items || [];

  // Index event yang sudah ada berdasarkan oase_event_id atau matching UID di private properties
  const existingEventsMap = new Map<string, calendar_v3.Schema$Event>();
  for (const item of existingItems) {
    const oaseId = item.extendedProperties?.private?.oase_event_id;
    if (oaseId) {
      existingEventsMap.set(oaseId, item);
    }
  }

  const reminders = buildReminderOverrides(
    options.reminderMinutes || [1440, 120],
  );

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: SyncResult["errors"] = [];

  // 4. Proses setiap event dari OASE
  for (const event of oaseEvents) {
    try {
      const formattedDescription = buildEventDescription(event);
      const existingGoogleEvent = existingEventsMap.get(event.uid);

      const eventBody: calendar_v3.Schema$Event = {
        summary: event.summary,
        description: formattedDescription,
        start: {
          dateTime: event.start.toISOString(),
          timeZone: "Asia/Makassar",
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: "Asia/Makassar",
        },
        reminders,
        extendedProperties: {
          private: {
            oase_event_id: event.uid,
            oase_course: event.courseName,
            oase_type: event.eventType,
            oase_last_synced: new Date().toISOString(),
          },
        },
      };

      if (!existingGoogleEvent || !existingGoogleEvent.id) {
        // Event baru: INSERT
        await calendar.events.insert({
          calendarId: targetCalendarId,
          requestBody: eventBody,
        });
        created++;
      } else {
        // Event sudah ada: Cek apakah ada perubahan
        if (isEventChanged(existingGoogleEvent, event, formattedDescription)) {
          await calendar.events.patch({
            calendarId: targetCalendarId,
            eventId: existingGoogleEvent.id,
            requestBody: eventBody,
          });
          updated++;
        } else {
          skipped++;
        }
      }

      // Berikan delay kecil untuk menghindari Google API rate limit
      await new Promise((resolve) => setTimeout(resolve, 60));
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Unknown sync error";
      errors.push({
        eventId: event.uid,
        title: event.summary,
        message: errorMsg,
      });
    }
  }

  return {
    totalEvents: oaseEvents.length,
    created,
    updated,
    skipped,
    errors,
    calendarName: targetCalendarName,
    calendarId: targetCalendarId,
    syncedAt: new Date().toISOString(),
  };
}
