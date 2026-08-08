import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { schema } from "./schema";
import { migrations } from "./migrations";
import { LakeModel } from "./models/LakeModel";
import { AlertModel } from "./models/AlertModel";
import { ChwCaseModel } from "./models/ChwCaseModel";

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: false,
  dbName: "cryohealth",
  onSetUpError: (error) => {
    console.error("WatermelonDB setup failed", error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [LakeModel, AlertModel, ChwCaseModel],
});
