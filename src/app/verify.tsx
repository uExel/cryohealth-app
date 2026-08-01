import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BareScreen } from '../components/chrome';
import { BtnPrimary, BtnText } from '../components/ui';
import { useStyles } from '../design/styles';
import { useTheme } from '../design/theme';
import { useApp } from '../state/app';

export default function Verify() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const { setMode } = useApp();
  return (
    <BareScreen>
      <View style={[s.padXWide, { paddingTop: 64, gap: 14, flex: 1 }]}>
        <Text style={s.title1}>Enter the 6-digit code</Text>
        <Text style={s.callout}>Sent to +92 301 555 0148. SMS can be slow in the valley.</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {['4', '1', '8', '2', '', ''].map((d, i) => (
            <View key={i} style={[s.field, { width: 48, alignItems: 'center' }]}>
              <Text style={s.fieldText}>{d}</Text>
            </View>
          ))}
        </View>
        <Text style={s.footnote}>Resend in 0:47</Text>
        <BtnPrimary
          label="Verify"
          onPress={() => {
            setMode('chw');
            router.replace('/home');
          }}
        />
        <BtnText label="No SMS? Use alerts without an account" onPress={() => router.replace('/home')} />
        <View style={{ flex: 1 }} />
        <Text style={[s.footnote, { marginBottom: t.space.xxl }]}>Registration is the one flow that needs signal.</Text>
      </View>
    </BareScreen>
  );
}
