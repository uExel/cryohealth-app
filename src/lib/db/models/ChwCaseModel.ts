import { Model } from '@nozbe/watermelondb';
import { field, json } from '@nozbe/watermelondb/decorators';

const sanitizePayload = (raw: unknown) =>
  (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;

export type CaseSyncState = 'queued' | 'synced';

/** The only locally-authored table \u2014 written offline, pushed to POST /cases when
 *  connectivity returns. `clientCaseId` is the idempotency key the backend upserts on. */
export class ChwCaseModel extends Model {
  static table = 'chw_cases';

  @field('client_case_id') clientCaseId!: string;
  @field('captured_at') capturedAt!: string;
  @json('payload_json', sanitizePayload) payload!: Record<string, unknown>;
  @field('outcome') outcome?: string;
  @field('device_id') deviceId!: string;
  @field('sync_state') syncState!: CaseSyncState;
  @field('created_at') createdAt!: number;
}
