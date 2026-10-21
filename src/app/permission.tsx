import React from "react";
import { Platform, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BellRing } from "lucide-react-native";
import { BareScreen } from "../components/chrome";
import { BtnPrimary, BtnText } from "../components/ui";
import { useStyles } from "../design/styles";
import { useTheme } from "../design/theme";
import {
  disablePushNotifications,
  enablePushNotifications,
} from "../lib/push-notifications";

export default function Permission() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const ios = Platform.OS === "ios";
  const [working, setWorking] = React.useState(false);
  const [error, setError] = React.useState<string>();

  const allowAlerts = async () => {
    if (working) return;
    // Push is Android-only for now; enablePushNotifications() throws on iOS.
    if (ios) {
      router.replace("/home");
      return;
    }
    setWorking(true);
    setError(undefined);
    try {
      const enabled = await enablePushNotifications();
      if (!enabled) {
        setError(
          "Permission was not granted. You can enable notifications later in Settings.",
        );
        return;
      }
      router.replace("/home");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not register this device for alerts.",
      );
    } finally {
      setWorking(false);
    }
  };

  const skipAlerts = async () => {
    if (working) return;
    setWorking(true);
    setError(undefined);
    try {
      await disablePushNotifications();
      router.replace("/home");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update notification settings.",
      );
    } finally {
      setWorking(false);
    }
  };

  return (
    <BareScreen>
      <View style={[s.padXWide, { paddingTop: 84, gap: 14, flex: 1 }]}>
        <BellRing size={28} color={t.color.accent} strokeWidth={2.2} />
        <Text style={s.title1}>A flood warning must reach you at night</Text>
        <Text style={s.body}>
          CryoHealth sends important hazard alerts for monitored lakes. You can
          turn notifications off later in Settings.
        </Text>
        {ios ? (
          <Text style={s.callout}>
            Focus and Silent mode settings may silence notifications.
          </Text>
        ) : (
          <>
            <Text style={s.callout}>
              Your notification and Do Not Disturb settings may silence alerts.
            </Text>
            <Text style={s.callout}>
              Some phones stop an app when you swipe it away. To keep alerts
              coming, open Settings later and choose “Open app settings” under
              Hazard notifications.
            </Text>
          </>
        )}
        <View style={{ marginTop: "auto", marginBottom: t.space.xxl, gap: 10 }}>
          {error ? <Text style={s.callout}>{error}</Text> : null}
          <BtnPrimary
            label={working ? "Setting up alerts…" : "Allow alerts"}
            disabled={working}
            onPress={() => void allowAlerts()}
          />
          <BtnText
            label="Not now — I will check each morning"
            onPress={() => void skipAlerts()}
          />
        </View>
      </View>
    </BareScreen>
  );
}
