/** Form + action primitives. All geometry comes from design/styles.ts — no parallel styles. */
import React from 'react';
import { Pressable, Text, TextInput, View, ViewStyle } from 'react-native';
import { Check, Phone } from 'lucide-react-native';
import { useTheme } from '../design/theme';
import { useStyles } from '../design/styles';

type BtnProps = { label: string; onPress?: () => void; disabled?: boolean; style?: ViewStyle };

export const BtnPrimary = ({ label, onPress, disabled, style }: BtnProps) => {
  const s = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [s.btnPrimary, pressed && s.btnPrimaryPressed, disabled && s.btnDisabled, style]}
    >
      <Text style={s.btnPrimaryLabel}>{label}</Text>
    </Pressable>
  );
};

export const BtnSecondary = ({ label, onPress, disabled, style }: BtnProps) => {
  const s = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [s.btnSecondary, pressed && s.btnSecondaryPressed, disabled && s.btnDisabled, style]}
    >
      <Text style={s.btnSecondaryLabel}>{label}</Text>
    </Pressable>
  );
};

/** Only SOS and call-rescue. Never delete, never a form error. */
export const BtnDanger = ({ label, onPress, style }: BtnProps) => {
  const s = useStyles();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[s.btnDanger, style]}>
      <Phone size={16} color="#fff" strokeWidth={2.4} />
      <Text style={s.btnDangerLabel}>{label}</Text>
    </Pressable>
  );
};

export const BtnText = ({ label, onPress, style }: BtnProps) => {
  const s = useStyles();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[s.btnText, style]}>
      <Text style={s.btnTextLabel}>{label}</Text>
    </Pressable>
  );
};

export const Field = ({
  label, value, placeholder, prefix, error, secure, onChangeText,
}: {
  label: string; value?: string; placeholder?: string; prefix?: string; error?: string; secure?: boolean;
  onChangeText?: (v: string) => void;
}) => {
  const t = useTheme();
  const s = useStyles();
  return (
    <View>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={[s.field, error ? s.fieldError : null, prefix ? { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 0 } : null]}>
        {prefix ? (
          <View style={s.fieldPrefix}>
            <Text style={s.fieldText}>{prefix}</Text>
          </View>
        ) : null}
        <TextInput
          style={[s.fieldText, { flex: 1, color: t.color.text, paddingHorizontal: prefix ? t.space.md : 0 }]}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={t.color.muted}
          secureTextEntry={secure}
          onChangeText={onChangeText}
        />
      </View>
      {error ? <Text style={s.fieldErrorText}>{error}</Text> : null}
    </View>
  );
};

export const CheckRow = ({ label, done, onPress, first }: { label: string; done: boolean; onPress: () => void; first?: boolean }) => {
  const s = useStyles();
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: done }} style={[s.checkRow, first && { borderTopWidth: 0 }]} onPress={onPress}>
      <View style={[s.checkbox, done && s.checkboxOn]}>
        {done ? <Check size={17} color="#fff" strokeWidth={3} /> : null}
      </View>
      <Text style={[s.body, { flex: 1 }]}>{label}</Text>
    </Pressable>
  );
};

export const Toggle = ({ on, onPress }: { on: boolean; onPress: () => void }) => {
  const s = useStyles();
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: on }} onPress={onPress} style={[s.toggleTrack, on && s.toggleTrackOn]}>
      <View style={[s.toggleKnob, on && s.toggleKnobOn]} />
    </Pressable>
  );
};

export const Seg = ({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) => {
  const s = useStyles();
  return (
    <View style={s.seg}>
      {options.map((o) => (
        <Pressable key={o} style={[s.segOpt, o === value && s.segOptOn]} onPress={() => onChange(o)}>
          <Text style={[s.segLabel, o === value && s.segLabelOn]}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
};

export const SectionLabel = ({ children }: { children: string }) => {
  const t = useTheme();
  const s = useStyles();
  return <Text style={[s.label, { paddingHorizontal: t.space.lg, paddingTop: t.space.xl, paddingBottom: t.space.sm }]}>{children}</Text>;
};
