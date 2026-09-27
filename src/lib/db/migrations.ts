import {
  schemaMigrations,
  addColumns,
  createTable,
} from "@nozbe/watermelondb/Schema/migrations";

/** v1 -> v2: nameUr/elevationM/updatedAt on lakes, bodyUr/downstreamSummary/chips/checklist
 *  on alerts. No data migration needed — both tables are wholesale-replaced by the next
 *  pull sync (see sync.ts), so new columns just start empty until then.
 *  v2 -> v3: new `protocols` table (cryohealth-app#5), a third read-through cache. No
 *  data migration needed — populated fresh by the first sync after upgrade.
 *  v3 -> v4: lakes `server_updated_at` replaces `updated_at`, a name WatermelonDB reserves
 *  for its own numeric timestamp (cryohealth-app#6). Migrations can't drop columns, so the
 *  old one stays in SQLite unread; the next pull sync fills the new one. */
export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 4,
      steps: [
        addColumns({
          table: "lakes",
          columns: [{ name: "server_updated_at", type: "string" }],
        }),
      ],
    },
    {
      toVersion: 3,
      steps: [
        createTable({
          name: "protocols",
          columns: [
            { name: "remote_id", type: "string", isIndexed: true },
            { name: "slug", type: "string", isIndexed: true },
            { name: "title", type: "string" },
            { name: "category", type: "string" },
            { name: "body", type: "string" },
            { name: "source", type: "string" },
            { name: "is_disaster", type: "boolean" },
            { name: "steps_json", type: "string", isOptional: true },
            { name: "synced_at", type: "number" },
          ],
        }),
      ],
    },
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: "lakes",
          columns: [
            { name: "name_ur", type: "string", isOptional: true },
            { name: "elevation_m", type: "number", isOptional: true },
            // Declared `number` (was `string`) only so dev builds pass WatermelonDB's
            // reserved-name check; the column is unused since v4 (cryohealth-app#6).
            { name: "updated_at", type: "number" },
          ],
        }),
        addColumns({
          table: "alerts",
          columns: [
            { name: "body_ur", type: "string", isOptional: true },
            { name: "downstream_summary", type: "string", isOptional: true },
            { name: "window_start", type: "string", isOptional: true },
            { name: "window_end", type: "string", isOptional: true },
            { name: "chips_json", type: "string", isOptional: true },
            { name: "checklist_json", type: "string", isOptional: true },
          ],
        }),
      ],
    },
  ],
});
