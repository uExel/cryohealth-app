import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import withObservables from '@nozbe/with-observables';
import { Chromed } from '../../components/chrome';
import { BtnSecondary, SectionLabel, Seg } from '../../components/ui';
import { useStyles } from '../../design/styles';
import { useTheme } from '../../design/theme';
import { useApp } from '../../state/app';
import { useAuthStore } from '../../state/auth';
import { database } from '../../lib/db';
import { LakeModel } from '../../lib/db/models/LakeModel';
import { AlertModel } from '../../lib/db/models/AlertModel';
import { ProtocolModel } from '../../lib/db/models/ProtocolModel';

/** Row counts for the three read-through sync caches. Lets a field report ("alerts
 *  aren't showing") be checked against the actual local table instead of guessed at from
 *  a screenshot of the rendered fallback state, which looks identical whether the table
 *  is genuinely empty or has rows the screen isn't rendering. */
function SyncCounts({ lakes, alerts, protocols }: { lakes: LakeModel[]; alerts: AlertModel[]; protocols: ProtocolModel[] }) {
  const s = useStyles();
  const rows: [string, number][] = [
    ['Lakes', lakes.length],
    ['Alerts', alerts.length],
    ['Protocols', protocols.length],
  ];
  return (
    <>
      {rows.map(([k, v]) => (
        <View key={k} style={s.settingsRow}>
          <Text style={[s.bodyStrong, { flex: 1 }]}>{k}</Text>
          <Text style={s.footnote}>{v} synced</Text>
        </View>
      ))}
    </>
  );
}

const ObservedSyncCounts = withObservables([], () => ({
  lakes: database.get<LakeModel>('lakes').query().observe(),
  alerts: database.get<AlertModel>('alerts').query().observe(),
  protocols: database.get<ProtocolModel>('protocols').query().observe(),
}))(SyncCounts);

const THEME_OPTIONS = ['Light', 'Dark', 'System'] as const;

export default function Settings() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const { mode, lang, setLang, themeName, setThemeName } = useApp();
  const name = useAuthStore((st) => st.name);
  const logout = useAuthStore((st) => st.logout);

  return (
    <Chromed title="Settings" sub={mode === 'chw' ? `${name ?? 'Health worker'} · LHW` : 'No account'} back>
      <ScrollView style={s.scroll}>
        <SectionLabel>Language</SectionLabel>
        <View style={{ paddingHorizontal: t.space.lg }}>
          <Seg options={['English', 'اردو']} value={lang === 'en' ? 'English' : 'اردو'} onChange={(v) => setLang(v === 'English' ? 'en' : 'ur')} />
        </View>

        <SectionLabel>Appearance</SectionLabel>
        <View style={{ paddingHorizontal: t.space.lg }}>
          <Seg
            options={[...THEME_OPTIONS]}
            value={themeName === 'light' ? 'Light' : themeName === 'dark' ? 'Dark' : 'System'}
            onChange={(v) => setThemeName(v === 'Light' ? 'light' : v === 'Dark' ? 'dark' : 'system')}
          />
        </View>

        <SectionLabel>Local data</SectionLabel>
        <ObservedSyncCounts />

        <SectionLabel>Account</SectionLabel>
        <View style={{ paddingHorizontal: t.space.lg, paddingBottom: t.space.xxl, gap: 8 }}>
          {mode === 'chw' ? (
            // logout() clears the stored token, which also switches the app back to public mode.
            <BtnSecondary label="Sign out" onPress={() => void logout()} />
          ) : (
            <BtnSecondary label="Log in (health workers only)" onPress={() => router.push('/login')} />
          )}
        </View>
      </ScrollView>
    </Chromed>
  );
}
