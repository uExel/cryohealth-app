import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { Chromed, KeyboardAvoid } from '../../components/chrome';
import { BtnPrimary, CheckRow, Field, SectionLabel, Seg } from '../../components/ui';
import { useStyles } from '../../design/styles';
import { useTheme } from '../../design/theme';
import { useApp } from '../../state/app';
import { database } from '../../lib/db';
import { ChwCaseModel } from '../../lib/db/models/ChwCaseModel';
import { getDeviceId } from '../../lib/device-id';
import { runSync } from '../../lib/sync';

const PROBLEMS = ['Cough / breathing', 'Diarrhoea', 'Fever', 'Injury', 'Cold exposure'];
const AGE_UNITS = ['Years', 'Months'] as const;
const OUTCOMES = ['Referred to facility', 'Treated at home', 'Follow-up in 2 days'];

export default function NewCase() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const { setNet } = useApp();
  const [age, setAge] = useState('');
  const [ageUnit, setAgeUnit] = useState<string>(AGE_UNITS[0]);
  const [sex, setSex] = useState('Female');
  const [problem, setProblem] = useState(PROBLEMS[0]);
  const [outcome, setOutcome] = useState(OUTCOMES[0]);
  const [saving, setSaving] = useState(false);

  const ageNumber = Number(age);
  // Months go up to 59 (under five); years up to 120.
  const ageMax = ageUnit === 'Months' ? 59 : 120;
  const ageValid = /^\d{1,3}$/.test(age) && ageNumber >= 0 && ageNumber <= ageMax;
  const ageError = age && !ageValid ? `Enter a whole number from 0 to ${ageMax}.` : undefined;

  const onSave = async () => {
    if (!ageValid) return;
    setSaving(true);
    try {
      const deviceId = await getDeviceId();
      await database.write(async () => {
        await database.get<ChwCaseModel>('chw_cases').create((rec) => {
          rec.clientCaseId = Crypto.randomUUID();
          rec.capturedAt = new Date().toISOString();
          rec.payload = { age: `${ageNumber} ${ageUnit.toLowerCase()}`, sex, problem };
          rec.outcome = outcome;
          rec.deviceId = deviceId;
          rec.syncState = 'queued';
          rec.createdAt = Date.now();
        });
      });
      // This screen stays mounted inside the tab navigator: clear the form so the next
      // case starts blank.
      setAge('');
      setAgeUnit(AGE_UNITS[0]);
      setSex('Female');
      setProblem(PROBLEMS[0]);
      setOutcome(OUTCOMES[0]);
      router.back();
      void runSync(setNet);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Chromed title="New case" sub="Saved on this phone. Syncs later." back>
      <KeyboardAvoid>
      <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled">
        <SectionLabel>Who</SectionLabel>
        <View style={{ paddingHorizontal: t.space.lg, gap: 12 }}>
          <Field
            label="AGE"
            placeholder="2"
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
            maxLength={3}
            error={ageError}
          />
          <Seg options={[...AGE_UNITS]} value={ageUnit} onChange={setAgeUnit} />
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
          <BtnPrimary label={saving ? 'Saving…' : 'Save case offline'} disabled={saving || !ageValid} onPress={() => void onSave()} />
        </View>
      </ScrollView>
      </KeyboardAvoid>
    </Chromed>
  );
}
