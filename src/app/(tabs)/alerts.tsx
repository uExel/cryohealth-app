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
import { useApp } from '../../state/app';
import { relativeTime } from '../../lib/format';
import type { Lang } from '../../design/theme';

function toCardData(a: AlertModel, unread: boolean, lang: Lang): AlertCardData {
  return {
    id: a.remoteId,
    tier: a.tier,
    when: relativeTime(a.issuedAt, lang),
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
  const { lang, tr } = useApp();
  const read = readIds(reads);
  const sorted = [...alerts].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  const newest = sorted[0];

  return (
    <Chromed title={tr('alerts.title')} sub={tr('alerts.sub')}>
      <FreshRow stamp={newest ? tr('alerts.fresh', { time: relativeTime(newest.issuedAt, lang) }) : tr('alerts.none')} />
      <ScrollView style={s.scroll} refreshControl={refreshControl}>
        {sorted.length === 0 ? (
          <View style={{ padding: t.space.lg }}>
            <Text style={s.callout}>{tr('alerts.empty')}</Text>
          </View>
        ) : null}
        {sorted.map((a) => {
          const card = toCardData(a, !read.has(a.remoteId), lang);
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
