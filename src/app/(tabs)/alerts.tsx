import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import withObservables from '@nozbe/with-observables';
import { Chromed } from '../../components/chrome';
import { AlertCard, AlertCardData, FreshRow } from '../../components/hazard';
import { useStyles } from '../../design/styles';
import { useTheme } from '../../design/theme';
import { useSyncRefresh } from '../../lib/use-refresh';
import { database } from '../../lib/db';
import { AlertModel } from '../../lib/db/models/AlertModel';
import { AlertReadModel } from '../../lib/db/models/AlertReadModel';
import { readIds } from '../../lib/alert-state';
import { relativeTime } from '../../lib/format';

function toCardData(a: AlertModel, unread: boolean): AlertCardData {
  return {
    id: a.remoteId,
    tier: a.tier,
    when: relativeTime(a.issuedAt),
    title: a.title,
    place: a.downstreamSummary,
    chips: a.chips,
    cleared: a.status === 'cleared',
    unread,
  };
}

function Alerts({ alerts, reads }: { alerts: AlertModel[]; reads: AlertReadModel[] }) {
  const s = useStyles();
  const t = useTheme();
  const refreshControl = useSyncRefresh();
  const router = useRouter();
  const read = readIds(reads);
  const sorted = [...alerts].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  const newest = sorted[0];

  return (
    <Chromed title="Alerts" sub="All monitored lakes">
      <FreshRow stamp={newest ? `Feed updated ${relativeTime(newest.issuedAt)}` : 'No alerts yet'} />
      <ScrollView style={s.scroll} refreshControl={refreshControl}>
        {sorted.length === 0 ? (
          <View style={{ padding: t.space.lg }}>
            <Text style={s.callout}>No alerts on this phone yet. Pull down to sync when you have signal.</Text>
          </View>
        ) : null}
        {sorted.map((a) => {
          const card = toCardData(a, !read.has(a.remoteId));
          return (
            <AlertCard
              key={a.id}
              a={card}
              // Always this alert's own detail (which marks it read). /critical shows only the
              // newest critical alert, so routing critical cards there made older ones unreachable.
              onPress={() => router.push(`/alert/${card.id}`)}
            />
          );
        })}
      </ScrollView>
    </Chromed>
  );
}

export default withObservables([], () => ({
  alerts: database.get<AlertModel>('alerts').query().observe(),
  reads: database.get<AlertReadModel>('alert_reads').query().observe(),
}))(Alerts);
