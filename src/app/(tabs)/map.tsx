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
import { formatNumber } from '../../lib/i18n';

const TIER_RANK: Record<Tier, number> = { critical: 0, high: 1, watch: 2, normal: 3 };

function Lakes({ lakes }: { lakes: LakeModel[] }) {
  const s = useStyles();
  const t = useTheme();
  const { lang, tr } = useApp();
  const refreshControl = useSyncRefresh();
  const sorted = [...lakes].sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier]);

  return (
    <Chromed title={tr('lakes.title')} sub={tr('place.gb')}>
      <FreshRow stamp={tr('lakes.fresh', { time: sorted[0] ? relativeTime(sorted[0].serverUpdatedAt, lang) : '—' })} />
      <ScrollView style={s.scroll} refreshControl={refreshControl}>
        {sorted.length === 0 ? (
          <View style={{ padding: t.space.lg }}>
            <Text style={s.callout}>{tr('home.noLakes')}</Text>
          </View>
        ) : null}
        <SectionLabel>{tr('lakes.section')}</SectionLabel>
        {sorted.map((l) => (
          <HazardRow
            key={l.id}
            name={lang === 'ur' && l.nameUr ? l.nameUr : l.name}
            detail={`${l.district}${l.elevationM ? ` · ${formatNumber(l.elevationM, lang)} ${tr('unit.m')}` : ''}${l.stale ? ` · ${tr('common.stale')}` : ''}`}
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
