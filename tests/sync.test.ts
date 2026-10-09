import test from 'node:test';
import assert from 'node:assert/strict';
import { isEventChanged } from '../lib/diff.ts';
import type { OaseEvent } from '../types/calendar.ts';

test('isEventChanged detects unchanged events correctly', () => {
  const incomingDate = new Date('2026-10-10T15:00:00.000Z');
  const incomingEnd = new Date('2026-10-10T15:30:00.000Z');

  const incoming: OaseEvent = {
    uid: '41236@oase.unud.ac.id',
    summary: 'TM1. Review Paper is due',
    cleanTitle: 'TM1. Review Paper',
    description: 'Review paper template',
    cleanDescription: 'Review paper template',
    courseName: 'Pemodelan dan Simulasi',
    eventType: 'assignment',
    start: incomingDate,
    end: incomingEnd,
    isDeadline: true,
    links: [],
  };

  const formattedDesc = '📚 Mata Kuliah: Pemodelan dan Simulasi\nCatatan:\nReview paper template';

  const existing = {
    summary: 'TM1. Review Paper is due',
    description: formattedDesc,
    start: { dateTime: incomingDate.toISOString() },
    end: { dateTime: incomingEnd.toISOString() },
  };

  assert.equal(isEventChanged(existing, incoming, formattedDesc), false);
});

test('isEventChanged detects summary and time modifications', () => {
  const originalDate = new Date('2026-10-10T15:00:00.000Z');
  const postponedDate = new Date('2026-10-12T15:00:00.000Z');

  const incoming: OaseEvent = {
    uid: '41236@oase.unud.ac.id',
    summary: 'TM1. Review Paper is due (Diperpanjang)',
    cleanTitle: 'TM1. Review Paper (Diperpanjang)',
    description: 'Review paper template',
    cleanDescription: 'Review paper template',
    courseName: 'Pemodelan dan Simulasi',
    eventType: 'assignment',
    start: postponedDate,
    end: new Date(postponedDate.getTime() + 30 * 60 * 1000),
    isDeadline: true,
    links: [],
  };

  const formattedDesc = '📚 Mata Kuliah: Pemodelan dan Simulasi';

  // 1. Waktu berbeda
  const existingSameSummary = {
    summary: incoming.summary,
    description: formattedDesc,
    start: { dateTime: originalDate.toISOString() },
    end: { dateTime: new Date(originalDate.getTime() + 30 * 60 * 1000).toISOString() },
  };
  assert.equal(isEventChanged(existingSameSummary, incoming, formattedDesc), true);

  // 2. Judul berbeda
  const existingDifferentSummary = {
    summary: 'TM1. Review Paper is due',
    description: formattedDesc,
    start: { dateTime: postponedDate.toISOString() },
    end: { dateTime: new Date(postponedDate.getTime() + 30 * 60 * 1000).toISOString() },
  };
  assert.equal(isEventChanged(existingDifferentSummary, incoming, formattedDesc), true);
});
