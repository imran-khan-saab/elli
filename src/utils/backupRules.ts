import { HistoryEntry, Snapshot } from '../types/index';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_RETENTION_DAYS = 30;

/**
 * Checks if a backup snapshot is eligible for restoration.
 * Per policy: Only one month of commands and snapshots can be restored.
 */
export function isRestoreEligible(
  snapshotTimestamp: number,
  currentTimestamp: number = Date.now(),
  maxDays: number = MAX_RETENTION_DAYS
): { eligible: boolean; daysAgo: number; reason?: string } {
  const diffMs = currentTimestamp - snapshotTimestamp;
  const daysAgo = Math.floor(diffMs / ONE_DAY_MS);

  if (diffMs < 0) {
    return { eligible: true, daysAgo: 0 };
  }

  if (daysAgo > maxDays) {
    return {
      eligible: false,
      daysAgo,
      reason: `Snapshot is ${daysAgo} days old. Restore limit is strictly 30 days (1 month).`,
    };
  }

  return { eligible: true, daysAgo };
}

/**
 * Filters history items by search query and category pill.
 */
export function filterHistoryEntries(
  entries: HistoryEntry[],
  searchQuery: string,
  categoryFilter: 'all' | 'code' | 'tables' | 'system' | 'files'
): HistoryEntry[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return entries.filter((entry) => {
    // Category match
    if (categoryFilter !== 'all' && entry.category !== categoryFilter) {
      return false;
    }

    // Query match
    if (!normalizedQuery) {
      return true;
    }

    const matchTitle = entry.title.toLowerCase().includes(normalizedQuery);
    const matchPrompt = entry.userPrompt.toLowerCase().includes(normalizedQuery);
    const matchTags = entry.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));
    const matchSummary = entry.aiSummary.some((s) => s.toLowerCase().includes(normalizedQuery));

    return matchTitle || matchPrompt || matchTags || matchSummary;
  });
}

/**
 * Formats size in MB to a clean human string.
 */
export function formatSizeMb(sizeMb: number): string {
  if (sizeMb >= 1024) {
    return `${(sizeMb / 1024).toFixed(1)} GB`;
  }
  return `${sizeMb.toFixed(1)} MB`;
}
