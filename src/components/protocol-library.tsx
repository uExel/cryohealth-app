/** Browsable list of the synced protocols, grouped by category. The CHW picks a protocol
 *  by its title -- no complaint -> protocol routing is inferred here (that mapping is a
 *  clinical decision, see lib/complaint-map.ts and cryohealth-app#5). Reads the offline
 *  cache, so it works in airplane mode after the last successful sync. */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import withObservables from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';
import { ChevronRight } from 'lucide-react-native';
import { SectionLabel } from './ui';
import { useStyles } from '../design/styles';
import { useTheme } from '../design/theme';
import { database } from '../lib/db';
import { ProtocolModel } from '../lib/db/models/ProtocolModel';

function groupByCategory(protocols: ProtocolModel[]): [string, ProtocolModel[]][] {
  const groups = new Map<string, ProtocolModel[]>();
  for (const p of protocols) {
    const key = p.category.trim() || 'Other';
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function ProtocolLibrary({ protocols }: { protocols: ProtocolModel[] }) {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();

  if (protocols.length === 0) {
    return (
      <View style={{ paddingHorizontal: t.space.lg, paddingBottom: t.space.xxl }}>
        <Text style={s.callout}>No protocols synced yet. Connect once to download them.</Text>
      </View>
    );
  }

  return (
    <View style={{ paddingBottom: t.space.xxl }}>
      {groupByCategory(protocols).map(([category, items]) => (
        <View key={category}>
          <SectionLabel>{category}</SectionLabel>
          {items.map((p) => (
            <Pressable
              key={p.id}
              accessibilityRole="button"
              accessibilityLabel={`Open protocol: ${p.title}`}
              onPress={() => router.push({ pathname: '/guidance', params: { slug: p.slug } })}
              style={({ pressed }) => [s.settingsRow, pressed && { opacity: 0.6 }]}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={s.bodyStrong}>{p.title}</Text>
                <Text style={s.footnote} numberOfLines={1}>{p.source}</Text>
              </View>
              <ChevronRight size={18} color={t.color.muted} strokeWidth={2.2} />
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

export const ObservedProtocolLibrary = withObservables([], () => ({
  protocols: database.get<ProtocolModel>('protocols').query(Q.sortBy('title', Q.asc)).observe(),
}))(ProtocolLibrary);
