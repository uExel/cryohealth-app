import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { WifiOff } from 'lucide-react-native';
import { BareScreen, Logo } from '../components/chrome';
import { BtnPrimary, BtnText, CheckRow, Field } from '../components/ui';
import { useStyles } from '../design/styles';
import { useTheme } from '../design/theme';
import { useApp } from '../state/app';
import { useAuthStore } from '../state/auth';
import { login } from '../lib/cryohealth-api';
import { ApiError } from '../lib/api-client';

export default function Login() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const { setMode } = useApp();
  const setSession = useAuthStore((st) => st.setSession);
  const [stay, setStay] = React.useState(true);
  const [identifier, setIdentifier] = React.useState('');
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState<string>();
  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = async () => {
    setError(undefined);
    setSubmitting(true);
    try {
      const res = await login(identifier, pin);
      await setSession(res.accessToken, { role: res.role, name: res.name });
      setMode('chw');
      router.replace('/home');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach the server. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BareScreen>
      <ScrollView style={s.scroll} contentContainerStyle={[s.padXWide, { paddingTop: 64, gap: 14 }]} keyboardShouldPersistTaps="handled">
        <Logo size={44} />
        <Text style={s.title1}>Log in</Text>
        <Text style={s.callout}>Health workers only. Alerts need no login.</Text>
        <Field label="LHW ID or mobile" placeholder="44-2291" value={identifier} onChangeText={setIdentifier} />
        <Field label="PIN" placeholder="····" secure value={pin} onChangeText={setPin} error={error} />
        <CheckRow label="Stay signed in on this phone" done={stay} first onPress={() => setStay(!stay)} />
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <WifiOff size={14} color={t.color.muted} strokeWidth={2.2} />
          <Text style={[s.footnote, { flex: 1 }]}>Signing in needs a connection the first time on this phone.</Text>
        </View>
        <BtnPrimary
          label={submitting ? 'Logging in…' : 'Log in'}
          disabled={submitting || !identifier || !pin}
          onPress={onSubmit}
        />
        <View style={{ flexDirection: 'row', gap: 18 }}>
          <BtnText label="Forgot PIN" />
          <BtnText label="Register" onPress={() => router.push('/signup')} />
        </View>
        <BtnText label="Continue without an account" onPress={() => router.replace('/home')} />
      </ScrollView>
    </BareScreen>
  );
}
