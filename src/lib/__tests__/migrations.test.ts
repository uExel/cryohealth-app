import { schema } from "../db/schema";
import { migrations } from "../db/migrations";

describe("WatermelonDB migrations", () => {
  it("reach the current schema version", () => {
    expect(migrations.maxVersion).toBe(schema.version);
  });

  it("migrate every upgrade path from v1 to the current version", () => {
    for (let from = 1; from < schema.version; from++) {
      const steps = migrations.sortedMigrations
        .filter((m) => m.toVersion > from)
        .flatMap((m) => m.steps);
      expect(steps.length).toBeGreaterThan(0);
    }
  });

  it("creates alert_reads exactly as the schema defines it", () => {
    const v5 = migrations.sortedMigrations.find((m) => m.toVersion === 5);
    const step = v5?.steps.find((st) => st.type === "create_table");
    if (!step || step.type !== "create_table") throw new Error("v5 has no create_table step");
    expect(step.schema.name).toBe("alert_reads");
    expect(step.schema.columnArray).toEqual(schema.tables.alert_reads.columnArray);
  });
});
