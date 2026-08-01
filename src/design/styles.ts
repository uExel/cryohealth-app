/**
 * CryoHealth — shared StyleSheet factory.
 *
 *   const s = useStyles();
 *   <Pressable style={s.btnPrimary}><Text style={s.btnPrimaryLabel}>Log in</Text></Pressable>
 *
 * Every entry here matches the reference implementation in CryoHealth Screen.dc.html.
 * If a screen needs a one-off, compose: style={[s.card, { marginTop: t.space.lg }]}.
 * Do not create a parallel set of button/field styles in a screen file.
 */

import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

// note 2026-08: RN 0.86 types dropped StyleSheet.absoluteFillObject; same geometry inlined.
const absoluteFillObject = { position: 'absolute' as const, left: 0, right: 0, top: 0, bottom: 0 };
import { Theme, Tier, useTheme } from './theme';

export const makeStyles = (t: Theme) =>
  StyleSheet.create({
    /* ---------------------------------------------------------- surfaces */
    screen: { flex: 1, backgroundColor: t.color.bg },
    scroll: { flex: 1 },
    padX: { paddingHorizontal: t.space.screenX },
    padXWide: { paddingHorizontal: t.space.screenXWide },

    /** 2px between sections, 1px between rows. This is the only structure. */
    ruleStrong: { borderBottomWidth: t.border.rule, borderBottomColor: t.color.line },
    ruleSoft: { borderBottomWidth: t.border.hairline, borderBottomColor: t.color.lineSoft },
    ruleTopStrong: { borderTopWidth: t.border.rule, borderTopColor: t.color.line },
    ruleTopSoft: { borderTopWidth: t.border.hairline, borderTopColor: t.color.lineSoft },

    /** Grid whose gutters are the divider showing through. */
    gridCells: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: t.color.line, gap: 1 },
    cell: { backgroundColor: t.color.bg, padding: t.space.lg },

    /* -------------------------------------------------------------- type */
    hero: { ...t.type.hero, color: t.color.text },
    title1: { ...t.type.title1, color: t.color.text },
    title2: { ...t.type.title2, color: t.color.text },
    title3: { ...t.type.title3, color: t.color.text },
    headline: { ...t.type.headline, color: t.color.text },
    body: { ...t.type.body, color: t.color.text },
    bodyStrong: { ...t.type.bodyStrong, color: t.color.text },
    callout: { ...t.type.callout, color: t.color.muted },
    footnote: { ...t.type.footnote, color: t.color.muted },
    label: { ...t.type.label, color: t.color.muted },

    /* ----------------------------------------------------------- app bar */
    appBar: {
      height: t.size.appBar,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.sm + 2,
      paddingHorizontal: t.space.md + 2,
      backgroundColor: t.color.bg,
      borderBottomWidth: t.border.rule,
      borderBottomColor: t.color.line,
    },
    appBarTitle: { ...t.type.title3, color: t.color.text },
    appBarSub: { ...t.type.label, color: t.color.muted },

    /* ------------------------------------------------------ sync banner */
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.sm,
      paddingVertical: 7,
      paddingHorizontal: t.space.md + 2,
    },
    bannerText: { flex: 1, ...t.type.footnote },
    bannerRetry: { borderWidth: 1, paddingVertical: 4, paddingHorizontal: 8, minHeight: 0 },
    bannerRetryLabel: { ...t.type.badge, letterSpacing: 0.9 },

    /* ------------------------------------------------------- tier header */
    tierHeader: { paddingHorizontal: t.space.lg, paddingTop: t.space.xl, paddingBottom: 18 },
    tierHeaderKicker: { ...t.type.label, letterSpacing: 1.8 },
    tierHeaderName: { ...t.type.hero },
    tierHeaderPlace: { ...t.type.title3, marginTop: t.space.sm + 2 },
    tierHeaderLine: { ...t.type.body, marginTop: 6, maxWidth: 320 },

    /** Freshness stamp. Required on every screen that shows hazard data. */
    freshRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingVertical: 9,
      paddingHorizontal: t.space.lg,
      borderBottomWidth: t.border.rule,
      borderBottomColor: t.color.line,
    },
    freshText: { ...t.type.footnote, color: t.color.muted },
    freshState: { ...t.type.badge, color: t.color.muted, marginLeft: 'auto' },

    /* ---------------------------------------------------------- list row */
    hazardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
      minHeight: 64,
      paddingVertical: 13,
      paddingHorizontal: t.space.lg,
      borderTopWidth: t.border.hairline,
      borderTopColor: t.color.lineSoft,
    },
    tierBar: { width: t.size.tierBar, alignSelf: 'stretch' },
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
      minHeight: t.size.listRow,
      paddingVertical: t.space.md + 2,
      paddingHorizontal: t.space.lg,
      borderBottomWidth: t.border.hairline,
      borderBottomColor: t.color.lineSoft,
    },

    /* ------------------------------------------------------- alert card */
    alertCard: { flexDirection: 'row', backgroundColor: t.color.surface2, borderBottomWidth: 1, borderBottomColor: t.color.lineSoft },
    alertBar: { width: t.size.alertBar },
    alertBody: { flex: 1, padding: t.space.md + 2 },
    alertTitle: { ...t.type.title3, fontSize: 18, lineHeight: 22 },
    alertMeta: { ...t.type.footnote, color: t.color.muted, marginLeft: 'auto' },
    alertChip: { borderWidth: 1, borderColor: t.color.line, paddingVertical: 4, paddingHorizontal: 8 },
    alertChipLabel: { ...t.type.footnote, color: t.color.text },
    alertCleared: { opacity: 0.75 },

    /* ------------------------------------------------------ guidance card */
    guidanceCard: {
      backgroundColor: t.color.surface2,
      borderWidth: 1,
      borderColor: t.color.lineSoft,
      borderLeftWidth: t.size.tierBar,
      padding: t.space.md + 2,
    },
    guidanceStep: { ...t.type.label },
    guidanceHead: { ...t.type.title2, marginTop: 6 },
    guidanceWhy: { ...t.type.callout, color: t.color.muted, marginTop: 4 },
    guidanceNum: {
      width: 22, height: 22,
      backgroundColor: t.color.accent,
      alignItems: 'center', justifyContent: 'center',
    },
    guidanceNumLabel: { ...t.type.badge, color: t.color.onAccent, letterSpacing: 0 },
    /** Non-dismissible. Renders above every assistant result. */
    disclaimer: {
      flexDirection: 'row',
      gap: 9,
      paddingVertical: 11,
      paddingHorizontal: t.space.md + 2,
      backgroundColor: t.color.surface,
      borderBottomWidth: t.border.rule,
      borderBottomColor: t.color.line,
    },

    /* ----------------------------------------------------------- buttons */
    btnPrimary: {
      minHeight: t.size.controlPrimary,
      backgroundColor: t.color.accent,
      justifyContent: 'center',
      paddingHorizontal: t.space.lg,
    },
    btnPrimaryPressed: { backgroundColor: t.color.accentInk },
    btnPrimaryLabel: { ...t.type.headline, fontSize: 16, color: t.color.onAccent, textAlign: 'left' },

    btnSecondary: {
      minHeight: t.size.control,
      borderWidth: 1,
      borderColor: t.color.line,
      justifyContent: 'center',
      paddingHorizontal: t.space.lg,
    },
    btnSecondaryPressed: { backgroundColor: t.color.accentSoft },
    btnSecondaryLabel: { ...t.type.headline, fontSize: 15, color: t.color.text, textAlign: 'left' },

    /** Only SOS and call-rescue. Never delete, never a form error. */
    btnDanger: {
      minHeight: t.size.control,
      backgroundColor: t.color.tier.critical,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
      paddingHorizontal: t.space.lg,
    },
    btnDangerLabel: { ...t.type.headline, fontSize: 15, color: '#ffffff' },

    btnText: { minHeight: 48, justifyContent: 'center' },
    btnTextLabel: { ...t.type.headline, fontSize: 15, color: t.color.accent, textAlign: 'left' },

    btnIcon: {
      width: t.size.minTouch, height: t.size.minTouch,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: t.color.line,
    },
    btnDisabled: { opacity: 0.45 },

    /* ------------------------------------------------------------ fields */
    fieldLabel: { ...t.type.label, marginBottom: 6 },
    field: {
      borderWidth: t.border.rule,
      borderColor: t.color.line,
      minHeight: 54,
      justifyContent: 'center',
      paddingHorizontal: t.space.md,
      backgroundColor: t.color.surface2,
    },
    fieldText: { ...t.type.bodyStrong, fontSize: 17 },
    /** Amber, not red. Red is reserved for CRITICAL. */
    fieldError: { borderColor: t.color.tier.watch },
    fieldErrorText: { ...t.type.footnote, color: t.color.tier.watch, marginTop: 6 },
    fieldPrefix: {
      alignSelf: 'stretch',
      justifyContent: 'center',
      paddingHorizontal: t.space.md,
      borderRightWidth: t.border.rule,
      borderRightColor: t.color.line,
      backgroundColor: t.color.surface,
    },

    checkbox: {
      width: t.size.checkbox, height: t.size.checkbox,
      borderWidth: t.border.rule, borderColor: t.color.line,
      alignItems: 'center', justifyContent: 'center',
    },
    checkboxOn: { backgroundColor: t.color.accent },
    checkRow: {
      flexDirection: 'row', alignItems: 'center', gap: t.space.md,
      minHeight: t.size.listRow,
      paddingVertical: t.space.md, paddingHorizontal: t.space.lg,
      borderTopWidth: 1, borderTopColor: t.color.lineSoft,
    },

    toggleTrack: { width: t.size.toggleW, height: t.size.toggleH, backgroundColor: t.color.surface, borderWidth: 1, borderColor: t.color.line },
    toggleTrackOn: { backgroundColor: t.color.accent, borderWidth: 0 },
    toggleKnob: { position: 'absolute', top: 2, left: 2, width: 22, height: 22, backgroundColor: t.color.muted },
    toggleKnobOn: { top: 3, left: undefined, right: 3, backgroundColor: '#ffffff' },

    seg: { flexDirection: 'row', borderWidth: t.border.rule, borderColor: t.color.line },
    segOpt: { flex: 1, minHeight: t.size.control, alignItems: 'center', justifyContent: 'center' },
    segOptOn: { backgroundColor: t.color.text },
    segLabel: { ...t.type.headline, fontSize: 15, color: t.color.text },
    segLabelOn: { color: t.color.bg },

    /* ----------------------------------------------------------- tab bar */
    tabBar: { flexDirection: 'row', borderTopWidth: t.border.rule, borderTopColor: t.color.line, backgroundColor: t.color.bg },
    tab: { flex: 1, minHeight: t.size.tabBar, alignItems: 'center', justifyContent: 'center', gap: 3, borderTopWidth: t.border.tabIndicator, borderTopColor: 'transparent', paddingVertical: 4 },
    tabActive: { borderTopColor: t.color.accent },
    tabLabel: { ...t.type.badge, fontSize: 10.5, letterSpacing: 0.4, color: t.color.muted },
    tabLabelActive: { color: t.color.accent },
    /** Square. Never a circle. */
    tabBadge: {
      position: 'absolute', top: 8, minWidth: 16, height: 16,
      backgroundColor: t.color.tier.critical,
      alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
    },
    tabBadgeLabel: { ...t.type.badge, fontSize: 10, letterSpacing: 0, color: '#ffffff' },

    /* ------------------------------------------------- overlays (only 2) */
    scrim: { ...absoluteFillObject, backgroundColor: t.color.scrim, justifyContent: 'flex-end' },
    sheet: { backgroundColor: t.color.bg, borderTopWidth: 3, borderTopColor: t.color.tier.critical },
    sheetRow: {
      flexDirection: 'row', alignItems: 'center', gap: t.space.md,
      minHeight: 64, paddingVertical: t.space.md + 2, paddingHorizontal: t.space.lg,
      borderTopWidth: 1, borderTopColor: t.color.lineSoft,
    },
    /** Appears instantly — do not animate. */
    critical: {
      ...absoluteFillObject,
      backgroundColor: t.color.tier.critical,
      paddingTop: 56, paddingHorizontal: 22, paddingBottom: 28,
    },
    criticalHead: { ...t.type.hero, fontSize: 52, lineHeight: 49, color: '#ffffff' },
    criticalUrdu: { ...t.typeUrdu.title1, fontSize: 26, lineHeight: 50, color: '#ffffff' },
    criticalRule: { height: 2, backgroundColor: 'rgba(255,255,255,0.45)', marginVertical: t.space.xl },
    criticalKey: { ...t.type.label, color: 'rgba(255,255,255,0.7)', width: 82 },
    criticalVal: { ...t.type.bodyStrong, fontSize: 18, color: '#ffffff', flex: 1 },
  });

export const useStyles = () => {
  const t = useTheme();
  return useMemo(() => makeStyles(t), [t]);
};

/* -------------------------------------------------------- tier helpers -- */

/** Solid bar / icon / badge text. Never body copy. */
export const tierColor = (t: Theme, tier: Tier) => t.color.tier[tier];

/** Badge and wash fills. Text on this is `color.text` or the tier solid. */
export const tierSoft = (t: Theme, tier: Tier) => t.color.tierSoft[tier];

/** CRITICAL inverts: solid fill, white text. Every other tier uses the soft fill. */
export const tierBadgeStyle = (t: Theme, tier: Tier) =>
  tier === 'critical'
    ? { bg: t.color.tier.critical, fg: '#ffffff' }
    : { bg: t.color.tierSoft[tier], fg: t.color.tier[tier] };
