import React from "react";
import { Platform, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BareScreen, Logo, Wordmark } from "../components/chrome";
import { BtnPrimary, BtnSecondary } from "../components/ui";
import { useStyles } from "../design/styles";
import { useTheme } from "../design/theme";
import { useApp } from "../state/app";

export default function Welcome() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const { tr } = useApp();
  return (
    <BareScreen>
      <View style={[s.padXWide, { flex: 1, paddingTop: 84, gap: 12 }]}>
        <Logo size={52} />
        <Wordmark size={28} />
        <Text style={s.title1}>{tr("welcome.title")}</Text>
        <Text style={s.body}>{tr("welcome.body")}</Text>
        <Text style={s.callout}>{tr("welcome.note")}</Text>

        <View style={{ marginTop: "auto", marginBottom: t.space.xxl, gap: 10 }}>
          <BtnPrimary
            label={tr("welcome.start")}
            onPress={() =>
              router.replace(
                Platform.OS === "android" ? "/permission" : "/home",
              )
            }
          />
          <BtnSecondary
            label={tr("welcome.login")}
            onPress={() => router.push("/login")}
          />
        </View>
      </View>
    </BareScreen>
  );
}
