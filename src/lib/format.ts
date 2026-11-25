import type { Lang, Tier } from '../design/theme';
import { TIER_LABEL } from '../design/theme';
import { translate } from './strings';

/** "2h ago" / "Just now" from a server ISO timestamp, in the given language (English by default). */
export function relativeTime(iso: string, lang: Lang = 'en'): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return translate(lang, 'time.justNow');
  if (minutes < 60) return translate(lang, 'time.minutesAgo', { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return translate(lang, 'time.hoursAgo', { n: hours });
  const days = Math.floor(hours / 24);
  return translate(lang, 'time.daysAgo', { n: days });
}

export const TIER_LABEL_UR: Record<Tier, string> = {
  normal: 'عام',
  watch: 'نگرانی',
  high: 'زیادہ خطرہ',
  critical: 'بحران',
};

/** The tier word shown to the user: English capitals, or the Urdu word. */
export const tierLabel = (tier: Tier, lang: Lang): string => (lang === 'ur' ? TIER_LABEL_UR[tier] : TIER_LABEL[tier]);
