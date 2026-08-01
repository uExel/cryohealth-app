import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { WifiOff } from 'lucide-react-native';
import { BareScreen, Logo } from '../components/chrome';
import { BtnPrimary, BtnText, CheckRow, Field } from '../components/ui';
import { useStyles } from '../design/styles';
import { useTheme } from '../design/theme';
import { useApp } from '../state/app';

export default function Login() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const { setMode } = useApp();
  const [stay, setStay] = React.useState(true);

  return (
    <BareScreen>
      <ScrollView style={s.scroll} contentContainerStyle={[s.padXWide, { paddingTop: 64, gap: 14 }]} keyboardShouldPersistTaps="handled">
        <Logo size={30} />
        <Text style={s.title1}>Log in</Text>
        <Text style={s.callout}>Health workers only. Alerts need no login.</Text>
        <Field label="LHW ID or mobile" placeholder="44-2291" />
        <Field label="PIN" placeholder="····" secure />
        <CheckRow label="Stay signed in on this phone" done={stay} first onPress={() => setStay(!stay)} />
        {/* CHW login verifies against the credential cached at registration — works with no signal. */}
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <WifiOff size={14} color={t.color.muted} strokeWidth={2.2} />
          <Text style={[s.footnote, { flex: 1 }]}>
            You are offline. Your PIN is checked against the copy saved on this phone.
          </Text>
        </View>
        <BtnPrimary
          label="Log in"
          onPress={() => {
            setMode('chw');
            router.replace('/(tabs)');
          }}
        />
        <View style={{ flexDirection: 'row', gap: 18 }}>
          <BtnText label="Forgot PIN" />
          <BtnText label="Register" onPress={() => router.push('/signup')} />
        </View>
        <BtnText label="Continue without an account" onPress={() => router.replace('/(tabs)')} />
      </ScrollView>
    </BareScreen>
  );
}
