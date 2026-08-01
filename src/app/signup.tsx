import React from 'react';
import { ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { BareScreen } from '../components/chrome';
import { BtnPrimary, BtnText, CheckRow, Field } from '../components/ui';
import { useStyles } from '../design/styles';

export default function Signup() {
  const s = useStyles();
  const router = useRouter();
  const [agree, setAgree] = React.useState(false);
  return (
    <BareScreen>
      <ScrollView style={s.scroll} contentContainerStyle={[s.padXWide, { paddingTop: 56, gap: 13, paddingBottom: 30 }]} keyboardShouldPersistTaps="handled">
        <Text style={s.title1}>Register as a health worker</Text>
        <Text style={s.callout}>Your supervisor approves this. It can take a day.</Text>
        <Field label="Full name" placeholder="Zainab Karim" />
        <Field label="Mobile number" prefix="+92" placeholder="301 555 0148" />
        <Field label="LHW ID" placeholder="44-2291" />
        <Field label="Union council" placeholder="Hassanabad, Hunza" />
        <CheckRow
          first
          label="I agree that case records are stored on this phone and sent to the district health office when there is signal."
          done={agree}
          onPress={() => setAgree(!agree)}
        />
        <Text style={s.footnote}>Registration needs signal once. Everything after this works offline.</Text>
        <BtnPrimary label="Send code by SMS" disabled={!agree} onPress={() => router.push('/verify')} />
        <BtnText label="I already have an account" onPress={() => router.push('/login')} />
      </ScrollView>
    </BareScreen>
  );
}
