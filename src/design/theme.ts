/**
 * CryoHealth — theme tokens for React Native.
 * Generated from tokens.json. Do not hand-edit values here; edit tokens.json and regenerate.
 *
 *   const t = useTheme();            // inside components
 *   <View style={{ backgroundColor: t.color.bg }} />
 *
 * Rules this file enforces by shape:
 *  - radius is a single 0. There is no radius scale.
 *  - tier colors are only reachable through `color.tier[tier]` / `tierSoft`.
 *  - there is no shadow token. Nothing floats.
 */

import { Platform, TextStyle } from 'react-native';
import React, { createContext, useContext } from 'react';

export type ThemeName = 'light' | 'dark';
export type Tier = 'normal' | 'watch' | 'high' | 'critical';
export type NetState = 'offline' | 'syncing' | 'failed' | 'stale' | 'online';
export type Mode = 'public' | 'chw';
export type Lang = 'en' | 'ur';

/* ---------------------------------------------------------------- color -- */

const palette = {
  light: {
    bg: '#f2f6f9',
    surface: '#e6eef4',
    surface2: '#ffffff',
    text: '#16232c',
    muted: '#5b6f7c',
    line: 'rgba(22,35,44,0.32)',
    lineSoft: 'rgba(22,35,44,0.14)',
    accent: '#0f6ea8',
    accentInk: '#0a4d76',
    accentSoft: '#d5e7f2',
    onAccent: '#ffffff',
    onTier: '#ffffff',
    tier: { normal: '#1f7a4d', watch: '#a37700', high: '#d2600f', critical: '#c6231a' },
    tierSoft: { normal: '#d9eee3', watch: '#f6e9c4', high: '#fbe3cf', critical: '#f8d9d6' },
    scrim: 'rgba(0,0,0,0.5)',
  },
  dark: {
    bg: '#0d151a',
    surface: '#16232c',
    surface2: '#1d2d38',
    text: '#e7f0f5',
    muted: '#93a8b5',
    line: 'rgba(231,240,245,0.34)',
    lineSoft: 'rgba(231,240,245,0.14)',
    accent: '#4aa8dd',
    accentInk: '#9ed2f0',
    accentSoft: '#12303f',
    onAccent: '#ffffff',
    onTier: '#0d151a',
    tier: { normal: '#4bbd84', watch: '#e0b23c', high: '#f2873a', critical: '#ff6a5e' },
    tierSoft: { normal: '#123024', watch: '#332811', high: '#3a2211', critical: '#3d1512' },
    scrim: 'rgba(0,0,0,0.62)',
  },
};
// note 2026-08: `as const` removed from palette vs the design-project original — RN 0.86 TS
// narrows the literals so the dark palette no longer satisfies Theme.color. Values unchanged.

/* ----------------------------------------------------------------- type -- */

const FAMILY = {
  display: 'Archivo',
  body: 'Archivo',
  urdu: 'NotoNastaliqUrdu',
} as const;

/** Archivo is loaded as a variable/named-instance family. On Android the weight
 *  must come from the family name, not fontWeight.
 *  note 2026-08: web added to the named-family branch — expo-font registers one weight
 *  per family name, so the iOS-style branch gave web synthetic bold. */
const face = (weight: 400 | 600 | 800): TextStyle =>
  Platform.OS === 'android' || Platform.OS === 'web'
    ? { fontFamily: weight === 800 ? 'Archivo-ExtraBold' : weight === 600 ? 'Archivo-SemiBold' : 'Archivo-Regular' }
    : { fontFamily: 'Archivo', fontWeight: String(weight) as TextStyle['fontWeight'] };

export const type = {
  hero:       { ...face(800), fontSize: 56, lineHeight: 52, letterSpacing: -1.9 },
  display:    { ...face(800), fontSize: 40, lineHeight: 40, letterSpacing: -1.2 },
  title1:     { ...face(800), fontSize: 30, lineHeight: 32, letterSpacing: -0.8 },
  title2:     { ...face(800), fontSize: 24, lineHeight: 28, letterSpacing: -0.5 },
  title3:     { ...face(800), fontSize: 19, lineHeight: 22, letterSpacing: -0.4 },
  headline:   { ...face(800), fontSize: 17, lineHeight: 21, letterSpacing: -0.2 },
  body:       { ...face(400), fontSize: 16, lineHeight: 23 },
  bodyStrong: { ...face(600), fontSize: 16, lineHeight: 23 },
  callout:    { ...face(400), fontSize: 14, lineHeight: 20 },
  footnote:   { ...face(600), fontSize: 13, lineHeight: 18 },
  label:      { ...face(800), fontSize: 11, lineHeight: 14, letterSpacing: 1.2, textTransform: 'uppercase' as const },
  badge:      { ...face(800), fontSize: 11, lineHeight: 13, letterSpacing: 1.3, textTransform: 'uppercase' as const },
} satisfies Record<string, TextStyle>;

