import test from 'node:test';
import assert from 'node:assert/strict';
import { isRestoreEligible, filterHistoryEntries, formatSizeMb } from './backupRules';
import { HistoryEntry } from '../types/index';

test('isRestoreEligible allows snapshots within 30 days', () => {
  const now = 1794268800000; // Reference timestamp
  const fiveDaysAgo = now - 5 * 24 * 60 * 60 * 1000;
  const result = isRestoreEligible(fiveDaysAgo, now);

  assert.equal(result.eligible, true);
  assert.equal(result.daysAgo, 5);
});

test('isRestoreEligible blocks snapshots older than 30 days', () => {
  const now = 1794268800000;
  const fortyDaysAgo = now - 40 * 24 * 60 * 60 * 1000;
  const result = isRestoreEligible(fortyDaysAgo, now);

  assert.equal(result.eligible, false);
  assert.equal(result.daysAgo, 40);
  assert.match(result.reason || '', /strictly 30 days/);
});

test('filterHistoryEntries correctly filters by category and query', () => {
  const mockEntries: HistoryEntry[] = [
    {
      id: '1',
      title: 'Q3 Revenue Dashboard Update',
      dateGroup: 'TODAY',
      timestamp: '10:14 AM',
      dateIso: '2026-11-10',
      preview: 'Revenue increased by 14%',
      userPrompt: 'Summarize Q3 data',
      aiSummary: ['Revenue up 14%'],
      category: 'tables',
      tags: ['Charts', 'Financial Agent'],
    },
    {
      id: '2',
      title: 'Python Data Cleansing Script',
      dateGroup: 'YESTERDAY',
      timestamp: '3:20 PM',
      dateIso: '2026-11-09',
      preview: 'Script for cleaning data',
      userPrompt: 'Can you write a script to cleanse CSV rows',
      aiSummary: ['Script generated using pandas'],
      category: 'code',
      tags: ['Python', 'Automation'],
    },
  ];

  // Category filter
  const codeOnly = filterHistoryEntries(mockEntries, '', 'code');
  assert.equal(codeOnly.length, 1);
  assert.equal(codeOnly[0].id, '2');

  // Search filter
  const searchResults = filterHistoryEntries(mockEntries, 'revenue', 'all');
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, '1');

  // No match
  const none = filterHistoryEntries(mockEntries, 'nonexistent', 'all');
  assert.equal(none.length, 0);
});

test('formatSizeMb formats sizes properly', () => {
  assert.equal(formatSizeMb(14.2), '14.2 MB');
  assert.equal(formatSizeMb(2048), '2.0 GB');
});
