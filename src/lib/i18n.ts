/** Language helpers. Pure and dependency-free so they can be unit-tested; screens read the
 *  current language from `useApp()`. Only English and Urdu exist. */
import type { Lang } from '../design/theme';

export const LANGS: readonly Lang[] = ['en', 'ur'];

/** Narrows an unknown stored value to a language, or null if it is not one. */
export const parseLang = (value: unknown): Lang | null => (value === 'en' || value === 'ur' ? value : null);

/** "ur", "ur-PK", "ur_PK" and "urd" all mean Urdu; anything else (or nothing) means English. */
export const langFromLocale = (locale: string | null | undefined): Lang =>
  (locale ?? '').trim().toLowerCase().startsWith('ur') ? 'ur' : 'en';

/** A saved choice always wins; with none, follow the phone's language. */
export const pickInitialLang = (saved: unknown, locale: string | null | undefined): Lang =>
  parseLang(saved) ?? langFromLocale(locale);

/** The phone's language tag, or undefined if the runtime cannot say. Never throws. */
export const deviceLocale = (): string | undefined => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    return undefined;
  }
};

/** Urdu is right-to-left. */
export const isRtl = (lang: Lang): boolean => lang === 'ur';

const URDU_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** 0-9 become the Urdu (extended Arabic-Indic) digits ۰-۹. */
export const toUrduDigits = (text: string): string => text.replace(/[0-9]/g, (d) => URDU_DIGITS[Number(d)]);

/** Digits in the language's own script; a no-op for English. */
export const localizeDigits = (text: string, lang: Lang): string => (lang === 'ur' ? toUrduDigits(text) : text);

/** 1234.5 -> "1,234.5" in English, "۱٬۲۳۴٫۵" in Urdu. The English form is pinned to en-US so it
 *  does not change with the phone's region. */
export const formatNumber = (n: number, lang: Lang): string => {
  const base = n.toLocaleString('en-US');
  return lang === 'ur' ? toUrduDigits(base).replace(/,/g, '٬').replace(/\./g, '٫') : base;
};