/** Nastaliq needs roughly double the leading and a touch more size. */
export const typeUrdu = {
  title1: { fontFamily: FAMILY.urdu, fontSize: 26, lineHeight: 50 },
  title3: { fontFamily: FAMILY.urdu, fontSize: 20, lineHeight: 40 },
  body:   { fontFamily: FAMILY.urdu, fontSize: 17, lineHeight: 34 },
  footnote: { fontFamily: FAMILY.urdu, fontSize: 15, lineHeight: 30 },
} satisfies Record<string, TextStyle>;

/* ------------------------------------------------------------- geometry -- */

export const space = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 26,
  screenX: 16,
  screenXWide: 20,
} as const;

export const size = {
  minTouch: 44,
  control: 52,
  controlPrimary: 58,
  listRow: 60,
  appBar: 56,
  tabBar: 62,
  tierBar: 8,
  alertBar: 10,
  checkbox: 26,
  toggleW: 46,
  toggleH: 28,
} as const;

export const border = { hairline: 1, rule: 2, tabIndicator: 3 } as const;
export const radius = 0 as const;

export const motion = {
  screen: { duration: 180 },
  banner: { duration: 140 },
  /** A warning never animates in. */
  critical: { duration: 0 },
} as const;

/* ---------------------------------------------------------------- theme -- */

export type Theme = {
  name: ThemeName;
  color: (typeof palette)['light'];
  type: typeof type;
  typeUrdu: typeof typeUrdu;
  space: typeof space;
  size: typeof size;
  border: typeof border;
  radius: typeof radius;
  motion: typeof motion;
  isDark: boolean;
};

export const themes: Record<ThemeName, Theme> = {
  light: { name: 'light', color: palette.light, type, typeUrdu, space, size, border, radius, motion, isDark: false },
  dark:  { name: 'dark',  color: palette.dark,  type, typeUrdu, space, size, border, radius, motion, isDark: true  },
};

const ThemeContext = createContext<Theme>(themes.light);

/** Resolve the theme once at the root and pass it down. Leaf components must not
 *  call useColorScheme() themselves — the app can be pinned to a theme in Settings. */
export const ThemeProvider = ({ name, children }: { name: ThemeName; children: React.ReactNode }) =>
  React.createElement(ThemeContext.Provider, { value: themes[name] }, children);

export const useTheme = () => useContext(ThemeContext);

/* ------------------------------------------------------------- semantics -- */

/** Sync banner presentation. `online` returns null — the banner is not rendered. */
export const bannerFor = (t: Theme, net: NetState) => {
  switch (net) {
    case 'offline': return { bg: t.color.text, fg: t.color.bg, text: 'Offline — showing saved information', retry: true };
    case 'syncing': return { bg: t.color.accent, fg: '#ffffff', text: 'Syncing… 2 of 5 items', retry: false };
    case 'failed':  return { bg: t.color.tier.watch, fg: t.isDark ? '#0d151a' : '#1a1300', text: 'Sync failed — tap to retry', retry: true };
    case 'stale':   return { bg: t.color.tier.watch, fg: t.isDark ? '#0d151a' : '#1a1300', text: 'Data is 3 days old', retry: true };
    default: return null;
  }
};

export const freshnessFor = (net: NetState) =>
  net === 'online' ? 'Live' : net === 'syncing' ? 'Updating' : net === 'stale' ? 'Old data' : net === 'failed' ? 'May be old' : 'Saved copy';

/** Tier label is never rendered from color alone — pair it with the icon name. */
export const TIER_LABEL: Record<Tier, string> = { normal: 'NORMAL', watch: 'WATCH', high: 'HIGH', critical: 'CRITICAL' };
export const TIER_ICON: Record<Tier, string> = { normal: 'check', watch: 'circle-alert', high: 'triangle-alert', critical: 'triangle-alert' };
