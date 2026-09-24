import { Q } from "@nozbe/watermelondb";
import NetInfo from "@react-native-community/netinfo";
import type { NetState } from "../design/theme";
import { database } from "./db";
import { AlertModel } from "./db/models/AlertModel";
import { ChwCaseModel } from "./db/models/ChwCaseModel";
import { LakeModel } from "./db/models/LakeModel";
import { ProtocolModel } from "./db/models/ProtocolModel";
import {
  createCase,
  fetchAlerts,
  fetchLakes,
  fetchProtocols,
} from "./cryohealth-api";

const PULL_INTERVAL_MS = 5 * 60 * 1000;

/** Wholesale-replace the local read cache with the server's current lakes + alerts.
 *  Simpler and safer than diffing for a cache that's never edited locally. */
async function pullLakesAndAlerts() {
  const [lakesPage, alertsPage] = await Promise.all([
    fetchLakes(1, 100),
    fetchAlerts(1, 100),
  ]);

  await database.write(async () => {
    const lakesCollection = database.get<LakeModel>("lakes");
    const alertsCollection = database.get<AlertModel>("alerts");
    const [existingLakes, existingAlerts] = await Promise.all([
      lakesCollection.query().fetch(),
      alertsCollection.query().fetch(),
    ]);
    const now = Date.now();

    await database.batch(
      ...existingLakes.map((r) => r.prepareDestroyPermanently()),
      ...existingAlerts.map((r) => r.prepareDestroyPermanently()),
      ...lakesPage.items.map((l) =>
        lakesCollection.prepareCreate((rec) => {
          rec.remoteId = l.id;
          rec.name = l.name;
          rec.nameUr = l.nameUr;
          rec.district = l.district;
          rec.valley = l.valley;
          rec.tier = l.currentTier;
          rec.stale = l.stale;
          rec.elevationM = l.elevationM;
          rec.lng = l.geom.coordinates[0];
          rec.lat = l.geom.coordinates[1];
          rec.updatedAt = l.updatedAt;
          rec.syncedAt = now;
        }),
      ),
      ...alertsPage.items.map((a) =>
        alertsCollection.prepareCreate((rec) => {
          rec.remoteId = a.id;
          rec.lakeId = a.lakeId;
          rec.tier = a.tier;
          rec.title = a.title;
          rec.body = a.body;
          rec.bodyUr = a.bodyUr;
          rec.downstreamSummary = a.downstreamSummary;
          rec.windowStart = a.windowStart;
          rec.windowEnd = a.windowEnd;
          rec.chips = a.chips;
          rec.checklist = a.checklist;
          rec.status = a.status;
          rec.issuedAt = a.createdAt;
          rec.syncedAt = now;
        }),
      ),
    );
  });
}

/** Wholesale-replace the local protocols cache. Isolated from pullLakesAndAlerts on
 *  purpose (R2, docs/ai/planning/task-5-findings.md): a 404/absent endpoint on an
 *  un-migrated API must degrade to "keep the last cached protocols", never fail the
 *  whole sync the way a thrown Promise.all member would. */
async function pullProtocols() {
  try {
    const protocols = await fetchProtocols();
    await database.write(async () => {
      const collection = database.get<ProtocolModel>("protocols");
      const existing = await collection.query().fetch();
      const now = Date.now();

      await database.batch(
        ...existing.map((r) => r.prepareDestroyPermanently()),
        ...protocols.map((p) =>
          collection.prepareCreate((rec) => {
            rec.remoteId = p.id;
            rec.slug = p.slug;
            rec.title = p.title;
            rec.category = p.category;
            rec.body = p.body;
            rec.source = p.source;
            rec.isDisaster = p.isDisaster;
            rec.steps = p.steps;
            rec.syncedAt = now;
          }),
        ),
      );
    });
  } catch (err) {
    console.warn("Protocol sync failed, keeping last cached rows", err);
  }
}

/** Push locally-queued CHW cases. clientCaseId makes retries idempotent server-side,
 *  so a failed push is simply left queued for the next sync pass. */
async function pushQueuedCases() {
  const queued = await database
    .get<ChwCaseModel>("chw_cases")
    .query(Q.where("sync_state", "queued"))
    .fetch();

  for (const c of queued) {
    try {
      await createCase({
        clientCaseId: c.clientCaseId,
        capturedAt: c.capturedAt,
        payload: c.payload,
        outcome: c.outcome,
        deviceId: c.deviceId,
      });
      await database.write(async () => {
        await c.update((rec) => {
          rec.syncState = "synced";
        });
      });
    } catch (err) {
      console.warn("Case sync failed, will retry later", err);
    }
  }
}

let syncInFlight = false;

export async function runSync(setNet: (n: NetState) => void) {
  if (syncInFlight) return;
  syncInFlight = true;
  setNet("syncing");
  try {
    await pushQueuedCases();
    // Isolated like pullProtocols below: a lakes/alerts failure must not skip the
    // protocols pull, and vice versa -- each cache degrades independently.
    let lakesAndAlertsOk = true;
    try {
      await pullLakesAndAlerts();
    } catch (err) {
      console.warn("Lakes/alerts sync failed", err);
      lakesAndAlertsOk = false;
    }
    await pullProtocols();
    setNet(lakesAndAlertsOk ? "online" : "failed");
  } catch (err) {
    console.warn("Sync failed", err);
    setNet("failed");
  } finally {
    syncInFlight = false;
  }
}

/** Wires connectivity changes + a background interval to the sync engine. Call once
 *  from the root layout; returns an unsubscribe function. */
export function startSyncEngine(setNet: (n: NetState) => void) {
  const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      void runSync(setNet);
    } else {
      setNet("offline");
    }
  });

  const interval = setInterval(() => {
    void NetInfo.fetch().then((state) => {
      if (state.isConnected) void runSync(setNet);
    });
  }, PULL_INTERVAL_MS);

  return () => {
    unsubscribeNetInfo();
    clearInterval(interval);
  };
}
