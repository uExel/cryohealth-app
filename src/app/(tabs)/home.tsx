import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import withObservables from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';
import { Chromed } from '../../components/chrome';
import { FreshRow, HazardRow, TierHeader } from '../../components/hazard';
import { BtnPrimary, BtnSecondary, SectionLabel } from '../../components/ui';
import { useStyles } from '../../design/styles';
import { TIER_LABEL, Tier, useTheme } from '../../design/theme';
import { useApp } from '../../state/app';
import { database } from '../../lib/db';
import { LakeModel } from '../../lib/db/models/LakeModel';
import { AlertModel } from '../../lib/db/models/AlertModel';
import { ChwCaseModel } from '../../lib/db/models/ChwCaseModel';
import { relativeTime, TIER_LABEL_UR } from '../../lib/format';

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
  const { mode, lang } = useApp();
  const ur = lang === 'ur';

  if (lakes.length === 0) {
    return (
      <Chromed title="CryoHealth" sub="Hunza · Hassanabad">
        <View style={{ padding: t.space.lg }}>
          <Text style={s.callout}>No lake data on this phone yet. Connect once to sync.</Text>
        </View>
      </Chromed>
    );
  }

  const sorted = [...lakes].sort(byRank);
  const worst = sorted[0];
  const worstAlert = alerts.find((a) => a.lakeId === worst.remoteId && a.status === 'active');
  const line =
    (ur ? worstAlert?.bodyUr : worstAlert?.body) ??
    (ur ? 'اس جھیل کے لیے کوئی فعال وارننگ نہیں۔' : 'No active advisory for this lake.');

  return (
    <Chromed title="CryoHealth" sub="Hunza · Hassanabad">
      <ScrollView style={s.scroll}>
        <TierHeader
          tier={worst.tier}
          kicker={ur ? 'خطرے کا درجہ' : 'HAZARD TIER'}
          name={ur ? TIER_LABEL_UR[worst.tier] : TIER_LABEL[worst.tier]}
          place={`${worst.valley} · ${ur && worst.nameUr ? worst.nameUr : worst.name}`}
          line={line}
        />
        <FreshRow stamp={`${ur ? 'تازہ کاری' : 'Updated'} ${relativeTime(worst.updatedAt)}`} />

        <SectionLabel>{ur ? 'قریبی زیرِ نگرانی جھیلیں' : 'Monitored lakes near you'}</SectionLabel>
        {sorted.slice(0, 3).map((l) => (
          <HazardRow
            key={l.id}
            name={ur && l.nameUr ? l.nameUr : l.name}
            detail={`${l.valley} · ${relativeTime(l.updatedAt)}${l.stale ? (ur ? ' · باسی' : ' · stale') : ''}`}
            tier={l.tier}
            onPress={() => router.push('/map')}
          />
        ))}

        {mode === 'chw' ? (
          <View style={[s.ruleTopStrong, { marginTop: t.space.xl }]}>
            <SectionLabel>YOUR QUEUE</SectionLabel>
            <View style={{ paddingHorizontal: t.space.lg }}>
              <Text style={s.title3}>
                {queuedCases.length} case{queuedCases.length === 1 ? '' : 's'} waiting to sync
              </Text>
              <Text style={[s.callout, { marginTop: 4 }]}>Saved on this phone. Nothing is lost.</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginVertical: t.space.lg }}>
                <BtnPrimary label="New case" style={{ flex: 1 }} onPress={() => router.push('/case')} />
                <BtnSecondary label="Queue" style={{ flex: 1 }} />
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
