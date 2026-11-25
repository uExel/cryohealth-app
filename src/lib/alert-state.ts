import { Q } from "@nozbe/watermelondb";
import { database } from "./db";
import { AlertModel } from "./db/models/AlertModel";
import { AlertReadModel } from "./db/models/AlertReadModel";

/** Records that this phone's user opened the alert. Idempotent. */
export async function markAlertRead(remoteId: string): Promise<void> {
  await database.write(async () => {
    const collection = database.get<AlertReadModel>("alert_reads");
    const existing = await collection
      .query(Q.where("remote_id", remoteId))
      .fetchCount();
    if (existing > 0) return;
    await collection.create((rec) => {
      rec.remoteId = remoteId;
    });
  });
}

export function readIds(reads: AlertReadModel[]): Set<string> {
  return new Set(reads.map((r) => r.remoteId));
}

/** Red tab badge: active CRITICAL alerts the user has not opened. */
export function countUnreadCritical(
  alerts: Pick<AlertModel, "remoteId" | "tier" | "status">[],
  reads: AlertReadModel[],
): number {
  const read = readIds(reads);
  return alerts.filter(
    (a) => a.tier === "critical" && a.status === "active" && !read.has(a.remoteId),
  ).length;
}
