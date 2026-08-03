/** CRITICAL interstitial. Appears instantly (Stack animation: 'none'); no close X —
 *  dismiss is an explicit acknowledgement. Announces itself to the screen reader. */
import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, findNodeHandle, Platform, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TriangleAlert } from 'lucide-react-native';
import { useStyles } from '../design/styles';
import { useTheme } from '../design/theme';
import { CRITICAL } from '../lib/mock';

export default function Critical() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headRef = useRef<Text>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return; // findNodeHandle is native-only; web relies on role="alert"
    const node = findNodeHandle(headRef.current);
    if (node) AccessibilityInfo.setAccessibilityFocus(node);
  }, []);

  return (
    // s.critical's own paddingTop was a fixed guess (56px) tied to whichever device it
    // was last measured against — this is a fullScreenModal with no navigator safe-area
    // handling, so it's overridden here with the real per-device inset + breathing room.
    <View style={[s.critical, { paddingTop: insets.top + t.space.lg }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TriangleAlert size={18} color="#fff" strokeWidth={2.8} />
        <Text style={{ ...t.type.label, color: 'rgba(255,255,255,0.85)', letterSpacing: 2 }}>CRITICAL</Text>
      </View>
      <Text ref={headRef} accessibilityRole="alert" style={[s.criticalHead, { marginTop: 14 }]}>
        {CRITICAL.head}
      </Text>
      <Text style={s.criticalUrdu}>{CRITICAL.headUr}</Text>
      <View style={s.criticalRule} />
      <View style={{ gap: 13, flex: 1 }}>
        {CRITICAL.rows.map(([k, v]) => (
          <View key={k} style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={s.criticalKey}>{k}</Text>
            <Text style={s.criticalVal}>{v}</Text>
          </View>
        ))}
        <Text style={{ ...t.type.footnote, color: 'rgba(255,255,255,0.8)', marginTop: 'auto' }}>
          {CRITICAL.honest}
        </Text>
      </View>
      <Pressable
        style={{ minHeight: t.size.controlPrimary, backgroundColor: '#ffffff', justifyContent: 'center', paddingHorizontal: t.space.lg }}
        onPress={() => router.replace('/alert/1')}
      >
        <Text style={{ ...t.type.headline, fontSize: 16, color: t.color.tier.critical }}>See what to do</Text>
      </Pressable>
      <Pressable
        style={{ minHeight: t.size.control, borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', paddingHorizontal: t.space.lg, marginTop: 10 }}
        onPress={() => router.back()}
      >
        <Text style={{ ...t.type.headline, fontSize: 15, color: '#ffffff' }}>I have seen this</Text>
      </Pressable>
    </View>
  );
}
