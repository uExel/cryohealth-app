import { database } from "../db";
import { countUnreadCritical, markAlertRead, readIds } from "../alert-state";
import { AlertModel } from "../db/models/AlertModel";
import { AlertReadModel } from "../db/models/AlertReadModel";

// markAlertRead talks to the app-wide `database`; point that at an in-memory copy.
jest.mock("../db", () => {
  const { Database: Db } = jest.requireActual("@nozbe/watermelondb");
  const Loki = jest.requireActual("@nozbe/watermelondb/adapters/lokijs").default;
  const { schema: s } = jest.requireActual("../db/schema");
  return {
    database: new Db({
      adapter: new Loki({ schema: s, useWebWorker: false, useIncrementalIndexedDB: false }),
      modelClasses: [
        jest.requireActual("../db/models/LakeModel").LakeModel,
        jest.requireActual("../db/models/AlertModel").AlertModel,
        jest.requireActual("../db/models/ChwCaseModel").ChwCaseModel,
        jest.requireActual("../db/models/ProtocolModel").ProtocolModel,
        jest.requireActual("../db/models/AlertReadModel").AlertReadModel,
      ],
    }),
  };
});

const read = (...ids: string[]) => ids.map((remoteId) => ({ remoteId }) as AlertReadModel);
const alert = (remoteId: string, tier: string, status: string) =>
  ({ remoteId, tier, status }) as AlertModel;

describe("countUnreadCritical", () => {
  const alerts = [
    alert("a", "critical", "active"),
    alert("b", "critical", "active"),
    alert("c", "critical", "cleared"),
    alert("d", "high", "active"),
  ];

  it("counts only active critical alerts", () => {
    expect(countUnreadCritical(alerts, [])).toBe(2);
  });

  it("drops an alert once it has been read", () => {
    expect(countUnreadCritical(alerts, read("a"))).toBe(1);
    expect(countUnreadCritical(alerts, read("a", "b"))).toBe(0);
  });

  it("ignores reads of non-critical alerts", () => {
    expect(countUnreadCritical(alerts, read("c", "d"))).toBe(2);
  });
});

describe("markAlertRead", () => {
  const reads = () => database.get<AlertReadModel>("alert_reads").query().fetch();

  it("records the alert and is idempotent", async () => {
    await markAlertRead("alert-1");
    await markAlertRead("alert-1");
    await markAlertRead("alert-2");
    const rows = await reads();
    expect(rows).toHaveLength(2);
    expect(readIds(rows)).toEqual(new Set(["alert-1", "alert-2"]));
  });

  it("is untouched by the wholesale alert-cache replacement a sync performs", async () => {
    const alertsCol = database.get<AlertModel>("alerts");
    await database.write(async () => {
      await alertsCol.create((r) => {
        r.remoteId = "alert-1";
      });
    });
    const existing = await alertsCol.query().fetch();
    await database.write(async () => {
      await database.batch(...existing.map((r) => r.prepareDestroyPermanently()));
    });
    expect(readIds(await reads()).has("alert-1")).toBe(true);
  });
});
