import { Model } from "@nozbe/watermelondb";
import { field, json } from "@nozbe/watermelondb/decorators";
import type { ApiProtocolSteps, ApiProtocolStep } from "../../api-types";

const TIERS = ["normal", "watch", "high", "critical"];

/** Validates every element, not just array length -- an element that fails this (e.g.
 *  `null`, or missing head/why) would otherwise reach GuidanceCard and crash on
 *  `st.label`/`st.head` (found in re-verify, cryohealth-app#5). The API's DTO already
 *  enforces this shape on writes through it, but this is the last line of defense
 *  against data written another way (direct DB access, an older row, a future admin
 *  path) reaching this screen. */
function isValidStep(v: unknown): v is ApiProtocolStep {
  if (!v || typeof v !== "object") return false;
  const s = v as Partial<ApiProtocolStep>;
  return (
    typeof s.label === "string" &&
    typeof s.head === "string" &&
    s.head.length > 0 &&
    typeof s.why === "string" &&
    typeof s.tier === "string" &&
    TIERS.includes(s.tier)
  );
}

function isStepArray(v: unknown): v is ApiProtocolSteps["chw"] {
  return Array.isArray(v) && v.length > 0 && v.every(isValidStep);
}

/** Validates shape, not just "is an object" -- the API is the primary guard (its DTO
 *  requires both chw/pub as non-empty arrays of well-formed steps), but this is the
 *  last line of defense against malformed/legacy data reaching GuidanceCard. Anything
 *  that doesn't pass becomes `undefined`, which routes the screen to the safe
 *  body-fallback path rather than crashing. */
const sanitizeSteps = (raw: unknown): ApiProtocolSteps | undefined => {
  if (!raw || typeof raw !== "object") return undefined;
  const { chw, pub } = raw as Partial<ApiProtocolSteps>;
  return isStepArray(chw) && isStepArray(pub) ? { chw, pub } : undefined;
};

export class ProtocolModel extends Model {
  static table = "protocols";

  @field("remote_id") remoteId: string;
  @field("slug") slug: string;
  @field("title") title: string;
  @field("category") category: string;
  @field("body") body: string;
  @field("source") source: string;
  @field("is_disaster") isDisaster: boolean;
  /** Absent when the API row has no structured steps — screens fall back to
   *  rendering `body` line-by-line (cryohealth-app#5). */
  @json("steps_json", sanitizeSteps) steps?: ApiProtocolSteps;
  @field("synced_at") syncedAt: number;
}
