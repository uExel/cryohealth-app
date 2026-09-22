import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import withObservables from "@nozbe/with-observables";
import { Q } from "@nozbe/watermelondb";
import { Chromed } from "../components/chrome";
import { Disclaimer, GuidanceCard, Provenance } from "../components/guidance";
import { useStyles } from "../design/styles";
import { useTheme } from "../design/theme";
import { useApp } from "../state/app";
import { database } from "../lib/db";
import { ProtocolModel } from "../lib/db/models/ProtocolModel";
import type { ApiProtocolStep } from "../lib/api-types";

/** No protocol for the given slug (including "no slug at all"). Never falls back to any
 *  other protocol -- showing the wrong dosing content is the worst failure mode this
 *  screen can have (docs/ai/planning/task-5-findings.md §3). */
function NoMatch() {
  const t = useTheme();
  const s = useStyles();
  return (
    <Chromed title="Guidance">
      <Disclaimer />
      <View style={{ padding: t.space.lg }}>
        <Text style={s.callout}>
          No stored protocol for this yet. See a health worker.
        </Text>
      </View>
    </Chromed>
  );
}

/** Verbatim server text, one card per line, no invented tier/label -- used only when a
 *  protocol row has no structured `steps` yet, and only in CHW mode (see
 *  NotYetAvailablePublic below for why public mode never takes this path). */
function bodyFallbackSteps(body: string): ApiProtocolStep[] {
  return body
    .split("\n")
    .filter(Boolean)
    .map((line) => ({
      label: "",
      head: line,
      why: "",
      tier: "normal" as const,
    }));
}

/** A protocol exists but has no structured `steps` yet, and the viewer is in public
 *  mode. `body` is authored for the CHW audience (it can contain dosing) and there is
 *  no way to tell, from a freeform text field, whether it is safe to show the public --
 *  so this never renders `body` for public mode (verify pass, finding 1). The
 *  conservative default is to show nothing rather than guess. */
function NotYetAvailablePublic() {
  const t = useTheme();
  const s = useStyles();
  return (
    <Chromed title="Guidance">
      <Disclaimer />
      <View style={{ padding: t.space.lg }}>
        <Text style={s.callout}>
          This guidance isn&apos;t available for public view yet. See a health
          worker.
        </Text>
      </View>
    </Chromed>
  );
}

function GuidanceContent({ protocol }: { protocol: ProtocolModel }) {
  const t = useTheme();
  const s = useStyles();
  const { mode } = useApp();

  if (!protocol.steps && mode !== "chw") return <NotYetAvailablePublic />;

  const steps = protocol.steps
    ? mode === "chw"
      ? protocol.steps.chw
      : protocol.steps.pub
    : bodyFallbackSteps(protocol.body);
  let n = 0;

  return (
    <Chromed title="Guidance" sub={protocol.title}>
      <Disclaimer />
      <Provenance text={protocol.source} />
      <ScrollView style={s.scroll}>
        <View style={{ padding: t.space.lg, gap: 12 }}>
          {steps.map((st, i) => (
            <GuidanceCard
              key={st.label || i}
              step={st.label}
              head={st.head}
              why={st.why}
              tier={st.tier}
              numbered={!!st.numbered}
              index={st.numbered ? ++n : undefined}
            />
          ))}
          <Text style={s.footnote}>{protocol.source}</Text>
        </View>
      </ScrollView>
    </Chromed>
  );
}

function ProtocolLookup({ protocols }: { protocols: ProtocolModel[] }) {
  if (protocols.length === 0) return <NoMatch />;
  return <GuidanceContent protocol={protocols[0]} />;
}

const ObservedProtocolLookup = withObservables(
  ["slug"],
  ({ slug }: { slug: string }) => ({
    protocols: database
      .get<ProtocolModel>("protocols")
      .query(Q.where("slug", slug))
      .observe(),
  }),
)(ProtocolLookup);

/** Branches on `slug` before the observable HOC -- a `Q.where('slug', '')` sentinel would
 *  conflate "no slug" with "unknown slug" and may leave the observable without a first
 *  emission (rendering nothing instead of the no-match copy). */
export default function Guidance() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  // A repeated query param (e.g. a malformed deep link) yields string[] at runtime even
  // though the type only says string -- take the first value rather than let it reach
  // Q.where('slug', [...]) unnormalized.
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  if (!slug) return <NoMatch />;
  return <ObservedProtocolLookup slug={slug} />;
}
