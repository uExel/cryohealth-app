/** The user's chosen language, kept in the phone's secure storage next to the session. Both
 *  calls are safe on the startup path: a storage failure is logged and ignored, never thrown. */
import * as SecureStore from 'expo-secure-store';
import type { Lang } from '../design/theme';
import { parseLang, pickInitialLang } from './i18n';

export const LANG_KEY = 'cryohealth_lang';

/** The saved choice if there is a valid one, otherwise Urdu when the phone is set to Urdu and
 *  English when it is not. Never rejects. */
export async function loadLang(locale: string | null | undefined): Promise<Lang> {
  try {
    return pickInitialLang(await SecureStore.getItemAsync(LANG_KEY), locale);
  } catch (err) {
    console.warn('Saved language could not be read; using the phone language', err);
    return pickInitialLang(null, locale);
  }
}

/** Remembers `lang` for the next launch. Never rejects. */
export async function saveLang(lang: Lang): Promise<void> {
  try {
    if (parseLang(lang)) await SecureStore.setItemAsync(LANG_KEY, lang);
  } catch (err) {
    console.warn('Language choice could not be saved', err);
  }
}
