import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BareScreen, Logo } from '../components/chrome';
import { BtnPrimary, BtnSecondary, BtnText } from '../components/ui';
import { useStyles } from '../design/styles';
import { useTheme } from '../design/theme';

export default function Welcome() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  return (
    <BareScreen>
      <View style={[s.padXWide, { flex: 1, paddingTop: 84, gap: 12 }]}>
        <Logo size={34} />
        <Text style={s.title1}>Alerts work without an account</Text>
        <Text style={s.body}>
          Pick your valley and CryoHealth starts warning you. No phone number, no sign up.
        </Text>
        <Text style={s.callout}>An account is only for health workers who record cases.</Text>

        <View style={{ marginTop: 'auto', marginBottom: t.space.xxl, gap: 10 }}>
          <View style={[s.settingsRow, { paddingHorizontal: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Your valley</Text>
              <Text style={s.bodyStrong}>Hunza · Hassanabad</Text>
            </View>
            <BtnText label="Change" />
          </View>
          <BtnPrimary label="Start with alerts" onPress={() => router.replace('/(tabs)')} />
          <BtnSecondary label="Log in" onPress={() => router.push('/login')} />
          <BtnText label="Register as LHW" onPress={() => router.push('/signup')} />
        </View>
      </View>
    </BareScreen>
  );
}
