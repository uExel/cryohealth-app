import {
  addColumns,
  schemaMigrations,
} from "@nozbe/watermelondb/Schema/migrations";

/** v1 -> v2: nameUr/elevationM/updatedAt on lakes, bodyUr/downstreamSummary/chips/checklist
 *  on alerts. No data migration needed — both tables are wholesale-replaced by the next
 *  pull sync (see sync.ts), so new columns just start empty until then. */
export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: "lakes",
          columns: [
            { name: "name_ur", type: "string", isOptional: true },
            { name: "elevation_m", type: "number", isOptional: true },
            { name: "source_updated_at", type: "string" },
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
