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
import { buildEvidenceBundle } from "../src/domain/evidence-bundle.js";
import { buildAdapterReadiness } from "../src/domain/adapters.js";
import { buildResponseOrchestration } from "../src/domain/orchestration.js";
import { buildGovernanceModelCard } from "../src/domain/governance.js";

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
  assert.equal(benchmark.summary.baselineDetectionRate, 0.75);
  assert.equal(benchmark.summary.simpleRuleDetectionRate, 0.75);
  assert.equal(benchmark.summary.baselineMisses, 1);
  assert.equal(benchmark.summary.simpleRuleMisses, 1);
  assert.equal(benchmark.summary.averageLeadTimeMinutes, 22);
  assert.equal(benchmark.scenarios[0].riskAfter, 18);
  assert.equal(benchmark.methodology.version, "synthetic-benchmark-v1");
  assert.match(benchmark.methodology.claimBoundary, /not real-plant accuracy claims/);
  assert.ok(benchmark.scenarios.every((scenario) => scenario.causalSignals.length >= 4));
});

test("submission readiness maps build evidence to judging criteria", () => {
  const snapshot = buildSnapshot(6);
  const submission = buildSubmissionReadiness(snapshot);

  assert.equal(submission.status, "submission_ready_mvp");
  assert.ok(submission.overallReadiness >= 85);
  assert.equal(submission.criteria.length, 5);
  assert.ok(submission.deliverables.some((item) => item.id === "pitch_deck" && item.status === "ready"));
  assert.ok(submission.deliverables.some((item) => item.id === "demo_video" && item.status === "next"));
  assert.ok(
    submission.deliverables.some((item) => item.id === "public_deployment" && item.status === "next")
  );
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

test("evidence bundle packages auditable prevention state", () => {
  const snapshot = buildSnapshot(6);
  const bundle = buildEvidenceBundle(snapshot);

  assert.equal(bundle.bundleId, "ASTRA-evt_1074");
  assert.equal(bundle.manifest.riskScore, 86);
  assert.equal(bundle.manifest.evidenceLinks, 7);
  assert.equal(bundle.manifest.activeGraphNodes, 14);
  assert.match(bundle.markdown, /AstraSafe Evidence Bundle/);
  assert.match(bundle.contents.preventionReport, /Critical pre-incident/);
});

test("adapter readiness defines real integration contracts", () => {
  const snapshot = buildSnapshot(6);
  const readiness = buildAdapterReadiness(snapshot);

  assert.equal(readiness.adapters.length, 6);
  assert.ok(readiness.adapters.every((adapter) => adapter.requiredFields.length > 0));
  assert.ok(readiness.adapters.some((adapter) => adapter.id === "sensor_scada" && adapter.activeInScenario));
  assert.ok(readiness.productionPath.some((step) => step.includes("SCADA")));
});

test("response orchestration keeps critical actions human-approved", () => {
  const snapshot = buildSnapshot(6);
  const orchestration = buildResponseOrchestration(snapshot);

  assert.equal(orchestration.mode, "human_approval_required");
  assert.equal(orchestration.incidentCommandState, "prevention_escalation");
  assert.ok(orchestration.approvalGates.every((gate) => gate.owner));
  assert.ok(orchestration.dispatchMessages.some((message) => message.channel === "Safety Officer"));
  assert.match(orchestration.evacuationPlan.route, /Gate 3/);
});

test("governance model card prevents unsafe production overclaiming", () => {
  const snapshot = buildSnapshot(6);
  const governance = buildGovernanceModelCard(snapshot);

  assert.equal(governance.productionGate, "pilot_only");
  assert.match(governance.notFor, /Autonomous plant shutdown/);
  assert.ok(governance.humanOversight.some((item) => item.includes("human approval")));
  assert.ok(governance.privacy.some((item) => item.includes("metadata only")));
  assert.ok(governance.limitations.some((item) => item.includes("Synthetic scenario data")));
});
