import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeIcalUrl,
  parseEventSummary,
  parseEventDescription,
  parseIcalData,
} from '../lib/ical.ts';

test('normalizeIcalUrl converts webcal:// to https:// and trims whitespace', () => {
  const input = '  webcal://oase.unud.ac.id/calendar/export_execute.php?userid=123  ';
  const expected = 'https://oase.unud.ac.id/calendar/export_execute.php?userid=123';
  assert.equal(normalizeIcalUrl(input), expected);

  const httpsInput = 'https://oase.unud.ac.id/calendar.ics';
  assert.equal(normalizeIcalUrl(httpsInput), httpsInput);
});

test('parseEventSummary identifies clean title and deadlines accurately without invalid category heuristics', () => {
  const assignment = parseEventSummary('Tugas Kelompok is due');
  assert.equal(assignment.cleanTitle, 'Tugas Kelompok');
  assert.equal(assignment.isDeadline, true);
  assert.equal(assignment.eventType, 'general');

  const quizOpen = parseEventSummary('K1\\, Kuis opens');
  assert.equal(quizOpen.cleanTitle, 'K1\\, Kuis opens');
  assert.equal(quizOpen.isDeadline, false);
  assert.equal(quizOpen.eventType, 'general');

  const quizClose = parseEventSummary('K1\\, Kuis closes');
  assert.equal(quizClose.cleanTitle, 'K1\\, Kuis closes');
  assert.equal(quizClose.isDeadline, true);
  assert.equal(quizClose.eventType, 'general');

  const exam = parseEventSummary('UTS. Laporan Case Solving is due');
  assert.equal(exam.cleanTitle, 'UTS. Laporan Case Solving');
  assert.equal(exam.isDeadline, true);
  assert.equal(exam.eventType, 'general');
});

test('parseEventDescription extracts clean text and Moodle links correctly', () => {
  const rawDesc = 'Membuat resume materi HKI [1]\\n\\n\\nLinks:\\n------\\n[1] https://oase.unud.ac.id/mod/resource/view.php?id=90727';
  const result = parseEventDescription(rawDesc);

  assert.ok(result.cleanDescription.includes('Membuat resume materi HKI'));
  assert.equal(result.links.length, 1);
  assert.equal(result.links[0].url, 'https://oase.unud.ac.id/mod/resource/view.php?id=90727');
  assert.equal(result.primaryUrl, 'https://oase.unud.ac.id/mod/resource/view.php?id=90727');
});

test('parseIcalData parses sample Moodle iCal content successfully', () => {
  const sampleIcsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Moodle Pty Ltd//NONSGML Moodle Version 2024100704.05//EN',
    'BEGIN:VEVENT',
    'UID:48240@oase.unud.ac.id',
    'SUMMARY:Tugas Kelompok is due',
    'DESCRIPTION:Membuat resume materi HKI [1]\\n\\n\\nLinks:\\n------\\n[1] https://oase.unud.ac.id/mod/resource/view.php?id=90727',
    'DTSTART:20261004T155900Z',
    'DTEND:20261004T155900Z',
    'CATEGORIES:Teknologi IOT 2026 (Kelas A)',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'UID:49066@oase.unud.ac.id',
    'SUMMARY:UTS is due',
    'DESCRIPTION:',
    'DTSTART:20261005T040000Z',
    'DTEND:20261005T040000Z',
    'CATEGORIES:Sains Data 2026',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const events = parseIcalData(sampleIcsContent);

  assert.equal(events.length, 2);

  const firstEvent = events.find((e) => e.uid.startsWith('48240'));
  assert.ok(firstEvent, 'Event 48240 should exist');
  assert.equal(firstEvent.cleanTitle, 'Tugas Kelompok');
  assert.equal(firstEvent.eventType, 'general');
  assert.equal(firstEvent.isDeadline, true);
  assert.ok(firstEvent.url?.includes('oase.unud.ac.id'));

  // Pastikan waktu start dan end sama persis untuk deadline point-in-time agar Google Calendar menampilkan waktu tepat (bukan rentang waktu)
  assert.equal(firstEvent.end.getTime(), firstEvent.start.getTime());
});
