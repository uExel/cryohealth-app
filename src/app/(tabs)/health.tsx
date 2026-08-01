import React, { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Chromed } from '../../components/chrome';
import { Disclaimer } from '../../components/guidance';
import { BtnPrimary, BtnSecondary, SectionLabel } from '../../components/ui';
import { useStyles } from '../../design/styles';
import { useTheme } from '../../design/theme';
import { COMMON_COMPLAINTS } from '../../lib/mock';

export default function Health() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const [text, setText] = useState('');

  return (
    <Chromed title="Health assistant" sub="Works offline">
      <Disclaimer />
      <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={{ padding: t.space.lg, gap: 10 }}>
          <Text style={s.title2}>What is wrong?</Text>
          <Text style={s.callout}>Say it in Urdu or English. Works without signal.</Text>
          <View style={[s.field, { minHeight: 96, justifyContent: 'flex-start', paddingVertical: 10 }]}>
            <TextInput
              style={[s.fieldText, { color: t.color.text, flex: 1, textAlignVertical: 'top' }]}
              multiline
              value={text}
              onChangeText={setText}
              placeholder="e.g. Child breathing fast"
              placeholderTextColor={t.color.muted}
            />
          </View>
          <BtnPrimary label="Get guidance" onPress={() => router.push('/guidance')} />
        </View>
        <SectionLabel>Common</SectionLabel>
        <View style={{ paddingHorizontal: t.space.lg, gap: 8, paddingBottom: t.space.xxl }}>
          {COMMON_COMPLAINTS.map((c) => (
            <BtnSecondary key={c} label={c} onPress={() => router.push('/guidance')} />
          ))}
        </View>
      </ScrollView>
    </Chromed>
  );
}
