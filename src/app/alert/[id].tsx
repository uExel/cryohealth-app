import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Chromed } from '../../components/chrome';
import { TierBadge } from '../../components/hazard';
import { BtnPrimary, CheckRow, SectionLabel } from '../../components/ui';
import { useStyles } from '../../design/styles';
import { useTheme } from '../../design/theme';
import { useApp } from '../../state/app';
import { ALERT_DETAIL } from '../../lib/mock';

export default function AlertDetail() {
  const t = useTheme();
  const s = useStyles();
  const { mode } = useApp();
  const [done, setDone] = useState<boolean[]>(ALERT_DETAIL.checklist.map(() => false));
  const [acked, setAcked] = useState(false);

  return (
    <Chromed title="Alert" sub="Hassanabad · Aliabad">
      <ScrollView style={s.scroll}>
        <View style={{ padding: t.space.lg, gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TierBadge tier="critical" />
            <Text style={[s.footnote, { alignSelf: 'center' }]}>GLOF</Text>
          </View>
          <Text style={s.title1}>{ALERT_DETAIL.title}</Text>
        </View>

        <View style={[s.gridCells, s.ruleTopStrong, s.ruleStrong]}>
          {ALERT_DETAIL.facts.map(([k, v]) => (
            <View key={k} style={[s.cell, { width: '49.8%' }]}>
              <Text style={s.label}>{k}</Text>
              <Text style={[s.bodyStrong, { marginTop: 4 }]}>{v}</Text>
            </View>
          ))}
        </View>

        <SectionLabel>Do these now</SectionLabel>
        {ALERT_DETAIL.checklist.map((c, i) => (
          <CheckRow
            key={c}
            label={c}
            done={done[i]}
            first={i === 0}
            onPress={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
          />
        ))}

        {mode === 'chw' ? (
          <View style={{ padding: t.space.lg, gap: 7 }}>
            {acked ? (
              <Text style={[s.footnote, { color: t.color.tier.normal }]}>Acknowledged · queued to sync</Text>
            ) : (
              <>
                <BtnPrimary label="Acknowledge & log action" onPress={() => setAcked(true)} />
                <Text style={s.footnote}>Queued offline. Sent when you next have signal.</Text>
              </>
            )}
          </View>
        ) : null}
      </ScrollView>
    </Chromed>
  );
}
