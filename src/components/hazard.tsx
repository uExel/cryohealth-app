/** Hazard primitives: tier icon/badge, tier header, freshness row, hazard row, alert card. */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Check, CircleAlert, TriangleAlert, Clock3 } from 'lucide-react-native';
import { freshnessFor, Tier, TIER_LABEL, useTheme } from '../design/theme';
import { tierBadgeStyle, tierColor, useStyles } from '../design/styles';
import { useApp } from '../state/app';

/** Presentational contract for AlertCard — screens map their data source (live
 *  AlertModel today) onto this, rather than AlertCard depending on a data layer. */
export type AlertCardData = {
  id: string;
  tier: Tier;
  when: string;
  title: string;
  place?: string;
  chips?: string[];
  cleared?: boolean;
  acked?: string;
};

/** Tier icons are fixed (DESIGN_SYSTEM §11); critical uses the heavier stroke. */
export const TierIcon = ({ tier, size = 14, color }: { tier: Tier; size?: number; color: string }) => {
  const w = tier === 'critical' ? 2.8 : 2.2;
  if (tier === 'normal') return <Check size={size} color={color} strokeWidth={w} />;
  if (tier === 'watch') return <CircleAlert size={size} color={color} strokeWidth={w} />;
  return <TriangleAlert size={size} color={color} strokeWidth={w} />;
};

/** Soft fill + solid text + icon + word. Never a dot alone. */
export const TierBadge = ({ tier }: { tier: Tier }) => {
  const t = useTheme();
  const { bg, fg } = tierBadgeStyle(t, tier);
  return (
    <View
      accessibilityLabel={`Hazard tier: ${TIER_LABEL[tier].toLowerCase()}`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: bg, paddingVertical: 5, paddingHorizontal: 8 }}
    >
      <TierIcon tier={tier} color={fg} size={12} />
      <Text style={{ ...t.type.badge, color: fg }}>{TIER_LABEL[tier]}</Text>
    </View>
  );
};

/** Home hero: solid tier fill, onTier text, ≤30ch plain sentence. */
export const TierHeader = ({ tier, place, line, kicker, name }: { tier: Tier; place: string; line: string; kicker: string; name: string }) => {
  const t = useTheme();
  const s = useStyles();
  const on = tier === 'critical' || !t.isDark ? t.color.onTier : t.color.onTier;
  return (
    <View style={[s.tierHeader, { backgroundColor: tierColor(t, tier) }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
        <TierIcon tier={tier} color={on} size={15} />
        <Text style={[s.tierHeaderKicker, { color: on, opacity: 0.85 }]}>{kicker}</Text>
      </View>
      <Text style={[s.tierHeaderName, { color: on }]}>{name}</Text>
      <Text style={[s.tierHeaderPlace, { color: on }]}>{place}</Text>
      <Text style={[s.tierHeaderLine, { color: on, opacity: 0.92 }]}>{line}</Text>
    </View>
  );
};

/** Required on every screen showing hazard data (DESIGN_SYSTEM non-negotiable 4). */
export const FreshRow = ({ stamp }: { stamp: string }) => {
  const t = useTheme();
  const s = useStyles();
  const { net } = useApp();
  return (
    <View style={s.freshRow}>
      <Clock3 size={13} color={t.color.muted} strokeWidth={2.2} />
      <Text style={s.freshText}>{stamp}</Text>
      <Text style={s.freshState}>{freshnessFor(net)}</Text>
    </View>
  );
};

export const HazardRow = ({ name, detail, tier, onPress }: { name: string; detail: string; tier: Tier; onPress?: () => void }) => {
  const t = useTheme();
  const s = useStyles();
  return (
    <Pressable style={s.hazardRow} onPress={onPress}>
      <View style={[s.tierBar, { backgroundColor: tierColor(t, tier) }]} />
      <View style={{ flex: 1 }}>
        <Text style={s.headline}>{name}</Text>
        <Text style={s.footnote}>{detail}</Text>
      </View>
      <TierBadge tier={tier} />
    </Pressable>
  );
};

export const AlertCard = ({ a, onPress }: { a: AlertCardData; onPress?: () => void }) => {
  const t = useTheme();
  const s = useStyles();
  return (
    <Pressable style={[s.alertCard, a.cleared && s.alertCleared]} onPress={onPress}>
      <View style={[s.alertBar, { backgroundColor: tierColor(t, a.tier) }]} />
      <View style={s.alertBody}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TierBadge tier={a.tier} />
          {a.cleared ? (
            <Text style={[s.footnote, { color: t.color.tier.normal }]}>CLEARED</Text>
          ) : null}
          <Text style={s.alertMeta}>{a.when}</Text>
        </View>
        <Text style={[s.alertTitle, { marginTop: 7 }]} numberOfLines={2}>{a.title}</Text>
        {a.place ? <Text style={[s.callout, { marginTop: 3 }]}>{a.place}</Text> : null}
        {a.chips?.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 9 }}>
            {a.chips.map((c) => (
              <View key={c} style={s.alertChip}>
                <Text style={s.alertChipLabel}>{c}</Text>
              </View>
            ))}
          </View>
        ) : null}
        {a.acked ? (
          <Text style={[s.footnote, { color: t.color.tier.normal, marginTop: 8 }]}>{a.acked}</Text>
        ) : null}
      </View>
    </Pressable>
  );
};
