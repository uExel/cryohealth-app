import React from "react";
import { Platform, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import withObservables from "@nozbe/with-observables";
import { Chromed } from "../../components/chrome";
import { BtnSecondary, SectionLabel, Seg, Toggle } from "../../components/ui";
import { useStyles } from "../../design/styles";
import { useTheme } from "../../design/theme";
import { useApp } from "../../state/app";
import { useAuthStore } from "../../state/auth";
import { database } from "../../lib/db";
import { LakeModel } from "../../lib/db/models/LakeModel";
import { AlertModel } from "../../lib/db/models/AlertModel";
import { ProtocolModel } from "../../lib/db/models/ProtocolModel";
import {
  disablePushNotifications,
  enablePushNotifications,
  getPushNotificationsEnabled,
} from "../../lib/push-notifications";

/** Row counts for the three read-through sync caches. Lets a field report ("alerts
 *  aren't showing") be checked against the actual local table instead of guessed at from
 *  a screenshot of the rendered fallback state, which looks identical whether the table
 *  is genuinely empty or has rows the screen isn't rendering. */
function SyncCounts({
  lakes,
  alerts,
  protocols,
}: {
  lakes: LakeModel[];
  alerts: AlertModel[];
  protocols: ProtocolModel[];
}) {
  const s = useStyles();
  const rows: [string, number][] = [
    ["Lakes", lakes.length],
    ["Alerts", alerts.length],
    ["Protocols", protocols.length],
  ];
  return (
    <>
      {rows.map(([k, v]) => (
        <View key={k} style={s.settingsRow}>
          <Text style={[s.bodyStrong, { flex: 1 }]}>{k}</Text>
          <Text style={s.footnote}>{v} synced</Text>
        </View>
      ))}
    </>
  );
}

const ObservedSyncCounts = withObservables([], () => ({
  lakes: database.get<LakeModel>("lakes").query().observe(),
  alerts: database.get<AlertModel>("alerts").query().observe(),
  protocols: database.get<ProtocolModel>("protocols").query().observe(),
}))(SyncCounts);

const THEME_OPTIONS = ["Light", "Dark", "System"] as const;

export default function Settings() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const { mode, lang, setLang, themeName, setThemeName } = useApp();
  const name = useAuthStore((st) => st.name);
  const logout = useAuthStore((st) => st.logout);
  const [pushEnabled, setPushEnabled] = React.useState(false);
  const [pushBusy, setPushBusy] = React.useState(false);
  const [pushError, setPushError] = React.useState<string>();

  React.useEffect(() => {
    void getPushNotificationsEnabled()
      .then(setPushEnabled)
      .catch((err: unknown) => {
        setPushError(
          err instanceof Error
            ? err.message
            : "Could not read notification settings.",
        );
      });
  }, []);

  const togglePush = async () => {
    if (pushBusy) return;
    setPushBusy(true);
    setPushError(undefined);
    try {
      if (pushEnabled) {
        await disablePushNotifications();
        setPushEnabled(false);
      } else {
        const enabled = await enablePushNotifications();
        setPushEnabled(enabled);
        if (!enabled) setPushError("Notification permission was not granted.");
      }
    } catch (err) {
      setPushError(
        err instanceof Error
          ? err.message
          : "Could not update notification settings.",
      );
    } finally {
      setPushBusy(false);
    }
  };

  return (
    <Chromed
      title="Settings"
      sub={mode === "chw" ? `${name ?? "Health worker"} · LHW` : "No account"}
      back
    >
      <ScrollView style={s.scroll}>
        <SectionLabel>Language</SectionLabel>
        <View style={{ paddingHorizontal: t.space.lg }}>
          <Seg
            options={["English", "اردو"]}
            value={lang === "en" ? "English" : "اردو"}
            onChange={(v) => setLang(v === "English" ? "en" : "ur")}
          />
        </View>

        <SectionLabel>Appearance</SectionLabel>
        <View style={{ paddingHorizontal: t.space.lg }}>
          <Seg
            options={[...THEME_OPTIONS]}
            value={
              themeName === "light"
                ? "Light"
                : themeName === "dark"
                  ? "Dark"
                  : "System"
            }
            onChange={(v) =>
              setThemeName(
                v === "Light" ? "light" : v === "Dark" ? "dark" : "system",
              )
            }
          />
        </View>

        <SectionLabel>Local data</SectionLabel>
        <ObservedSyncCounts />

        {Platform.OS === "android" ? (
          <>
            <SectionLabel>Hazard notifications</SectionLabel>
            <View
              style={{
                paddingHorizontal: t.space.lg,
                paddingBottom: t.space.sm,
              }}
            >
              <View style={[s.settingsRow, { alignItems: "center" }]}>
                <View style={{ flex: 1, paddingRight: t.space.md }}>
                  <Text style={s.bodyStrong}>Push alerts</Text>
                  <Text style={s.footnote}>
                    {pushBusy
                      ? "Updating…"
                      : pushEnabled
                        ? "Enabled on this device"
                        : "Disabled on this device"}
                  </Text>
                </View>
                <Toggle label="Push alerts" on={pushEnabled} onPress={() => void togglePush()} />
              </View>
              {pushError ? (
                <Text style={s.fieldErrorText}>{pushError}</Text>
              ) : null}
            </View>
          </>
        ) : null}

        <SectionLabel>Account</SectionLabel>
        <View
          style={{
            paddingHorizontal: t.space.lg,
            paddingBottom: t.space.xxl,
            gap: 8,
          }}
        >
          {mode === "chw" ? (
            // logout() clears the stored token, which also switches the app back to public mode.
            <BtnSecondary label="Sign out" onPress={() => void logout()} />
          ) : (
            <BtnSecondary
              label="Log in (health workers only)"
              onPress={() => router.push("/login")}
            />
          )}
        </View>
      </ScrollView>
    </Chromed>
  );
}
