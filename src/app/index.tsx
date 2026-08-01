/** Splash — cold start. Full-bleed accentInk field, white mark, tagline, progress bar,
 *  and an honest connectivity note. Advances on its own; a warning-capable app never
 *  parks the user on a logo. */
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { Logo, Wordmark } from '../components/chrome';
import { useApp } from '../state/app';

export default function Splash() {
  const router = useRouter();
  const { net } = useApp();
  const offline = net === 'offline' || net === 'failed' || net === 'stale';

  useEffect(() => {
    const id = setTimeout(() => router.replace('/welcome'), 1800);
    return () => clearTimeout(id);
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0a4d76' }}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 26 }}>
        <View style={{ marginBottom: 22 }}>
          <Logo size={76} color="#ffffff" />
        </View>
        <Wordmark size={40} color="#ffffff" />
        <View style={{ height: 2, backgroundColor: 'rgba(255,255,255,0.4)', marginTop: 16, marginBottom: 14, width: 120 }} />
        <Text style={{ fontFamily: 'Archivo-Regular', fontSize: 15, lineHeight: 22, color: 'rgba(255,255,255,0.9)', maxWidth: 240 }}>
          Glacier hazard warnings and health guidance for Gilgit-Baltistan.
        </Text>
      </View>
      <View style={{ paddingHorizontal: 26, paddingBottom: 34 }}>
        <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.28)', marginBottom: 12 }}>
          <View style={{ height: 4, width: '46%', backgroundColor: '#ffffff' }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {offline ? (
            <WifiOff size={15} color="rgba(255,255,255,0.9)" strokeWidth={2.4} />
          ) : (
            <RefreshCw size={15} color="rgba(255,255,255,0.9)" strokeWidth={2.4} />
          )}
          <Text style={{ fontFamily: 'Archivo-SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>
            {offline ? 'Offline — starting with saved data' : 'Checking alerts…'}
          </Text>
        </View>
      </View>
    </View>
  );
}
