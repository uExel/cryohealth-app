/** "2h ago" / "Just now" style relative time from a server ISO timestamp. English only —
 *  screens compose their own Urdu wrapper text around this where needed. */
export function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const TIER_LABEL_UR: Record<'normal' | 'watch' | 'high' | 'critical', string> = {
  normal: 'عام',
  watch: 'نگرانی',
  high: 'زیادہ خطرہ',
  critical: 'بحران',
};
