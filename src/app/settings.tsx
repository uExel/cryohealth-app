import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import withObservables from '@nozbe/with-observables';
import { Chromed } from '../components/chrome';
import { BtnSecondary, BtnText, SectionLabel, Seg, Toggle } from '../components/ui';
import { useStyles } from '../design/styles';
import { useTheme } from '../design/theme';
import { useApp } from '../state/app';
import { VALLEYS } from '../lib/mock';
import { database } from '../lib/db';
import { LakeModel } from '../lib/db/models/LakeModel';
import { AlertModel } from '../lib/db/models/AlertModel';
import { ProtocolModel } from '../lib/db/models/ProtocolModel';

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

export default function Settings() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const { mode, setMode, lang, setLang, themeName, setThemeName, net, setNet } = useApp();
  const [notif, setNotif] = useState(true);

  return (
    <Chromed title="Settings" sub={mode === 'chw' ? 'Zainab Karim · LHW' : 'No account'}>
      <ScrollView style={s.scroll}>
        <SectionLabel>Language</SectionLabel>
        <View style={{ paddingHorizontal: t.space.lg }}>
          <Seg options={['English', 'اردو']} value={lang === 'en' ? 'English' : 'اردو'} onChange={(v) => setLang(v === 'English' ? 'en' : 'ur')} />
        </View>

        <SectionLabel>Alerts for</SectionLabel>
        {VALLEYS.map((v) => (
          <View key={v} style={s.settingsRow}>
            <Text style={[s.bodyStrong, { flex: 1 }]}>{v}</Text>
          </View>
        ))}
        <View style={{ paddingHorizontal: t.space.lg }}>
          <BtnText label="Add a valley" />
        </View>

        <SectionLabel>Offline content</SectionLabel>
        {[['Lessons', '61 MB'], ['Map tiles', '32 MB'], ['Cases', '16 MB']].map(([k, v]) => (
          <View key={k} style={s.settingsRow}>
            <Text style={[s.bodyStrong, { flex: 1 }]}>{k}</Text>
            <Text style={s.footnote}>{v}</Text>
          </View>
        ))}
        <View style={{ paddingHorizontal: t.space.lg, gap: 6, paddingTop: 8 }}>
          <Text style={[s.footnote, { color: t.color.tier.watch }]}>2 items removed by the OS to free space</Text>
          <BtnText label="Re-download all · 3.9 MB" />
        </View>

        <SectionLabel>Notifications</SectionLabel>
        <View style={s.settingsRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.bodyStrong}>Critical alerts</Text>
            <Text style={s.footnote}>May be silenced by Focus mode</Text>
          </View>
          <Toggle on={notif} onPress={() => setNotif(!notif)} />
        </View>

        <SectionLabel>Local data</SectionLabel>
        <ObservedSyncCounts />

        {/* Demo controls — let a reviewer walk every state without a backend. */}
        <SectionLabel>Demo</SectionLabel>
        <View style={{ paddingHorizontal: t.space.lg, gap: 10 }}>
          <Seg options={['public', 'chw']} value={mode} onChange={(v) => setMode(v as 'public' | 'chw')} />
          <Seg options={['light', 'dark', 'system']} value={themeName} onChange={(v) => setThemeName(v as never)} />
          <Seg options={['offline', 'syncing', 'failed', 'stale', 'online']} value={net} onChange={(v) => setNet(v as never)} />
        </View>

        <SectionLabel>Account</SectionLabel>
        <View style={{ paddingHorizontal: t.space.lg, paddingBottom: t.space.xxl, gap: 8 }}>
          {mode === 'chw' ? (
            <>
              <Text style={s.footnote}>Hassanabad UC · ID 44-2291</Text>
              <BtnSecondary label="Sign out" onPress={() => setMode('public')} />
            </>
          ) : (
            <BtnSecondary label="Log in (health workers only)" onPress={() => router.push('/login')} />
          )}
        </View>
      </ScrollView>
    </Chromed>
  );
}
