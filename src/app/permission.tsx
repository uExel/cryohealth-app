import React from "react";
import { Platform, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BellRing } from "lucide-react-native";
import { BareScreen } from "../components/chrome";
import { BtnPrimary, BtnText } from "../components/ui";
import { useStyles } from "../design/styles";
import { useTheme } from "../design/theme";
import { useApp } from "../state/app";
import {
  disablePushNotifications,
  enablePushNotifications,
} from "../lib/push-notifications";

export default function Permission() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const { tr } = useApp();
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
        setError(tr("permission.denied"));
        return;
      }
      router.replace("/home");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : tr("permission.registerFail"),
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
          : tr("permission.updateFail"),
      );
    } finally {
      setWorking(false);
    }
  };

  return (
    <BareScreen>
      <View style={[s.padXWide, { paddingTop: 84, gap: 14, flex: 1 }]}>
        <BellRing size={28} color={t.color.accent} strokeWidth={2.2} />
        <Text style={s.title1}>{tr("permission.title")}</Text>
        <Text style={s.body}>{tr("permission.body")}</Text>
        {ios ? (
          <Text style={s.callout}>{tr("permission.silentIos")}</Text>
        ) : (
          <>
            <Text style={s.callout}>{tr("permission.silent")}</Text>
            <Text style={s.callout}>{tr("permission.swipe")}</Text>
          </>
        )}
        <View style={{ marginTop: "auto", marginBottom: t.space.xxl, gap: 10 }}>
          {error ? <Text style={s.callout}>{error}</Text> : null}
          <BtnPrimary
            label={working ? tr("permission.working") : tr("permission.allow")}
            disabled={working}
            onPress={() => void allowAlerts()}
          />
          <BtnText
            label={tr("permission.later")}
            onPress={() => void skipAlerts()}
          />
        </View>
      </View>
    </BareScreen>
  );
}
