export const RETENTION_BLOCK_DAYS = 30;
export const RETENTION_FIRST_CLEANUP_DAYS = 60;
const DAY_MS = 24 * 60 * 60 * 1000;

/** After 60 elapsed days, discard the first 30-day block, then advance every 30 days.
 * A fixed DB anchor (not the oldest remaining row) prevents schedule drift.
 */
export function retentionWindow(anchor: Date, now: Date): { cutoff: Date | null; nextCleanup: Date } {
  const age = now.getTime() - anchor.getTime();
  const blocks = Math.floor(age / (RETENTION_BLOCK_DAYS * DAY_MS));
  const cutoff = blocks >= 2
    ? new Date(anchor.getTime() + (blocks - 1) * RETENTION_BLOCK_DAYS * DAY_MS)
    : null;
  const nextBlock = Math.max(2, blocks + 1);
  return { cutoff, nextCleanup: new Date(anchor.getTime() + nextBlock * RETENTION_BLOCK_DAYS * DAY_MS) };
}
