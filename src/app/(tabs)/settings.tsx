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
import { openAppSettings } from "../../lib/battery-settings";
import type { StringKey } from "../../lib/strings";
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
  const { tr } = useApp();
  const rows: [string, number][] = [
    [tr("settings.lakes"), lakes.length],
    [tr("settings.alerts"), alerts.length],
    [tr("settings.protocols"), protocols.length],
  ];
  return (
    <>
      {rows.map(([k, v]) => (
        <View key={k} style={s.settingsRow}>
          <Text style={[s.bodyStrong, { flex: 1 }]}>{k}</Text>
          <Text style={s.footnote}>{tr("settings.synced", { n: v })}</Text>
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

const THEME_ORDER = ["light", "dark", "system"] as const;

type PushError = { message: string } | { key: StringKey };
const pushErrorFrom = (err: unknown, fallback: StringKey): PushError =>
  err instanceof Error ? { message: err.message } : { key: fallback };

export default function Settings() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const { mode, lang, setLang, themeName, setThemeName, tr } = useApp();
  const themeLabels = [tr("settings.light"), tr("settings.dark"), tr("settings.system")];
  const name = useAuthStore((st) => st.name);
  const logout = useAuthStore((st) => st.logout);
  const [pushEnabled, setPushEnabled] = React.useState(false);
  const [pushBusy, setPushBusy] = React.useState(false);
  // The error is kept as a message from the library or as a string key, and translated where it
  // is shown, so it also follows a language switch while it is on screen.
  const [pushError, setPushError] = React.useState<PushError>();

  React.useEffect(() => {
    void getPushNotificationsEnabled()
      .then(setPushEnabled)
      .catch((err: unknown) => setPushError(pushErrorFrom(err, "settings.readFail")));
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
        if (!enabled) setPushError({ key: "settings.notGranted" });
      }
    } catch (err) {
      setPushError(pushErrorFrom(err, "permission.updateFail"));
    } finally {
      setPushBusy(false);
    }
  };

  return (
    <Chromed
      title={tr("settings.title")}
      sub={mode === "chw" ? `${name ?? tr("settings.worker")} · LHW` : tr("settings.noAccount")}
      back
    >
      <ScrollView style={s.scroll}>
        <SectionLabel>{tr("settings.language")}</SectionLabel>
        <View style={{ paddingHorizontal: t.space.lg }}>
          <Seg
            options={["English", "اردو"]}
            value={lang === "en" ? "English" : "اردو"}
            onChange={(v) => setLang(v === "English" ? "en" : "ur")}
          />
        </View>

        <SectionLabel>{tr("settings.appearance")}</SectionLabel>
        <View style={{ paddingHorizontal: t.space.lg }}>
          <Seg
            options={themeLabels}
            value={themeLabels[THEME_ORDER.indexOf(themeName)]}
            onChange={(v) => setThemeName(THEME_ORDER[themeLabels.indexOf(v)] ?? "system")}
          />
        </View>

        <SectionLabel>{tr("settings.localData")}</SectionLabel>
        <ObservedSyncCounts />

        {Platform.OS === "android" ? (
          <>
            <SectionLabel>{tr("settings.hazardNotifications")}</SectionLabel>
            <View
              style={{
                paddingHorizontal: t.space.lg,
                paddingBottom: t.space.sm,
              }}
            >
              <View style={[s.settingsRow, { alignItems: "center" }]}>
                <View style={{ flex: 1, paddingEnd: t.space.md }}>
                  <Text style={s.bodyStrong}>{tr("settings.push")}</Text>
                  <Text style={s.footnote}>
                    {pushBusy
                      ? tr("settings.pushUpdating")
                      : pushEnabled
                        ? tr("settings.pushOn")
                        : tr("settings.pushOff")}
                  </Text>
                </View>
                <Toggle label={tr("settings.push")} on={pushEnabled} onPress={() => void togglePush()} />
              </View>
              {pushError ? (
                <Text style={s.fieldErrorText}>{"key" in pushError ? tr(pushError.key) : pushError.message}</Text>
              ) : null}
              {pushEnabled ? (
                <View style={{ paddingTop: t.space.sm, gap: 8 }}>
                  <Text style={s.bodyStrong}>{tr("settings.keepWorking")}</Text>
                  <Text style={s.footnote}>{tr("settings.keepWorkingBody")}</Text>
                  <BtnSecondary
                    label={tr("settings.openAppSettings")}
                    onPress={() => void openAppSettings().catch(() => setPushError({ key: "settings.openFail" }))}
                  />
                </View>
              ) : null}
            </View>
          </>
        ) : null}

        <SectionLabel>{tr("settings.account")}</SectionLabel>
        <View
          style={{
            paddingHorizontal: t.space.lg,
            paddingBottom: t.space.xxl,
            gap: 8,
          }}
        >
          {mode === "chw" ? (
            // logout() clears the stored token, which also switches the app back to public mode.
            <BtnSecondary label={tr("settings.signOut")} onPress={() => void logout()} />
          ) : (
            <BtnSecondary
              label={tr("settings.logIn")}
              onPress={() => router.push("/login")}
            />
          )}
        </View>
      </ScrollView>
    </Chromed>
  );
}
