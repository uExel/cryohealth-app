import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Archivo_400Regular,
  Archivo_600SemiBold,
  Archivo_800ExtraBold,
} from '@expo-google-fonts/archivo';
import { NotoNastaliqUrdu_400Regular } from '@expo-google-fonts/noto-nastaliq-urdu';
import { AppProvider } from '../state/app';

export default function RootLayout() {
  // Registered under the exact family names design/theme.ts emits on Android.
  // iOS resolves the plain "Archivo" family + fontWeight; register the regular cut for it too.
  const [loaded] = useFonts({
    'Archivo-Regular': Archivo_400Regular,
    'Archivo-SemiBold': Archivo_600SemiBold,
    'Archivo-ExtraBold': Archivo_800ExtraBold,
    Archivo: Archivo_400Regular,
    NotoNastaliqUrdu: NotoNastaliqUrdu_400Regular,
  });
  if (!loaded) return null;

  return (
    <AppProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 180 }}>
        <Stack.Screen name="(tabs)" />
        {/* A warning never animates in (theme.motion.critical). */}
        <Stack.Screen name="critical" options={{ presentation: 'fullScreenModal', animation: 'none' }} />
      </Stack>
    </AppProvider>
  );
}
