/**
 * App-level state: mode / lang / net / theme, resolved once at the root.
 * `mode` is derived from the login session, never set directly: CHW mode (case entry,
 * protocol text that can contain dosing) requires a real health-worker login.
 * Leaf components read via useApp()/useTheme() — never useColorScheme() directly
 * (the app can be pinned to a theme in Settings; see DESIGN_SYSTEM §2).
 *
 * `lang` starts from the phone's language and is then replaced by the saved choice (lang-store.ts).
 * Urdu lays the whole tree out right-to-left through `LayoutDirection`, so switching language
 * is live: no restart. Text comes from `useApp().tr(key)` (lib/strings.ts).
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useColorScheme, View, ViewStyle } from 'react-native';
import { Lang, Mode, NetState, ThemeName, ThemeProvider } from '../design/theme';
import { useAuthStore } from './auth';
import { deviceLocale, isRtl, pickInitialLang } from '../lib/i18n';
import { loadLang, saveLang } from '../lib/lang-store';
import { StringKey, StringVars, translate } from '../lib/strings';

type AppState = {
  mode: Mode;
  lang: Lang;
  setLang: (l: Lang) => void;
  /** True when the current language reads right-to-left. */
  rtl: boolean;
  /** Interface text in the current language. */
  tr: (key: StringKey, vars?: StringVars) => string;
  net: NetState;
  setNet: (n: NetState) => void;
  themeName: ThemeName | 'system';
  setThemeName: (t: ThemeName | 'system') => void;
  sosOpen: boolean;
  setSosOpen: (v: boolean) => void;
};

const Ctx = createContext<AppState | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const system = useColorScheme();
  const mode: Mode = useAuthStore((st) => st.status) === 'authenticated' ? 'chw' : 'public';
  // Synchronous first guess from the phone's language, so a first launch on an Urdu phone does
  // not flash English; the saved choice (if any) replaces it as soon as storage answers.
  const [lang, setLangState] = useState<Lang>(() => pickInitialLang(null, deviceLocale()));
  // Set once the user picks a language, so a slow storage read can never undo their choice.
  const chosen = useRef(false);
  const [net, setNet] = useState<NetState>('offline');
  const [themeName, setThemeName] = useState<ThemeName | 'system'>('system');
  const [sosOpen, setSosOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadLang(deviceLocale()).then((saved) => {
      if (!cancelled && !chosen.current) setLangState(saved);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setLang = useCallback((next: Lang) => {
    chosen.current = true;
    setLangState(next);
    void saveLang(next);
  }, []);

  const tr = useCallback((key: StringKey, vars?: StringVars) => translate(lang, key, vars), [lang]);
  const rtl = isRtl(lang);

  const value = useMemo(
    () => ({ mode, lang, setLang, rtl, tr, net, setNet, themeName, setThemeName, sosOpen, setSosOpen }),
    [mode, lang, setLang, rtl, tr, net, themeName, sosOpen],
  );
  const resolved = themeName === 'system' ? (system === 'dark' ? 'dark' : 'light') : themeName;

  return (
    <Ctx.Provider value={value}>
      <ThemeProvider name={resolved} lang={lang}>
        {children}
      </ThemeProvider>
    </Ctx.Provider>
  );
};

export const useApp = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside AppProvider');
  return v;
};

/** Style that sets the layout direction of everything below it: rows run right-to-left and
 *  start/end swap sides. Needed again inside a `Modal`, which is a separate native root and
 *  does not inherit the direction of the screen behind it. */
export const directionStyle = (rtl: boolean): ViewStyle => ({ direction: rtl ? 'rtl' : 'ltr' });

/** Wraps the app so the whole tree follows the current language's direction. */
export const LayoutDirection = ({ children }: { children: React.ReactNode }) => {
  const { rtl } = useApp();
  return <View style={[{ flex: 1 }, directionStyle(rtl)]}>{children}</View>;
};
