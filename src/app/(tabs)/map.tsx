import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import withObservables from '@nozbe/with-observables';
import { Chromed } from '../../components/chrome';
import { FreshRow, HazardRow } from '../../components/hazard';
import { BtnSecondary, SectionLabel } from '../../components/ui';
import { useStyles } from '../../design/styles';
import { Tier, useTheme } from '../../design/theme';
import { database } from '../../lib/db';
import { LakeModel } from '../../lib/db/models/LakeModel';
import { relativeTime } from '../../lib/format';

const TIER_RANK: Record<Tier, number> = { critical: 0, high: 1, watch: 2, normal: 3 };

function Lakes({ lakes }: { lakes: LakeModel[] }) {
  const t = useTheme();
  const s = useStyles();
  const sorted = [...lakes].sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier]);

  return (
    <Chromed title="Lakes" sub="List view · tiles not downloaded">
      <FreshRow stamp={`Tiers current as of last sync · ${sorted[0] ? relativeTime(sorted[0].updatedAt) : '—'}`} />
      <ScrollView style={s.scroll}>
        {/* The list IS the map when tiles are absent — complete, not a fallback failure. */}
        <View style={{ margin: t.space.lg, backgroundColor: t.color.surface2, borderWidth: 1, borderColor: t.color.lineSoft, padding: t.space.lg, gap: 6 }}>
          <Text style={s.title3}>Map tiles not downloaded</Text>
          <Text style={s.callout}>Showing the list instead. Nothing is missing.</Text>
          <Text style={[s.footnote, { marginTop: 4 }]}>Hunza tiles · 18 MB · Download on Wi-Fi for the map view</Text>
          <BtnSecondary label="Queue for Wi-Fi" style={{ marginTop: 8 }} />
        </View>

        <SectionLabel>Monitored lakes · by hazard tier</SectionLabel>
        {sorted.map((l) => (
          <HazardRow
            key={l.id}
            name={l.name}
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
