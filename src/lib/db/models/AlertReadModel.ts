import { Model } from "@nozbe/watermelondb";
import { field } from "@nozbe/watermelondb/decorators";

/** One row per alert the user has opened on this phone. Keyed by the server alert id
 *  because the `alerts` cache is destroyed and recreated on every pull; this table is not. */
export class AlertReadModel extends Model {
  static table = "alert_reads";

  @field("remote_id") remoteId: string;
}
