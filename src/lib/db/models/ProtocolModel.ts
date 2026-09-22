import { Model } from "@nozbe/watermelondb";
import { field, json } from "@nozbe/watermelondb/decorators";
import type { ApiProtocolSteps } from "../../api-types";

const sanitizeSteps = (raw: unknown) =>
  raw && typeof raw === "object" ? (raw as ApiProtocolSteps) : undefined;

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
