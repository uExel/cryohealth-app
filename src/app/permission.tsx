import React from 'react';
import { Platform, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BellRing } from 'lucide-react-native';
import { BareScreen } from '../components/chrome';
import { BtnPrimary, BtnText } from '../components/ui';
import { useStyles } from '../design/styles';
import { useTheme } from '../design/theme';

export default function Permission() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const ios = Platform.OS === 'ios';
  return (
    <BareScreen>
      <View style={[s.padXWide, { paddingTop: 84, gap: 14, flex: 1 }]}>
        <BellRing size={28} color={t.color.accent} strokeWidth={2.2} />
        <Text style={s.title1}>A flood warning must reach you at night</Text>
        <Text style={s.body}>
          CryoHealth sends one kind of notification: a hazard alert for the valleys you follow. Nothing else.
        </Text>
        {ios ? (
          <Text style={s.callout}>
            iOS may silence alerts in Focus or Silent mode. Turn on Time Sensitive so CRITICAL warnings still ring.
          </Text>
        ) : (
          <Text style={s.callout}>
            Alerts use a high-priority channel and can sound over Do Not Disturb.
          </Text>
        )}
        <View style={{ marginTop: 'auto', marginBottom: t.space.xxl, gap: 10 }}>
          <BtnPrimary label="Allow alerts" onPress={() => router.replace('/(tabs)')} />
          <BtnText label="Not now — I will check each morning" onPress={() => router.replace('/(tabs)')} />
        </View>
      </View>
    </BareScreen>
  );
}
