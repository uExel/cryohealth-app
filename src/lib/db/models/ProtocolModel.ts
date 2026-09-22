import { Model } from "@nozbe/watermelondb";
import { field, json } from "@nozbe/watermelondb/decorators";
import type { ApiProtocolSteps } from "../../api-types";

/** Validates shape, not just "is an object" -- the API is the primary guard (its DTO
 *  requires both chw/pub as non-empty arrays), but this is the last line of defense
 *  against malformed/legacy data reaching GuidanceCard. Anything that doesn't pass
 *  becomes `undefined`, which routes the screen to the safe body-fallback path rather
 *  than crashing on `undefined.map(...)`. */
function isStepArray(v: unknown): v is ApiProtocolSteps["chw"] {
  return Array.isArray(v) && v.length > 0;
}

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
