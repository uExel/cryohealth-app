import React from 'react';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import withObservables from '@nozbe/with-observables';
import { Chromed } from '../../components/chrome';
import { AlertCard, AlertCardData, FreshRow } from '../../components/hazard';
import { useStyles } from '../../design/styles';
import { database } from '../../lib/db';
import { AlertModel } from '../../lib/db/models/AlertModel';
import { relativeTime } from '../../lib/format';

function toCardData(a: AlertModel): AlertCardData {
  return {
    id: a.remoteId,
    tier: a.tier,
    when: relativeTime(a.issuedAt),
    title: a.title,
    place: a.downstreamSummary,
    chips: a.chips,
    cleared: a.status === 'cleared',
  };
}

function Alerts({ alerts }: { alerts: AlertModel[] }) {
  const s = useStyles();
  const router = useRouter();
  const sorted = [...alerts].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  const newest = sorted[0];

  return (
    <Chromed title="Alerts" sub="All monitored lakes">
      <FreshRow stamp={newest ? `Feed updated ${relativeTime(newest.issuedAt)}` : 'No alerts yet'} />
      <ScrollView style={s.scroll}>
        {sorted.map((a) => {
          const card = toCardData(a);
          return (
            <AlertCard
              key={a.id}
              a={card}
              // Always this alert's own detail. /critical shows only the newest critical
              // alert, so routing critical cards there made older ones unreachable.
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
}))(Alerts);
