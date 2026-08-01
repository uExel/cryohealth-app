import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, BookOpen, HeartPulse, House, Mountain } from 'lucide-react-native';
import { useTheme } from '../../design/theme';
import { useStyles } from '../../design/styles';

const TABS = [
  { name: 'home', label: 'HOME', Icon: House },
  { name: 'alerts', label: 'ALERTS', Icon: Bell, badge: 1 },
  { name: 'health', label: 'HEALTH', Icon: HeartPulse },
  { name: 'map', label: 'LAKES', Icon: Mountain },
  { name: 'learn', label: 'LEARN', Icon: BookOpen },
];

// Structural props: expo-router and @react-navigation ship conflicting copies of
// BottomTabBarProps, so we type only what the bar actually uses.
type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
};

function UExTabBar({ state, navigation }: TabBarProps) {
  const t = useTheme();
  const s = useStyles();
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.tabBar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route: { key: string; name: string }, i: number) => {
        const spec = TABS.find((x) => x.name === route.name);
        if (!spec) return null;
        const active = state.index === i;
        const color = active ? t.color.accent : t.color.muted;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={spec.label}
            style={[s.tab, active && s.tabActive]}
            onPress={() => navigation.navigate(route.name)}
          >
            <spec.Icon size={23} color={color} strokeWidth={2.2} />
            <Text style={[s.tabLabel, active && s.tabLabelActive]}>{spec.label}</Text>
            {spec.badge ? (
              <View style={[s.tabBadge, { right: '50%', marginRight: -22 }]}>
                <Text style={s.tabBadgeLabel}>{spec.badge}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(p) => <UExTabBar {...p} />}>
      {TABS.map(({ name }) => (
        <Tabs.Screen key={name} name={name} />
      ))}
    </Tabs>
  );
}
