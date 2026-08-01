/**
 * App-level state: mode / lang / net / theme, resolved once at the root.
 * Leaf components read via useApp()/useTheme() — never useColorScheme() directly
 * (the app can be pinned to a theme in Settings; see DESIGN_SYSTEM §2).
 */
import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Lang, Mode, NetState, ThemeName, ThemeProvider } from '../design/theme';

type AppState = {
  mode: Mode;
  setMode: (m: Mode) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
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
  const [mode, setMode] = useState<Mode>('chw');
  const [lang, setLang] = useState<Lang>('en');
  const [net, setNet] = useState<NetState>('offline');
  const [themeName, setThemeName] = useState<ThemeName | 'system'>('system');
  const [sosOpen, setSosOpen] = useState(false);

  const value = useMemo(
    () => ({ mode, setMode, lang, setLang, net, setNet, themeName, setThemeName, sosOpen, setSosOpen }),
    [mode, lang, net, themeName, sosOpen],
  );
  const resolved = themeName === 'system' ? (system === 'dark' ? 'dark' : 'light') : themeName;

  return (
    <Ctx.Provider value={value}>
      <ThemeProvider name={resolved}>{children}</ThemeProvider>
    </Ctx.Provider>
  );
};

export const useApp = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside AppProvider');
  return v;
};
