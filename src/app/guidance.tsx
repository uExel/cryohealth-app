import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Chromed } from '../components/chrome';
import { Disclaimer, GuidanceCard, Provenance } from '../components/guidance';
import { useStyles } from '../design/styles';
import { useTheme } from '../design/theme';
import { useApp } from '../state/app';
import { GUIDANCE } from '../lib/mock';

/** Two content levels, one shell: CHW gets classification + dose; public gets neither.
 *  Enforced here in the data layer (mock now, IMCI engine later) — never by styling. */
export default function Guidance() {
  const t = useTheme();
  const s = useStyles();
  const { mode } = useApp();
  const g = mode === 'chw' ? GUIDANCE.chw : GUIDANCE.pub;
  let n = 0;

  return (
    <Chromed title="Guidance" sub={GUIDANCE.input}>
      <Disclaimer />
      <Provenance text="Checked against WHO IMCI rules on this phone" />
      <ScrollView style={s.scroll}>
        <View style={{ padding: t.space.lg, gap: 12 }}>
          {g.steps.map((st) => (
            <GuidanceCard
              key={st.n}
              step={st.n}
              head={st.head}
              why={st.why}
              tier={st.tier}
              numbered={'numbered' in st && !!st.numbered}
              index={'numbered' in st && st.numbered ? ++n : undefined}
            />
          ))}
          <Text style={s.footnote}>{g.source}</Text>
        </View>
      </ScrollView>
    </Chromed>
  );
}
