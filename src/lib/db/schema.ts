import { appSchema, tableSchema } from "@nozbe/watermelondb";

/** Local cache/queue schema. `lakes`/`alerts`/`protocols` are read-through caches
 *  replaced on each pull sync; `chw_cases` is the only locally-authored table (queued
 *  until pushed). */
export const schema = appSchema({
  version: 3,
  tables: [
    tableSchema({
      name: "lakes",
      columns: [
        { name: "remote_id", type: "string", isIndexed: true },
        { name: "name", type: "string" },
        { name: "name_ur", type: "string", isOptional: true },
        { name: "district", type: "string" },
        { name: "valley", type: "string" },
        { name: "tier", type: "string" },
        { name: "stale", type: "boolean" },
        { name: "elevation_m", type: "number", isOptional: true },
        { name: "lat", type: "number" },
        { name: "lng", type: "number" },
        { name: "updated_at", type: "string" },
        { name: "synced_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "alerts",
      columns: [
        { name: "remote_id", type: "string", isIndexed: true },
        { name: "lake_id", type: "string", isOptional: true },
        { name: "tier", type: "string" },
        { name: "title", type: "string" },
        { name: "body", type: "string" },
        { name: "body_ur", type: "string", isOptional: true },
        { name: "downstream_summary", type: "string", isOptional: true },
        { name: "window_start", type: "string", isOptional: true },
        { name: "window_end", type: "string", isOptional: true },
        { name: "chips_json", type: "string", isOptional: true },
        { name: "checklist_json", type: "string", isOptional: true },
        { name: "status", type: "string" },
        { name: "issued_at", type: "string" },
        { name: "synced_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "chw_cases",
      columns: [
        { name: "client_case_id", type: "string", isIndexed: true },
        { name: "captured_at", type: "string" },
        { name: "payload_json", type: "string" },
        { name: "outcome", type: "string", isOptional: true },
        { name: "device_id", type: "string" },
        // 'queued' | 'synced' — mirrors the backend ChwCase.syncState values.
        { name: "sync_state", type: "string" },
        { name: "created_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "protocols",
      columns: [
        { name: "remote_id", type: "string", isIndexed: true },
        { name: "slug", type: "string", isIndexed: true },
        { name: "title", type: "string" },
        { name: "category", type: "string" },
        { name: "body", type: "string" },
        { name: "source", type: "string" },
        { name: "is_disaster", type: "boolean" },
        // Absent (null) when the API row has no structured steps yet — the app falls
        // back to rendering `body` line-by-line in that case (cryohealth-app#5).
        { name: "steps_json", type: "string", isOptional: true },
        { name: "synced_at", type: "number" },
      ],
    }),
  ],
});
