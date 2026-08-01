import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Chromed } from '../components/chrome';
import { BtnPrimary, CheckRow, Field, SectionLabel, Seg } from '../components/ui';
import { useStyles } from '../design/styles';
import { useTheme } from '../design/theme';

const PROBLEMS = ['Cough / breathing', 'Diarrhoea', 'Fever', 'Injury', 'Cold exposure'];
const OUTCOMES = ['Referred to facility', 'Treated at home', 'Follow-up in 2 days'];

export default function NewCase() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const [sex, setSex] = useState('Female');
  const [problem, setProblem] = useState(PROBLEMS[0]);
  const [outcome, setOutcome] = useState(OUTCOMES[0]);

  return (
    <Chromed title="New case" sub="Saved on this phone. Syncs later.">
      <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled">
        <SectionLabel>Who</SectionLabel>
        <View style={{ paddingHorizontal: t.space.lg, gap: 12 }}>
          <Field label="AGE" placeholder="2 years" />
          <View>
            <Text style={s.fieldLabel}>SEX</Text>
            <Seg options={['Female', 'Male']} value={sex} onChange={setSex} />
          </View>
        </View>

        <SectionLabel>Main problem</SectionLabel>
        {PROBLEMS.map((p, i) => (
          <CheckRow key={p} label={p} done={problem === p} first={i === 0} onPress={() => setProblem(p)} />
        ))}

        <SectionLabel>Outcome</SectionLabel>
        {OUTCOMES.map((o, i) => (
          <CheckRow key={o} label={o} done={outcome === o} first={i === 0} onPress={() => setOutcome(o)} />
        ))}

        <View style={{ padding: t.space.lg }}>
          <BtnPrimary label="Save case offline" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </Chromed>
  );
}
