/** GeoJSON coordinates are [lng, lat]; API tier/enum casing matches `Tier` in design/theme. */
import type { Tier } from "../design/theme";

export type PageResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ApiLake = {
  id: string;
  name: string;
  nameUr?: string;
  district: string;
  valley: string;
  currentTier: Tier;
  stale: boolean;
  elevationM?: number;
  geom: { type: "Point"; coordinates: [number, number] };
  updatedAt: string;
};

export type ApiAlert = {
  id: string;
  lakeId?: string;
  tier: Tier;
  title: string;
  body: string;
  bodyEn?: string;
  bodyUr?: string;
  windowStart?: string;
  windowEnd?: string;
  downstreamSummary?: string;
  /** Optional, human-authored at issue time (IssueAlertDto) — absent on most alerts
   *  today; never fill these client-side with invented copy. */
  chips?: string[];
  checklist?: string[];
  status: "active" | "cleared";
  createdAt: string;
  clearedAt?: string;
};

export type LoginResponse = {
  accessToken: string;
  role: "cryohealth_admin" | "facility_admin" | "chw" | "viewer";
  name: string;
};

export type ApiCase = {
  id: string;
  chwId: string;
  capturedAt: string;
  payload: Record<string, unknown>;
  outcome?: string;
  deviceId: string;
  clientCaseId: string;
  createdAt: string;
};

export type CreateCaseInput = {
  clientCaseId: string;
  capturedAt: string;
  payload: Record<string, unknown>;
  outcome?: string;
  deviceId: string;
};

export type ApiProtocolStep = {
  label: string;
  head: string;
  why: string;
  tier: Tier;
  numbered?: boolean;
};

export type ApiProtocolSteps = {
  chw: ApiProtocolStep[];
  pub: ApiProtocolStep[];
};

/** `GET /protocols` returns a bare array with camelCase `isDisaster` — not a
 *  `PageResult<T>`, and not the cryohealth dashboard's snake_case `is_disaster`
 *  (that's an artifact of it reading Postgres directly). */
export type ApiProtocol = {
  id: string;
  slug: string;
  title: string;
  category: string;
  body: string;
  source: string;
  isDisaster: boolean;
  steps?: ApiProtocolSteps;
  createdAt: string;
  updatedAt: string;
};
