import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { WifiOff } from 'lucide-react-native';
import { BareScreen, KeyboardAvoid, Logo } from '../components/chrome';
import { BtnPrimary, BtnText, Field } from '../components/ui';
import { useStyles } from '../design/styles';
import { useTheme } from '../design/theme';
import { useApp } from '../state/app';
import { useAuthStore } from '../state/auth';
import { login } from '../lib/cryohealth-api';
import { runSync } from '../lib/sync';
import { ApiError } from '../lib/api-client';

export default function Login() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const { setNet } = useApp();
  const setSession = useAuthStore((st) => st.setSession);
  const [identifier, setIdentifier] = React.useState('');
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState<string>();
  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = async () => {
    if (submitting || !identifier || !pin) return;
    setError(undefined);
    setSubmitting(true);
    try {
      const res = await login(identifier, pin);
      await setSession(res.accessToken, { role: res.role, name: res.name });
      // Cases queued while logged out (or after an expired session) push right away.
      void runSync(setNet);
      router.replace('/home');
    } catch (err) {
      setError(
        err instanceof ApiError && err.status !== 0
          ? err.message
          : 'Could not reach the server. Check your connection and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BareScreen>
      <KeyboardAvoid>
      <ScrollView style={s.scroll} contentContainerStyle={[s.padXWide, { paddingTop: 64, gap: 14 }]} keyboardShouldPersistTaps="handled">
        <Logo size={44} />
        <Text style={s.title1}>Log in</Text>
        <Text style={s.callout}>Health workers only. Alerts need no login.</Text>
        <Field
          label="LHW ID or mobile"
          placeholder="44-2291"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          returnKeyType="next"
        />
        <Field
          label="PIN"
          placeholder="····"
          secure
          value={pin}
          onChangeText={setPin}
          error={error}
          keyboardType="number-pad"
          autoComplete="current-password"
          returnKeyType="done"
          onSubmitEditing={() => void onSubmit()}
        />
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <WifiOff size={14} color={t.color.muted} strokeWidth={2.2} />
          <Text style={[s.footnote, { flex: 1 }]}>Signing in needs a connection. You stay signed in on this phone until you sign out.</Text>
        </View>
        <BtnPrimary
          label={submitting ? 'Logging in…' : 'Log in'}
          disabled={submitting || !identifier || !pin}
          onPress={() => void onSubmit()}
        />
        <Text style={s.footnote}>
          No account, or forgot your PIN? Your supervisor sets up and resets health worker accounts.
        </Text>
        <BtnText label="Continue without an account" onPress={() => router.replace('/home')} />
      </ScrollView>
      </KeyboardAvoid>
    </BareScreen>
  );
}
