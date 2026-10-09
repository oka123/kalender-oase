export type OaseEventType = 'assignment' | 'quiz' | 'exam' | 'discussion' | 'general';

export interface OaseEvent {
  uid: string;
  summary: string;
  cleanTitle: string;
  description: string;
  cleanDescription: string;
  courseName: string;
  eventType: OaseEventType;
  start: Date;
  end: Date;
  isDeadline: boolean;
  url?: string;
  links: { label: string; url: string }[];
  lastModified?: Date;
}

export interface SyncOptions {
  calendarId: string;
  createDedicatedCalendar?: boolean;
  reminderMinutes?: number[]; // Misal [1440, 120] = 1 hari dan 2 jam
  customIcalUrl?: string;
}

export interface SyncResult {
  totalEvents: number;
  created: number;
  updated: number;
  skipped: number;
  errors: { eventId: string; title: string; message: string }[];
  calendarName: string;
  calendarId: string;
  syncedAt: string;
}

export interface GoogleSessionData {
  tokens: {
    access_token?: string | null;
    refresh_token?: string | null;
    scope?: string | null;
    token_type?: string | null;
    expiry_date?: number | null;
  };
  email?: string | null;
  name?: string | null;
  picture?: string | null;
}

export interface GoogleCalendarItem {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
}
