import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BareScreen, Logo, Wordmark } from '../components/chrome';
import { BtnPrimary, BtnSecondary } from '../components/ui';
import { useStyles } from '../design/styles';
import { useTheme } from '../design/theme';

export default function Welcome() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  return (
    <BareScreen>
      <View style={[s.padXWide, { flex: 1, paddingTop: 84, gap: 12 }]}>
        <Logo size={52} />
        <Wordmark size={28} />
        <Text style={s.title1}>Alerts work without an account</Text>
        <Text style={s.body}>
          CryoHealth warns you about glacial lakes across Gilgit-Baltistan. No phone number, no sign up.
        </Text>
        <Text style={s.callout}>An account is only for health workers who record cases.</Text>

        <View style={{ marginTop: 'auto', marginBottom: t.space.xxl, gap: 10 }}>
          <BtnPrimary label="Start with alerts" onPress={() => router.replace('/home')} />
          <BtnSecondary label="Health worker log in" onPress={() => router.push('/login')} />
        </View>
      </View>
    </BareScreen>
  );
}
