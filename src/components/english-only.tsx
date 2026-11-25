/** Keeps a screen's content in English, left-to-right, while the rest of the app is in Urdu.
 *
 *  Urdu switches the whole type scale to Nastaliq and mirrors every row. A screen whose text is
 *  not translated yet would then show English words in Nastaliq with double line spacing and a
 *  mirrored layout. Marking its route `EnglishOnly` makes `Chromed` / `BareScreen` render only
 *  that screen's content in English: the app bar, sync banner and SOS sheet around it stay in the
 *  app's language and direction, like the tab bar.
 *
 *  Used by the health-worker screens (Health, Case, Guidance, Login) until their own Urdu PR.
 *  Delete the wrapper from a route as soon as that screen reads its text from `useApp().tr`. */
import React, { createContext, useContext } from 'react';
import { View } from 'react-native';
import { ThemeProvider, useTheme } from '../design/theme';
import { directionStyle } from '../state/app';

const EnglishOnlyFlag = createContext(false);

/** Marks everything below it as an untranslated screen. */
export const EnglishOnly = ({ children }: { children: React.ReactNode }) => (
  <EnglishOnlyFlag.Provider value>{children}</EnglishOnlyFlag.Provider>
);

/** True inside a route wrapped in `EnglishOnly`. */
export const useEnglishOnly = () => useContext(EnglishOnlyFlag);

/** English type scale and left-to-right layout for `children`. */
export const EnglishContent = ({ children }: { children: React.ReactNode }) => {
  const t = useTheme();
  return (
    <ThemeProvider name={t.name} lang="en">
      <View style={[{ flex: 1 }, directionStyle(false)]}>{children}</View>
    </ThemeProvider>
  );
};
