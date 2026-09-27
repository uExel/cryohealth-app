import { Model } from "@nozbe/watermelondb";
import { field } from "@nozbe/watermelondb/decorators";
import type { Tier } from "../../../design/theme";

export class LakeModel extends Model {
  static table = "lakes";

  @field("remote_id") remoteId: string;
  @field("name") name: string;
  @field("name_ur") nameUr?: string;
  @field("district") district: string;
  @field("valley") valley: string;
  @field("tier") tier: Tier;
  @field("stale") stale: boolean;
  @field("elevation_m") elevationM?: number;
  @field("lat") lat: number;
  @field("lng") lng: number;
  /** The server's ISO timestamp for the lake row -- see schema.ts for why not `updated_at`. */
  @field("server_updated_at") serverUpdatedAt: string;
  @field("synced_at") syncedAt: number;
}
