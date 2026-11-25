import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, HeartPulse, House, Mountain } from 'lucide-react-native';
import withObservables from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';
import { useTheme } from '../../design/theme';
import { useStyles } from '../../design/styles';
import { useApp } from '../../state/app';
import { formatNumber } from '../../lib/i18n';
import type { StringKey } from '../../lib/strings';
import { database } from '../../lib/db';
import { AlertModel } from '../../lib/db/models/AlertModel';
import { AlertReadModel } from '../../lib/db/models/AlertReadModel';
import { countUnreadCritical } from '../../lib/alert-state';

// Learn is hidden until real lesson content exists (it was all placeholder).
const TABS: { name: string; label: StringKey; Icon: typeof House }[] = [
  { name: 'home', label: 'tab.home', Icon: House },
  { name: 'alerts', label: 'tab.alerts', Icon: Bell },
  { name: 'health', label: 'tab.health', Icon: HeartPulse },
  { name: 'map', label: 'tab.lakes', Icon: Mountain },
];

/** Sub-screens live inside this navigator so the tab bar stays on screen
 *  (DESIGN_SYSTEM §5: every chromed screen has the tab bar). Each lights up the
 *  tab it belongs to; settings belongs to none. */
const SUB_SCREENS: Record<string, string | null> = {
  'alert/[id]': 'alerts',
  case: 'health',
  guidance: 'health',
  settings: null,
};

/** Red square badge = count of active CRITICAL alerts the user has not opened yet, and
 *  nothing else (DESIGN_SYSTEM §1: red means critical). Opening an alert (list tap or push
 *  tap) marks it read and lowers the count. Hidden at zero. */
function CriticalBadge({ alerts, reads }: { alerts: AlertModel[]; reads: AlertReadModel[] }) {
  const s = useStyles();
  const { lang, tr } = useApp();
  const count = countUnreadCritical(alerts, reads);
  if (count === 0) return null;
  return (
    <View
      // end / marginEnd, not right / marginRight: the badge sits on the tab's trailing corner in
      // both directions.
      style={[s.tabBadge, { end: '50%', marginEnd: -22 }]}
      accessibilityLabel={tr(count === 1 ? 'a11y.unreadCriticalOne' : 'a11y.unreadCriticalMany', { n: count })}
    >
      <Text style={s.tabBadgeLabel}>{formatNumber(count, lang)}</Text>
    </View>
  );
}

const ObservedCriticalBadge = withObservables([], () => ({
  alerts: database
    .get<AlertModel>('alerts')
    .query(Q.where('tier', 'critical'), Q.where('status', 'active'))
    .observe(),
  reads: database.get<AlertReadModel>('alert_reads').query().observe(),
}))(CriticalBadge);

// Structural props: expo-router and @react-navigation ship conflicting copies of
// BottomTabBarProps, so we type only what the bar actually uses.
type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
};

function UExTabBar({ state, navigation }: TabBarProps) {
  const t = useTheme();
  const s = useStyles();
  const { tr } = useApp();
  const insets = useSafeAreaInsets();
  const focused = state.routes[state.index]?.name;
  const activeTab = focused && focused in SUB_SCREENS ? SUB_SCREENS[focused] : focused;
  return (
    <View style={[s.tabBar, { paddingBottom: insets.bottom }]}>
      {TABS.map((spec) => {
        const active = activeTab === spec.name;
        const color = active ? t.color.accent : t.color.muted;
        return (
          <Pressable
            key={spec.name}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tr(spec.label)}
            style={[s.tab, active && s.tabActive]}
            onPress={() => navigation.navigate(spec.name)}
          >
            <spec.Icon size={23} color={color} strokeWidth={2.2} />
            <Text style={[s.tabLabel, active && s.tabLabelActive]}>{tr(spec.label)}</Text>
            {spec.name === 'alerts' ? <ObservedCriticalBadge /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    // "history": Back from a sub-screen returns to wherever you came from, not to Home.
    <Tabs backBehavior="history" screenOptions={{ headerShown: false }} tabBar={(p) => <UExTabBar {...p} />}>
      {TABS.map(({ name }) => (
        <Tabs.Screen key={name} name={name} />
      ))}
      {Object.keys(SUB_SCREENS).map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
  );
}
