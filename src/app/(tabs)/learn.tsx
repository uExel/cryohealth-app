import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Check, RotateCcw } from 'lucide-react-native';
import { Chromed } from '../../components/chrome';
import { BtnText } from '../../components/ui';
import { useStyles } from '../../design/styles';
import { useTheme } from '../../design/theme';
import { Lesson, LESSONS } from '../../lib/mock';

const FILTERS = ['All', 'GLOF', 'Flash flood', 'Cold', 'Water'];

function Download({ l }: { l: Lesson }) {
  const t = useTheme();
  const s = useStyles();
  if (l.state === 'done')
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Check size={14} color={t.color.tier.normal} strokeWidth={2.6} />
        <Text style={[s.footnote, { color: t.color.tier.normal }]}>Downloaded {l.size}</Text>
      </View>
    );
  if (l.state === 'progress')
    return (
      <View style={{ gap: 5 }}>
        <View style={{ height: 8, backgroundColor: t.color.surface, borderWidth: 1, borderColor: t.color.line }}>
          <View style={{ width: '38%', flex: 1, backgroundColor: t.color.accent }} />
        </View>
        <Text style={s.footnote}>{l.size}</Text>
      </View>
    );
  if (l.state === 'evicted')
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <RotateCcw size={13} color={t.color.accent} strokeWidth={2.4} />
        <Text style={[s.footnote, { color: t.color.accent }]}>Re-download {l.size}</Text>
      </View>
    );
  return <BtnText label={`Download ${l.size}`} style={{ minHeight: 0 }} />;
}

export default function Learn() {
  const t = useTheme();
  const s = useStyles();
  const [filter, setFilter] = useState('All');
  const shown = LESSONS.filter((l) => filter === 'All' || l.cat === filter);
  return (
    <Chromed title="Learn" sub="Lessons stored on this phone">
      <View style={{ flexDirection: 'row', gap: 7, paddingHorizontal: t.space.lg, paddingVertical: 10, borderBottomWidth: t.border.rule, borderBottomColor: t.color.line }}>
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[s.alertChip, filter === f && { backgroundColor: t.color.text, borderColor: t.color.text }]}
          >
            <Text style={[s.alertChipLabel, filter === f && { color: t.color.bg }]}>{f}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView style={s.scroll}>
        {shown.map((l) => (
          <View key={l.id} style={[s.settingsRow, l.state === 'evicted' && { borderWidth: 1, borderStyle: 'dashed', borderColor: t.color.line, margin: t.space.md }]}>
            <View style={{ flex: 1, gap: 4 }}>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Text style={s.label}>{l.cat}</Text>
                {l.isNew ? <Text style={[s.label, { color: t.color.accent }]}>NEW</Text> : null}
              </View>
              <Text style={s.headline}>{l.title}</Text>
              <Download l={l} />
            </View>
          </View>
        ))}
        <Text style={[s.footnote, { padding: t.space.lg }]}>4 new lessons arrived in the last sync.</Text>
      </ScrollView>
    </Chromed>
  );
}
