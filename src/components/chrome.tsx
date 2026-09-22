/** App chrome: logo, app bar, sync banner, tab bar, SOS sheet. Geometry from design/styles.ts. */
import { useRouter } from "expo-router";
import { ChevronRight, Phone, Settings2, X } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useStyles } from "../design/styles";
import { bannerFor, useTheme } from "../design/theme";
import { runSync } from "../lib/sync";
import { useApp } from "../state/app";

/** Glacier peak crossed by a pulse trace — exact paths from the design reference
 *  (CryoHealth Screen.dc.html). One colour, both strokes equal; stroke steps up as
 *  the mark shrinks (DESIGN_SYSTEM §12: 3.4 ≥44px, 4.2 ~26px, 5.4 ~17px). */
export const Logo = ({
  size = 26,
  color,
}: {
  size?: number;
  color?: string;
}) => {
  const t = useTheme();
  const stroke = size >= 44 ? 3.4 : size >= 22 ? 4.2 : 5.4;
  const c = color ?? t.color.accent;
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        d="M24 7 43 40H5L24 7Z"
        stroke={c}
        strokeWidth={stroke}
        strokeLinejoin="round"
      />
      <Path
        d="M2 30h8l3.5-6.5L18 37l4.5-9 2.6 4H46"
        stroke={c}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

/** One word: CRYO 800 + HEALTH 400, tracking −0.03em (DESIGN_SYSTEM §12). */
export const Wordmark = ({
  size = 40,
  color,
}: {
  size?: number;
  color?: string;
}) => {
  const t = useTheme();
  const c = color ?? t.color.text;
  return (
    <Text
      style={{
        fontSize: size,
        lineHeight: size,
        letterSpacing: -0.03 * size,
        color: c,
      }}
    >
      <Text style={{ fontFamily: "Archivo-ExtraBold" }}>CRYO</Text>
      <Text style={{ fontFamily: "Archivo-Regular" }}>HEALTH</Text>
    </Text>
  );
};

export const AppBar = ({ title, sub }: { title: string; sub?: string }) => {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { lang, setLang, setSosOpen } = useApp();
  return (
    // Safe-area top inset varies by device (notch/Dynamic Island height differs
    // across iPhone models) — padding it here, on a wrapper separate from the
    // fixed-height row below, keeps the row's own height/alignment untouched
    // while still clearing the status bar on every device, not just whichever
    // one this was last measured against.
    <View style={{ paddingTop: insets.top, backgroundColor: t.color.bg }}>
      <View style={s.appBar}>
        <Logo />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.appBarTitle} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
          {sub ? (
            <Text style={s.appBarSub} numberOfLines={1} ellipsizeMode="tail">
              {sub}
            </Text>
          ) : null}
        </View>
        <Pressable
          accessibilityLabel="Settings"
          style={s.btnIcon}
          onPress={() => router.push("/settings")}
        >
          <Settings2 size={18} color={t.color.text} strokeWidth={2.2} />
        </Pressable>
        <Pressable
          accessibilityLabel="Switch language"
          style={s.btnIcon}
          onPress={() => setLang(lang === "en" ? "ur" : "en")}
        >
          <Text style={[s.footnote, { color: t.color.text }]}>
            {lang === "en" ? "اردو" : "EN"}
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel="SOS — emergency options"
          style={[
            s.btnDanger,
            { minHeight: t.size.minTouch, paddingHorizontal: 12 },
          ]}
          onPress={() => setSosOpen(true)}
        >
          <Phone size={15} color="#fff" strokeWidth={2.4} />
          <Text style={s.btnDangerLabel}>SOS</Text>
        </Pressable>
      </View>
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
        <Pressable
          style={[s.bannerRetry, { borderColor: b.fg }]}
          onPress={() => void runSync(setNet)}
        >
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
    [
      "Call rescue 1122",
      "Needs signal — dials as soon as you have any network",
    ],
    ["Nearest facility: Hassanabad BHU", "Directions work offline"],
    ["Nearest high ground", "Saved route — works offline"],
  ];
  return (
    <Modal
      visible={sosOpen}
      transparent
      animationType="none"
      onRequestClose={() => setSosOpen(false)}
    >
      <View style={s.scrim}>
        <View style={s.sheet}>
          <View style={[s.sheetRow, { borderTopWidth: 0 }]}>
            <Text style={[s.title3, { flex: 1 }]}>Emergency</Text>
            <Pressable
              accessibilityLabel="Close"
              style={s.btnIcon}
              onPress={() => setSosOpen(false)}
            >
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
export const Chromed = ({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) => {
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
  return () => router.push("/critical");
};
