import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import withObservables from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';
import { Chromed } from '../../components/chrome';
import { FreshRow, HazardRow, TierHeader } from '../../components/hazard';
import { BtnPrimary, SectionLabel } from '../../components/ui';
import { useStyles } from '../../design/styles';
import { Tier, useTheme } from '../../design/theme';
import { useApp } from '../../state/app';
import { useSyncRefresh } from '../../lib/use-refresh';
import { database } from '../../lib/db';
import { LakeModel } from '../../lib/db/models/LakeModel';
import { AlertModel } from '../../lib/db/models/AlertModel';
import { ChwCaseModel } from '../../lib/db/models/ChwCaseModel';
import { relativeTime, tierLabel } from '../../lib/format';

const TIER_RANK: Record<Tier, number> = { critical: 0, high: 1, watch: 2, normal: 3 };
const byRank = (a: LakeModel, b: LakeModel) => TIER_RANK[a.tier] - TIER_RANK[b.tier];

function Home({
  lakes,
  alerts,
  queuedCases,
}: {
  lakes: LakeModel[];
  alerts: AlertModel[];
  queuedCases: ChwCaseModel[];
}) {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const { mode, lang, tr } = useApp();
  const ur = lang === 'ur';
  const refreshControl = useSyncRefresh();

  if (lakes.length === 0) {
    return (
      <Chromed title="CryoHealth" sub={tr('place.gb')}>
        <ScrollView style={s.scroll} refreshControl={refreshControl}>
          <View style={{ padding: t.space.lg }}>
            <Text style={s.callout}>{tr('home.noLakes')}</Text>
          </View>
        </ScrollView>
      </Chromed>
    );
  }

  const sorted = [...lakes].sort(byRank);
  const worst = sorted[0];
  const worstAlert = alerts.find((a) => a.lakeId === worst.remoteId && a.status === 'active');
  const line = (ur ? worstAlert?.bodyUr : worstAlert?.body) ?? tr('home.noAdvisory');

  return (
    <Chromed title="CryoHealth" sub={tr('place.gb')}>
      <ScrollView style={s.scroll} refreshControl={refreshControl}>
        <TierHeader
          tier={worst.tier}
          kicker={tr('home.hazardTier')}
          name={tierLabel(worst.tier, lang)}
          place={`${worst.valley} · ${ur && worst.nameUr ? worst.nameUr : worst.name}`}
          line={line}
        />
        <FreshRow stamp={`${tr('common.updated')} ${relativeTime(worst.serverUpdatedAt, lang)}`} />

        <SectionLabel>{tr('home.atRisk')}</SectionLabel>
        {sorted.slice(0, 3).map((l) => (
          <HazardRow
            key={l.id}
            name={ur && l.nameUr ? l.nameUr : l.name}
            detail={`${l.valley} · ${relativeTime(l.serverUpdatedAt, lang)}${l.stale ? ` · ${tr('common.stale')}` : ''}`}
            tier={l.tier}
            onPress={() => router.push('/map')}
          />
        ))}

        {mode === 'chw' ? (
          <View style={[s.ruleTopStrong, { marginTop: t.space.xl }]}>
            <SectionLabel>{tr('home.queue')}</SectionLabel>
            <View style={{ paddingHorizontal: t.space.lg }}>
              <Text style={s.title3}>
                {tr(queuedCases.length === 1 ? 'home.queueOne' : 'home.queueMany', { n: queuedCases.length })}
              </Text>
              <Text style={[s.callout, { marginTop: 4 }]}>{tr('home.queueNote')}</Text>
              <View style={{ marginVertical: t.space.lg }}>
                <BtnPrimary label={tr('home.newCase')} onPress={() => router.push('/case')} />
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Chromed>
  );
}

export default withObservables([], () => ({
  lakes: database.get<LakeModel>('lakes').query().observe(),
  alerts: database.get<AlertModel>('alerts').query().observe(),
  queuedCases: database.get<ChwCaseModel>('chw_cases').query(Q.where('sync_state', 'queued')).observe(),
}))(Home);
