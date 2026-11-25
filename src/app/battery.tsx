import React from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BatteryCharging } from "lucide-react-native";
import { BareScreen } from "../components/chrome";
import { BtnPrimary, BtnSecondary } from "../components/ui";
import { useStyles } from "../design/styles";
import { useTheme } from "../design/theme";
import { useApp } from "../state/app";
import {
  markBatteryPromptSeen,
  oemBatteryHint,
  openBatteryOptimizationSettings,
} from "../lib/battery-settings";

/** First-launch step on Android, shown once before the welcome screen. Without it, many
 *  phones stop CryoHealth when it is closed and then no flood warning can reach the user. */
export default function Battery() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const { tr } = useApp();
  const hint = oemBatteryHint();

  // Open the settings page first and save the "seen" flag afterwards. Awaiting the storage
  // write before the intent made the first tap look like it did nothing. The ref ignores
  // repeat taps while the page is opening.
  const opening = React.useRef(false);
  const openSettings = () => {
    if (opening.current) return;
    opening.current = true;
    void openBatteryOptimizationSettings()
      .catch((err: unknown) => console.warn("Could not open battery settings", err))
      .finally(() => {
        opening.current = false;
        void markBatteryPromptSeen();
      });
  };

  const finish = async () => {
    await markBatteryPromptSeen();
    router.replace("/welcome");
  };

  return (
    <BareScreen>
      <View style={[s.padXWide, { paddingTop: 84, gap: 14, flex: 1 }]}>
        <BatteryCharging size={28} color={t.color.accent} strokeWidth={2.2} />
        <Text style={s.title1}>{tr("battery.title")}</Text>
        <Text style={s.body}>{tr("battery.body")}</Text>
        <Text style={s.callout}>{tr("battery.steps")}</Text>
        {hint ? <Text style={s.callout}>{hint}</Text> : null}

        <View style={{ marginTop: "auto", marginBottom: t.space.xxl, gap: 10 }}>
          <BtnPrimary label={tr("battery.open")} onPress={() => void openSettings()} />
          <BtnSecondary label={tr("battery.continue")} onPress={() => void finish()} />
        </View>
      </View>
    </BareScreen>
  );
}
