import test from 'node:test';
import assert from 'node:assert/strict';
import {
  stripHtml,
  detectMoodleEventType,
  sanitizeWebUrl,
  convertMoodleTasksToOaseEvents,
} from '../lib/moodle.ts';
import type { MoodleActionEvent } from '../types/calendar.ts';

test('Moodle: sanitizeWebUrl allows valid http/https URLs and rejects javascript/data URIs', () => {
  assert.equal(
    sanitizeWebUrl('https://oase.unud.ac.id/mod/assign/view.php?id=92242'),
    'https://oase.unud.ac.id/mod/assign/view.php?id=92242'
  );
  assert.equal(
    sanitizeWebUrl('http://oase.unud.ac.id/calendar'),
    'http://oase.unud.ac.id/calendar'
  );

  // Tolak protokol berbahaya
  assert.equal(sanitizeWebUrl('javascript:alert(1)'), undefined);
  assert.equal(sanitizeWebUrl('javascript:void(0)'), undefined);
  assert.equal(sanitizeWebUrl('data:text/html,<script>alert(1)</script>'), undefined);
  assert.equal(sanitizeWebUrl('vbscript:msgbox(1)'), undefined);
  assert.equal(sanitizeWebUrl(''), undefined);
  assert.equal(sanitizeWebUrl(undefined), undefined);
});

test('Moodle: convertMoodleTasksToOaseEvents ignores dangerous link schemes', () => {
  const dangerousTask: MoodleActionEvent = {
    id: 11111,
    name: 'Tugas Phishing',
    url: 'javascript:stealCredentials()',
    action: {
      name: 'Klik Ini',
      url: 'data:text/html,<script>malicious()</script>',
      actionable: true,
    },
    timestart: 1791734400,
  };

  const parsed = convertMoodleTasksToOaseEvents([dangerousTask]);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].url, undefined);
  assert.equal(parsed[0].links.length, 0);
});


test('Moodle: stripHtml correctly strips tags and normalizes entities', () => {
  const html = '<p>Silakan kumpulkan dokumen di <a href="https://example.com">tautan ini</a>.</p><br>&nbsp;Terima kasih!';
  const expected = 'Silakan kumpulkan dokumen di tautan ini.\n\n Terima kasih!';
  assert.equal(stripHtml(html), expected);

  assert.equal(stripHtml(''), '');
  assert.equal(stripHtml(undefined), '');
});

test('Moodle: detectMoodleEventType identifies types properly', () => {
  assert.equal(detectMoodleEventType('assign', 'TM1. Review Paper is due'), 'assignment');
  assert.equal(detectMoodleEventType('quiz', 'Kuis 1 Pemodelan'), 'quiz');
  assert.equal(detectMoodleEventType('forum', 'Diskusi Bab 2'), 'discussion');
  assert.equal(detectMoodleEventType('assign', 'UAS. Presentasi Case Solving'), 'exam');
  assert.equal(detectMoodleEventType('unknown', 'Pertemuan Kuliah'), 'general');
});

test('Moodle: convertMoodleTasksToOaseEvents maps raw Moodle API objects to OaseEvent', () => {
  const sampleTasks: MoodleActionEvent[] = [
    {
      id: 49438,
      name: 'Pengumpulan UTS is due',
      activityname: 'Pengumpulan UTS',
      description: '<p>hanya perwakilan kelompok saja yang melakukan <a href="https://oase.unud.ac.id/mod/assign/view.php?id=92242">pengumpulan UTS</a></p>',
      modulename: 'assign',
      timestart: 1791734400, // 2026-10-11T16:00:00.000Z
      timeduration: 3600,
      url: 'https://oase.unud.ac.id/mod/assign/view.php?id=92242',
      course: {
        id: 5381,
        fullname: 'Basis Data Lanjut (Kelas A)',
      },
      action: {
        name: 'Add submission',
        url: 'https://oase.unud.ac.id/mod/assign/view.php?id=92242&action=editsubmission',
        actionable: true,
      },
    },
    {
      id: 41242,
      name: 'UAS. Presentasi Case Solving is due',
      activityname: 'UAS. Presentasi Case Solving',
      description: '<div>Siapkan slide ppt</div>',
      modulename: 'assign',
      timestart: 1796400000,
      timeduration: 0,
      url: 'https://oase.unud.ac.id/mod/assign/view.php?id=76184',
      course: {
        id: 4718,
        fullname: 'Pemodelan dan Simulasi (Kelas A)',
      },
    },
  ];

  const events = convertMoodleTasksToOaseEvents(sampleTasks);

  assert.equal(events.length, 2);

  // Verifikasi event pertama
  const e1 = events[0];
  assert.equal(e1.uid, '49438@oase.unud.ac.id');
  assert.equal(e1.summary, 'Pengumpulan UTS is due');
  assert.equal(e1.cleanTitle, 'Pengumpulan UTS');
  assert.equal(e1.courseName, 'Basis Data Lanjut (Kelas A)');
  assert.equal(e1.eventType, 'exam');
  assert.equal(e1.start.getTime(), 1791734400 * 1000);
  assert.equal(e1.end.getTime(), (1791734400 + 3600) * 1000);
  assert.ok(e1.cleanDescription.includes('hanya perwakilan kelompok'));
  assert.equal(e1.links.length, 2);
  assert.equal(e1.links[0].label, 'Buka Tugas di OASE');
  assert.equal(e1.links[1].label, 'Add submission');

  // Verifikasi event kedua (deadline point-in-time tanpa durasi jika timeduration 0)
  const e2 = events[1];
  assert.equal(e2.uid, '41242@oase.unud.ac.id');
  assert.equal(e2.courseName, 'Pemodelan dan Simulasi (Kelas A)');
  assert.equal(e2.start.getTime(), 1796400000 * 1000);
  assert.equal(e2.end.getTime(), e2.start.getTime());
  assert.equal(e2.links.length, 1);
});

test('Moodle: convertMoodleTasksToOaseEvents handles empty or malformed tasks list', () => {
  const emptyEvents = convertMoodleTasksToOaseEvents([]);
  assert.equal(emptyEvents.length, 0);

  // Task tanpa course atau action
  const minimalTask: MoodleActionEvent = {
    id: 99999,
    name: 'Tugas Mandiri',
    modulename: 'assign',
    timestart: 1791734400,
  };
  const parsed = convertMoodleTasksToOaseEvents([minimalTask]);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].cleanTitle, 'Tugas Mandiri');
  assert.equal(parsed[0].courseName, 'Umum');
  assert.equal(parsed[0].eventType, 'assignment');
});

