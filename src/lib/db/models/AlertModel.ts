import { Model } from "@nozbe/watermelondb";
import { field, json } from "@nozbe/watermelondb/decorators";
import type { Tier } from "../../../design/theme";

const sanitizeStrings = (raw: unknown) =>
  Array.isArray(raw) ? (raw as string[]) : undefined;

export class AlertModel extends Model {
  static table = "alerts";

  @field("remote_id") remoteId: string;
  @field("lake_id") lakeId?: string;
  @field("tier") tier: Tier;
  @field("title") title: string;
  @field("body") body: string;
  @field("body_ur") bodyUr?: string;
  @field("downstream_summary") downstreamSummary?: string;
  @field("window_start") windowStart?: string;
  @field("window_end") windowEnd?: string;
  /** Optional, human-authored (see CryoHealth-api's IssueAlertDto) — absent on most
   *  alerts today; a missing value means "not provided", never render a placeholder. */
  @json("chips_json", sanitizeStrings) chips?: string[];
  @json("checklist_json", sanitizeStrings) checklist?: string[];
  @field("status") status: "active" | "cleared";
  @field("issued_at") issuedAt: string;
  @field("synced_at") syncedAt: number;
}
