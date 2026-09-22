/** Health assistant surfaces. Dosing text renders only from lookup-table data
 *  (CryoHealth-api's `protocols.steps`, synced to the local `protocols` table) — never
 *  from a language model. */
import React from 'react';
import { Text, View } from 'react-native';
import { ShieldAlert, SquareCheck } from 'lucide-react-native';
import { Tier, useTheme } from '../design/theme';
import { tierColor, useStyles } from '../design/styles';

/** Non-dismissible; renders above every assistant surface. */
export const Disclaimer = () => {
  const t = useTheme();
  const s = useStyles();
  return (
    <View style={s.disclaimer}>
      <ShieldAlert size={17} color={t.color.text} strokeWidth={2.2} />
      <Text style={[s.footnote, { color: t.color.text, flex: 1 }]}>
        Guidance only — not a diagnosis. Always see a health worker if you are worried.
      </Text>
    </View>
  );
};

export const Provenance = ({ text }: { text: string }) => {
  const t = useTheme();
  const s = useStyles();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9, paddingHorizontal: t.space.lg, borderBottomWidth: 1, borderBottomColor: t.color.lineSoft }}>
      <SquareCheck size={15} color={t.color.muted} strokeWidth={2.2} />
      <Text style={s.footnote}>{text}</Text>
    </View>
  );
};

export const GuidanceCard = ({
  step, head, why, tier, numbered, index,
}: { step: string; head: string; why: string; tier: Tier; numbered?: boolean; index?: number }) => {
  const t = useTheme();
  const s = useStyles();
  return (
    <View style={[s.guidanceCard, { borderLeftColor: tierColor(t, tier) }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {numbered ? (
          <View style={s.guidanceNum}>
            <Text style={s.guidanceNumLabel}>{index ?? 1}</Text>
          </View>
        ) : null}
        <Text style={[s.guidanceStep, { color: tierColor(t, tier) }]}>{step}</Text>
      </View>
      <Text style={s.guidanceHead}>{head}</Text>
      <Text style={s.guidanceWhy}>{why}</Text>
    </View>
  );
};
