import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import withObservables from '@nozbe/with-observables';
import { Chromed } from '../../components/chrome';
import { FreshRow, HazardRow } from '../../components/hazard';
import { SectionLabel } from '../../components/ui';
import { useStyles } from '../../design/styles';
import { Tier, useTheme } from '../../design/theme';
import { useApp } from '../../state/app';
import { useSyncRefresh } from '../../lib/use-refresh';
import { database } from '../../lib/db';
import { LakeModel } from '../../lib/db/models/LakeModel';
import { relativeTime } from '../../lib/format';

const TIER_RANK: Record<Tier, number> = { critical: 0, high: 1, watch: 2, normal: 3 };

function Lakes({ lakes }: { lakes: LakeModel[] }) {
  const s = useStyles();
  const t = useTheme();
  const { lang } = useApp();
  const refreshControl = useSyncRefresh();
  const sorted = [...lakes].sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier]);

  return (
    <Chromed title="Lakes" sub="Gilgit-Baltistan">
      <FreshRow stamp={`Tiers current as of last sync · ${sorted[0] ? relativeTime(sorted[0].serverUpdatedAt) : '—'}`} />
      <ScrollView style={s.scroll} refreshControl={refreshControl}>
        {sorted.length === 0 ? (
          <View style={{ padding: t.space.lg }}>
            <Text style={s.callout}>No lake data on this phone yet. Pull down to sync when you have signal.</Text>
          </View>
        ) : null}
        <SectionLabel>Monitored lakes · by hazard tier</SectionLabel>
        {sorted.map((l) => (
          <HazardRow
            key={l.id}
            name={lang === 'ur' && l.nameUr ? l.nameUr : l.name}
            detail={`${l.district}${l.elevationM ? ` · ${l.elevationM.toLocaleString()} m` : ''}${l.stale ? ' · stale' : ''}`}
            tier={l.tier}
          />
        ))}
      </ScrollView>
    </Chromed>
  );
}

export default withObservables([], () => ({
  lakes: database.get<LakeModel>('lakes').query().observe(),
}))(Lakes);
