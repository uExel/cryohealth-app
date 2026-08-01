import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Chromed } from '../../components/chrome';
import { FreshRow, HazardRow } from '../../components/hazard';
import { BtnSecondary, SectionLabel } from '../../components/ui';
import { useStyles } from '../../design/styles';
import { useTheme } from '../../design/theme';
import { LAKES } from '../../lib/mock';

export default function Lakes() {
  const t = useTheme();
  const s = useStyles();
  return (
    <Chromed title="Lakes" sub="List view · tiles not downloaded">
      <FreshRow stamp="Tiers from satellite readings 4h ago" />
      <ScrollView style={s.scroll}>
        {/* The list IS the map when tiles are absent — complete, not a fallback failure. */}
        <View style={{ margin: t.space.lg, backgroundColor: t.color.surface2, borderWidth: 1, borderColor: t.color.lineSoft, padding: t.space.lg, gap: 6 }}>
          <Text style={s.title3}>Map tiles not downloaded</Text>
          <Text style={s.callout}>Showing the list instead. Nothing is missing.</Text>
          <Text style={[s.footnote, { marginTop: 4 }]}>Hunza tiles · 18 MB · Download on Wi-Fi for the map view</Text>
          <BtnSecondary label="Queue for Wi-Fi" style={{ marginTop: 8 }} />
        </View>

        <SectionLabel>Monitored lakes · nearest first</SectionLabel>
        {LAKES.map((l) => (
          <HazardRow key={l.id} name={l.name} detail={l.mapDetail} tier={l.tier} />
        ))}
        <Text style={[s.footnote, { padding: t.space.lg }]}>
          Distances use your last known location.
        </Text>
      </ScrollView>
    </Chromed>
  );
}
