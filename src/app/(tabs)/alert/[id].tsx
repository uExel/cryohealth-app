import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import withObservables from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';
import { Chromed } from '../../../components/chrome';
import { TierBadge } from '../../../components/hazard';
import { CheckRow, SectionLabel } from '../../../components/ui';
import { useStyles } from '../../../design/styles';
import { useTheme } from '../../../design/theme';
import { useApp } from '../../../state/app';
import { database } from '../../../lib/db';
import { AlertModel } from '../../../lib/db/models/AlertModel';
import { markAlertRead } from '../../../lib/alert-state';

function AlertDetail({ alerts }: { alerts: AlertModel[] }) {
  const t = useTheme();
  const s = useStyles();
  const { lang } = useApp();
  const alert = alerts[0];
  const checklist = alert?.checklist ?? [];
  const [done, setDone] = useState<boolean[]>(checklist.map(() => false));

  // Opening an alert (from the list, a push tap or a link) is what marks it read. Keyed on the
  // remote id, so it runs once per alert and survives every sync.
  const remoteId = alert?.remoteId;
  useEffect(() => {
    if (remoteId) void markAlertRead(remoteId).catch((err: unknown) => console.warn('Could not mark alert read', err));
  }, [remoteId]);

  if (!alert) {
    return (
      <Chromed title="Alert" back>
        <View style={{ padding: t.space.lg }}>
          <Text style={s.callout}>This alert isn&apos;t on this phone yet. Connect to sync.</Text>
        </View>
      </Chromed>
    );
  }

  const facts: [string, string][] = [];
  if (alert.downstreamSummary) facts.push(['Area', alert.downstreamSummary]);
  const window = [alert.windowStart, alert.windowEnd].filter(Boolean).join(' – ');
  if (window) facts.push(['Window', window]);

  return (
    <Chromed title="Alert" sub={alert.downstreamSummary ?? undefined} back>
      <ScrollView style={s.scroll}>
        <View style={{ padding: t.space.lg, gap: 10 }}>
          <TierBadge tier={alert.tier} />
          <Text style={s.title1}>{alert.title}</Text>
          {lang === 'ur' && alert.bodyUr ? (
            <Text style={[s.callout, { writingDirection: 'rtl', textAlign: 'right' }]}>{alert.bodyUr}</Text>
          ) : (
            <Text style={s.callout}>{alert.body}</Text>
          )}
        </View>

        {facts.length ? (
          <View style={[s.gridCells, s.ruleTopStrong, s.ruleStrong]}>
            {facts.map(([k, v]) => (
              <View key={k} style={[s.cell, { width: '49.8%' }]}>
                <Text style={s.label}>{k}</Text>
                <Text style={[s.bodyStrong, { marginTop: 4 }]}>{v}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {checklist.length ? (
          <>
            <SectionLabel>Do these now</SectionLabel>
            {checklist.map((c, i) => (
              <CheckRow
                key={c}
                label={c}
                done={done[i]}
                first={i === 0}
                onPress={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
              />
            ))}
          </>
        ) : null}

      </ScrollView>
    </Chromed>
  );
}

const ObservedAlertDetail = withObservables(['id'], ({ id }: { id: string }) => ({
  alerts: database.get<AlertModel>('alerts').query(Q.where('remote_id', id)).observe(),
}))(AlertDetail);

export default function AlertDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Keyed by id: this screen stays mounted inside the tab navigator, so without a remount
  // one alert's checklist/acknowledged state would carry over to the next.
  return <ObservedAlertDetail key={id} id={id ?? ''} />;
}
