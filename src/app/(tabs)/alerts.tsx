import React from 'react';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Chromed } from '../../components/chrome';
import { AlertCard, FreshRow } from '../../components/hazard';
import { useStyles } from '../../design/styles';
import { ALERTS } from '../../lib/mock';

export default function Alerts() {
  const s = useStyles();
  const router = useRouter();
  return (
    <Chromed title="Alerts" sub="Hunza · Hassanabad">
      <FreshRow stamp="Feed updated 2h ago" />
      <ScrollView style={s.scroll}>
        {ALERTS.map((a) => (
          <AlertCard
            key={a.id}
            a={a}
            onPress={() => (a.tier === 'critical' ? router.push('/critical') : router.push(`/alert/${a.id}`))}
          />
        ))}
      </ScrollView>
    </Chromed>
  );
}
