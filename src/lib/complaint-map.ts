/**
 * Static complaint -> protocol slug lookup. Not a classification engine: matches only
 * on an exact string (chip label, or free text trimmed to the same wording) against
 * COMMON_COMPLAINTS in mock.ts. Empty until a human maps a real complaint to a real
 * production protocol slug (see uExel/cryohealth-app#5's comment thread, 2026-09-23) --
 * production's 11 seeded protocols are cholera-, severe-malaria-, and diarrhoea-plan-a/b/c
 * slugs, and picking which one answers a given complaint (e.g. diarrhoea plan A vs B vs C is a
 * dehydration-severity call, not a complaint-string match) is a clinical routing
 * decision this file must not guess at. A missing entry must render the screen's
 * no-match state, never fall back to any other protocol.
 */
export const COMPLAINT_TO_SLUG: Record<string, string> = {};

/** Exact match only, trimmed -- anything fuzzier is the classification engine issue #5
 *  puts out of scope. Returns undefined for no match; callers must render the no-match
 *  state, never fall back to any other protocol. */
export function resolveComplaintSlug(input: string): string | undefined {
  return COMPLAINT_TO_SLUG[input.trim()];
}
