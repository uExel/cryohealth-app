/**
 * Static complaint -> protocol slug lookup. Not a classification engine: matches only
 * on an exact string (chip label, or free text trimmed to the same wording) against
 * COMMON_COMPLAINTS in mock.ts. Most complaints have no protocol seeded yet -- that is
 * the expected common case, not a bug (docs/ai/planning/task-5-findings.md §3). A
 * missing entry must render the screen's no-match state, never fall back to any other
 * protocol.
 */
export const COMPLAINT_TO_SLUG: Record<string, string> = {
  'Child breathing fast': 'fast-breathing-pneumonia-2y',
};

/** Exact match only, trimmed -- anything fuzzier is the classification engine issue #5
 *  puts out of scope. Returns undefined for no match; callers must render the no-match
 *  state, never fall back to any other protocol. */
export function resolveComplaintSlug(input: string): string | undefined {
  return COMPLAINT_TO_SLUG[input.trim()];
}
