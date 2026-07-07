import test from "node:test";
import assert from "node:assert/strict";

import { scenarioEvents } from "../src/domain/scenario.js";
import {
  computeRisk,
  generatePreventionReport,
  rankInterventions,
  simulateFutures
} from "../src/domain/risk-engine.js";
import { buildSnapshot } from "../src/domain/snapshot.js";
import { buildEvaluationSummary } from "../src/domain/evaluation.js";
import {
  buildActionChecklist,
  evaluatePermitIntelligence,
  retrieveIncidentMemory
} from "../src/domain/intelligence.js";
import { buildGraphContext } from "../src/domain/graph-context.js";
import { buildBenchmarkSummary } from "../src/domain/benchmark.js";
import { buildSubmissionReadiness } from "../src/domain/submission.js";
import { buildPitchPack } from "../src/domain/pitch-pack.js";
import { buildRecordingPlan } from "../src/domain/recording-plan.js";

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

test("shared snapshot exposes API-ready world, metrics, and methodology", () => {
  const snapshot = buildSnapshot(6);

  assert.equal(snapshot.meta.modelVersion, "causal-risk-v1");
  assert.equal(snapshot.risk.score, 86);
  assert.equal(snapshot.metrics.baselineStatus, "silent");
  assert.equal(snapshot.metrics.projectedRiskReduction, 82);
  assert.ok(snapshot.methodology.guardrails[0].includes("deterministic"));
  assert.ok(snapshot.world.graph.length > 0);
});

test("evaluation summary proves baseline miss and lead-time gain", () => {
  const evaluation = buildEvaluationSummary();

  assert.equal(evaluation.baseline.alertClock, "11:06");
  assert.equal(evaluation.astrasafe.alertClock, "10:45");
  assert.equal(evaluation.metrics.leadTimeMinutes, 21);
  assert.equal(evaluation.metrics.baselineSilentAtAstraSafeAlert, true);
});

test("permit intelligence marks hot work unsafe after context changes", () => {
  const events = scenarioEvents.slice(0, 7);
  const risk = computeRisk(events);
  const permit = evaluatePermitIntelligence(events, risk);

  assert.equal(permit.currentStatus, "Unsafe after issue");
  assert.ok(permit.conflicts.length >= 4);
  assert.match(permit.recommendation, /Pause permit/);
});

test("incident memory returns near-miss and SOP matches", () => {
  const events = scenarioEvents.slice(0, 7);
  const risk = computeRisk(events);
  const memory = retrieveIncidentMemory(events, risk);

  assert.equal(memory.matches[0].sourceId, "incident.NM17");
  assert.equal(memory.matches[1].sourceId, "sop.HOTWORK.07");
  assert.ok(memory.matches[0].similarity > 0.85);
});

test("action checklist escalates required actions in critical state", () => {
  const events = scenarioEvents.slice(0, 7);
  const risk = computeRisk(events);
  const permit = evaluatePermitIntelligence(events, risk);
  const checklist = buildActionChecklist(risk, permit);

  assert.equal(checklist[0].status, "required");
  assert.equal(checklist[1].status, "required");
  assert.ok(checklist.some((item) => item.id === "preserve_evidence"));
});

test("knowledge graph context exposes active causal paths", () => {
  const events = scenarioEvents.slice(0, 7);
  const risk = computeRisk(events);
  const graph = buildGraphContext(events, risk);

  assert.ok(graph.activeNodeCount >= 8);
  assert.ok(graph.activeRelationshipCount >= 7);
  assert.ok(graph.causalPaths.some((path) => path.includes("CONFLICTS_WITH")));
  assert.match(graph.summary, /worker exposure/);
});

test("benchmark suite summarizes multi-scenario evaluation", () => {
  const benchmark = buildBenchmarkSummary();

  assert.equal(benchmark.summary.scenarioCount, 4);
  assert.equal(benchmark.summary.astraSafeDetectionRate, 1);
  assert.equal(benchmark.summary.baselineMisses, 1);
  assert.equal(benchmark.summary.averageLeadTimeMinutes, 22);
  assert.equal(benchmark.scenarios[0].riskAfter, 18);
});

test("submission readiness maps build evidence to judging criteria", () => {
  const snapshot = buildSnapshot(6);
  const submission = buildSubmissionReadiness(snapshot);

  assert.equal(submission.status, "submission_ready_mvp");
  assert.ok(submission.overallReadiness >= 85);
  assert.equal(submission.criteria.length, 5);
  assert.ok(submission.deliverables.some((item) => item.id === "deck_video" && item.status === "next"));
});

test("pitch pack turns current evidence into a demo brief", () => {
  const snapshot = buildSnapshot(6);
  const pitchPack = buildPitchPack(snapshot);

  assert.match(pitchPack.oneLinePitch, /causal safety twin/);
  assert.ok(pitchPack.proofPoints.some((point) => point.includes("21 minutes")));
  assert.ok(pitchPack.apiCatalog.includes("/api/submission/pitch-pack"));
  assert.match(pitchPack.markdown, /AstraSafe alert: 10:45/);
  assert.match(pitchPack.markdown, /Lead time gained: 21 minutes/);
});

test("recording plan gives a timed storyboard for the demo video", () => {
  const snapshot = buildSnapshot(6);
  const recordingPlan = buildRecordingPlan(snapshot);

  assert.equal(recordingPlan.targetDurationSeconds, 240);
  assert.equal(recordingPlan.scenes.length, 7);
  assert.ok(recordingPlan.scenes.some((scene) => scene.narration.includes("risk 86")));
  assert.ok(recordingPlan.recordingChecklist.some((item) => item.includes("Unsafe after issue")));
});
