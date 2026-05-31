// The release checklist steps are fixed for every release (per the spec).
// We store, per release, the set of completed step keys. Keys are stable
// identifiers so reordering/renaming labels never corrupts saved data.

export const STEPS = [
  { key: "prs_merged", label: "All relevant GitHub pull requests have been merged" },
  { key: "changelog_updated", label: "CHANGELOG.md files have been updated" },
  { key: "tests_passing", label: "All tests are passing" },
  { key: "github_release", label: "Releases in GitHub created" },
  { key: "deployed_demo", label: "Deployed in demo" },
  { key: "tested_demo", label: "Tested thoroughly in demo" },
  { key: "deployed_prod", label: "Deployed in production" },
];

export const STEP_KEYS = STEPS.map((s) => s.key);

/**
 * Status is derived from the completed steps, never chosen by the user:
 *   - none completed      -> "planned"
 *   - all completed       -> "done"
 *   - some completed      -> "ongoing"
 */
export function computeStatus(completedSteps = []) {
  const completed = completedSteps.filter((k) => STEP_KEYS.includes(k));
  if (completed.length === 0) return "planned";
  if (completed.length >= STEP_KEYS.length) return "done";
  return "ongoing";
}

/** Keep only valid, de-duplicated step keys from arbitrary input. */
export function sanitizeSteps(completedSteps) {
  if (!Array.isArray(completedSteps)) return [];
  return STEP_KEYS.filter((k) => completedSteps.includes(k));
}
