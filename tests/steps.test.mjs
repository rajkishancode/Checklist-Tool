// Tests for the core rule of the app: status is DERIVED from completed steps,
// never set by the user. Runs with the built-in node test runner — no DB needed.
//
//   npm test
//
import test from "node:test";
import assert from "node:assert/strict";
import { STEP_KEYS, computeStatus, sanitizeSteps } from "../lib/steps.js";

test("no steps completed -> planned", () => {
  assert.equal(computeStatus([]), "planned");
});

test("some steps completed -> ongoing", () => {
  assert.equal(computeStatus([STEP_KEYS[0]]), "ongoing");
  assert.equal(computeStatus(STEP_KEYS.slice(0, 3)), "ongoing");
});

test("all steps completed -> done", () => {
  assert.equal(computeStatus([...STEP_KEYS]), "done");
});

test("unknown step keys are ignored when computing status", () => {
  assert.equal(computeStatus(["not_a_real_step"]), "planned");
  assert.equal(computeStatus([STEP_KEYS[0], "bogus"]), "ongoing");
});

test("sanitizeSteps keeps only valid keys, de-duped and ordered", () => {
  const messy = [STEP_KEYS[2], "bogus", STEP_KEYS[0], STEP_KEYS[0]];
  assert.deepEqual(sanitizeSteps(messy), [STEP_KEYS[0], STEP_KEYS[2]]);
});

test("sanitizeSteps handles non-array input", () => {
  assert.deepEqual(sanitizeSteps(undefined), []);
  assert.deepEqual(sanitizeSteps(null), []);
});
