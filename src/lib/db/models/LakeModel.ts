import { Model } from "@nozbe/watermelondb";
import { field } from "@nozbe/watermelondb/decorators";
import type { Tier } from "../../../design/theme";

export class LakeModel extends Model {
  static table = "lakes";

  @field("remote_id") remoteId!: string;
  @field("name") name!: string;
  @field("name_ur") nameUr?: string;
  @field("district") district!: string;
  @field("valley") valley!: string;
  @field("tier") tier!: Tier;
  @field("stale") stale!: boolean;
  @field("elevation_m") elevationM?: number;
  @field("lat") lat!: number;
  @field("lng") lng!: number;
  @field("updated_at") updatedAt!: string;
  @field("synced_at") syncedAt!: number;
}
