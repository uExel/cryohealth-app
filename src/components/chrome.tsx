/** App chrome: logo, app bar, sync banner, tab bar, SOS sheet. Geometry from design/styles.ts. */
import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Phone, X, ChevronRight, Settings2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { bannerFor, useTheme } from '../design/theme';
import { useStyles } from '../design/styles';
import { useApp } from '../state/app';

/** Glacier peak crossed by a pulse trace; equal stroke weights, no fill (DESIGN_SYSTEM §12). */
export const Logo = ({ size = 26, color }: { size?: number; color?: string }) => {
  const t = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path d="M3 26 L13 8 L19 18 L24 10 L29 26" stroke={color ?? t.color.accent} strokeWidth={4.2} strokeLinejoin="round" strokeLinecap="round" />
      <Path d="M2 20 h7 l3 -5 4 8 3 -4 h11" stroke={color ?? t.color.text} strokeWidth={4.2} strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
};

export const AppBar = ({ title, sub }: { title: string; sub?: string }) => {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const { lang, setLang, setSosOpen } = useApp();
  return (
    <View style={s.appBar}>
      <Logo />
      <View style={{ flex: 1 }}>
        <Text style={s.appBarTitle}>{title}</Text>
        {sub ? <Text style={s.appBarSub}>{sub}</Text> : null}
      </View>
      <Pressable accessibilityLabel="Settings" style={s.btnIcon} onPress={() => router.push('/settings')}>
        <Settings2 size={18} color={t.color.text} strokeWidth={2.2} />
      </Pressable>
      <Pressable
        accessibilityLabel="Switch language"
        style={s.btnIcon}
        onPress={() => setLang(lang === 'en' ? 'ur' : 'en')}
      >
        <Text style={[s.footnote, { color: t.color.text }]}>{lang === 'en' ? 'اردو' : 'EN'}</Text>
      </Pressable>
      <Pressable
        accessibilityLabel="SOS — emergency options"
        style={[s.btnDanger, { minHeight: t.size.minTouch, paddingHorizontal: 12 }]}
        onPress={() => setSosOpen(true)}
      >
        <Phone size={15} color="#fff" strokeWidth={2.4} />
        <Text style={s.btnDangerLabel}>SOS</Text>
      </Pressable>
    </View>
  );
};

/** Hidden when online (bannerFor returns null). */
export const SyncBanner = () => {
  const t = useTheme();
  const s = useStyles();
  const { net, setNet } = useApp();
  const b = bannerFor(t, net);
  if (!b) return null;
  return (
    <View style={[s.banner, { backgroundColor: b.bg }]}>
      <Text style={[s.bannerText, { color: b.fg }]}>{b.text}</Text>
      {b.retry ? (
        <Pressable style={[s.bannerRetry, { borderColor: b.fg }]} onPress={() => setNet('syncing')}>
          <Text style={[s.bannerRetryLabel, { color: b.fg }]}>SYNC NOW</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

/** SOS sheet: 50% scrim, 3px critical top rule, square, offline-annotated rows. */
export const SosSheet = () => {
  const t = useTheme();
  const s = useStyles();
  const { sosOpen, setSosOpen } = useApp();
  const rows: [string, string][] = [
    ['Call rescue 1122', 'Needs signal — dials as soon as you have any network'],
    ['Nearest facility: Hassanabad BHU', 'Directions work offline'],
    ['Nearest high ground', 'Saved route — works offline'],
  ];
  return (
    <Modal visible={sosOpen} transparent animationType="none" onRequestClose={() => setSosOpen(false)}>
      <View style={s.scrim}>
        <View style={s.sheet}>
          <View style={[s.sheetRow, { borderTopWidth: 0 }]}>
            <Text style={[s.title3, { flex: 1 }]}>Emergency</Text>
            <Pressable accessibilityLabel="Close" style={s.btnIcon} onPress={() => setSosOpen(false)}>
              <X size={20} color={t.color.text} strokeWidth={2.4} />
            </Pressable>
          </View>
          {rows.map(([head, note]) => (
            <Pressable key={head} style={s.sheetRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.headline}>{head}</Text>
                <Text style={s.footnote}>{note}</Text>
              </View>
              <ChevronRight size={18} color={t.color.muted} strokeWidth={2.2} />
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
};

export const BareScreen = ({ children }: { children: React.ReactNode }) => {
  const s = useStyles();
  return <View style={s.screen}>{children}</View>;
};

/** Chromed screen shell: app bar + sync banner above content. Tab bar comes from the navigator. */
export const Chromed = ({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) => {
  const s = useStyles();
  return (
    <View style={s.screen}>
      <AppBar title={title} sub={sub} />
      <SyncBanner />
      {children}
      <SosSheet />
    </View>
  );
};

export const useNavToCritical = () => {
  const router = useRouter();
  return () => router.push('/critical');
};
