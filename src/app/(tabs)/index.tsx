import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Chromed } from '../../components/chrome';
import { FreshRow, HazardRow, TierHeader } from '../../components/hazard';
import { BtnPrimary, BtnSecondary, SectionLabel } from '../../components/ui';
import { useStyles } from '../../design/styles';
import { useTheme } from '../../design/theme';
import { useApp } from '../../state/app';
import { LAKES, STAMP } from '../../lib/mock';

export default function Home() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const { mode, lang } = useApp();
  const ur = lang === 'ur';
  const worst = LAKES[0]; // shishper · HIGH

  return (
    <Chromed title="CryoHealth" sub="Hunza · Hassanabad">
      <ScrollView style={s.scroll}>
        <TierHeader
          tier={worst.tier}
          kicker={ur ? 'خطرے کا درجہ' : 'HAZARD TIER'}
          name={ur ? 'زیادہ خطرہ' : 'HIGH'}
          place={ur ? 'ہنزہ وادی · شیشپر' : 'Hunza Valley · Shishper'}
          line={ur ? 'برفانی پانی بڑھ رہا ہے۔ دوپہر دو بجے کے بعد نالے سے دور رہیں۔' : 'Meltwater is rising. Stay away from the nala after 2 pm.'}
        />
        <FreshRow stamp={ur ? STAMP.ur : STAMP.en} />

        <SectionLabel>{ur ? 'قریبی زیرِ نگرانی جھیلیں' : 'Monitored lakes near you'}</SectionLabel>
        {LAKES.slice(0, 3).map((l) => (
          <HazardRow
            key={l.id}
            name={ur ? l.nameUr : l.name}
            detail={ur ? l.detailUr : l.detail}
            tier={l.tier}
            onPress={() => router.push('/map')}
          />
        ))}

        {mode === 'chw' ? (
          <View style={[s.ruleTopStrong, { marginTop: t.space.xl }]}>
            <SectionLabel>YOUR QUEUE</SectionLabel>
            <View style={{ paddingHorizontal: t.space.lg }}>
              <Text style={s.title3}>3 cases waiting to sync</Text>
              <Text style={[s.callout, { marginTop: 4 }]}>Saved on this phone. Nothing is lost.</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginVertical: t.space.lg }}>
                <BtnPrimary label="New case" style={{ flex: 1 }} onPress={() => router.push('/case')} />
                <BtnSecondary label="Queue" style={{ flex: 1 }} />
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Chromed>
  );
}
