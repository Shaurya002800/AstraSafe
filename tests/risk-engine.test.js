import test from "node:test";
import assert from "node:assert/strict";

import { scenarioEvents } from "../src/domain/scenario.js";
import {
  computeRisk,
  generatePreventionReport,
  rankInterventions,
  simulateFutures
} from "../src/domain/risk-engine.js";

test("AstraSafe detects the pathway before the traditional gas alarm", () => {
  const preventionEvents = scenarioEvents.slice(
    0,
    scenarioEvents.findIndex((event) => event.type === "astrasafe_prevention_alert") + 1
  );
  const result = computeRisk(preventionEvents);

  assert.equal(result.score, 86);
  assert.equal(result.state, "Critical pre-incident");
  assert.equal(result.baselineWouldAlert, false);
  assert.equal(result.leadTimeMinutes, 21);
});

test("counterfactual intervention reduces projected risk materially", () => {
  const result = computeRisk(scenarioEvents.slice(0, 7));
  const futures = simulateFutures(result);

  assert.equal(futures.noAction.at(-1).risk, 100);
  assert.equal(futures.intervention.at(-1).risk, 18);
});

test("targeted intervention outranks full shutdown for the demo state", () => {
  const result = computeRisk(scenarioEvents.slice(0, 7));
  const ranked = rankInterventions(result);

  assert.equal(ranked[0].id, "pause_evacuate_restore");
  assert.ok(ranked[0].score > ranked[1].score);
});

test("prevention report cites event evidence and baseline behavior", () => {
  const events = scenarioEvents.slice(0, 7);
  const result = computeRisk(events);
  const [intervention] = rankInterventions(result);
  const report = generatePreventionReport(events, result, intervention);

  assert.match(report, /evt_1042/);
  assert.match(report, /evt_1050/);
  assert.match(report, /Traditional single-sensor baseline is silent/);
});
