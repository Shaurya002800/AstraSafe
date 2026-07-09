import { getEventsUntil, plantLayout, scenarioEvents } from "./scenario.js";
import {
  buildPathway,
  computeRisk,
  generatePreventionReport,
  rankInterventions,
  riskWeights,
  simulateFutures
} from "./risk-engine.js";
import { buildEvaluationSummary } from "./evaluation.js";
import {
  buildActionChecklist,
  evaluatePermitIntelligence,
  retrieveIncidentMemory
} from "./intelligence.js";
import { buildGraphContext } from "./graph-context.js";
import { buildBenchmarkSummary } from "./benchmark.js";
import { buildSubmissionReadiness } from "./submission.js";
import { buildPitchPack } from "./pitch-pack.js";
import { buildRecordingPlan } from "./recording-plan.js";
import { buildEvidenceBundle } from "./evidence-bundle.js";
import { buildAdapterReadiness } from "./adapters.js";
import { buildResponseOrchestration } from "./orchestration.js";
import { buildGovernanceModelCard } from "./governance.js";

export function clampEventIndex(index = 0) {
  const parsed = Number(index);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(scenarioEvents.length - 2, Math.max(0, Math.trunc(parsed)));
}

export function buildSnapshot(index = 0) {
  const eventIndex = clampEventIndex(index);
  const events = getEventsUntil(eventIndex);
  const currentEvent = events.at(-1);
  const risk = computeRisk(events);
  const futures = simulateFutures(risk);
  const interventions = rankInterventions(risk);
  const pathway = buildPathway(risk);
  const permitIntelligence = evaluatePermitIntelligence(events, risk);
  const incidentMemory = retrieveIncidentMemory(events, risk);
  const actionChecklist = buildActionChecklist(risk, permitIntelligence);
  const graphContext = buildGraphContext(events, risk);
  const report = generatePreventionReport(events, risk, interventions[0]);
  const actionFinalRisk = futures.intervention.at(-1).risk;
  const noActionFinalRisk = futures.noAction.at(-1).risk;

  const snapshot = {
    meta: {
      product: "AstraSafe AI",
      modelVersion: "causal-risk-v1",
      simulationMode: "deterministic_replay",
      scenarioId: plantLayout.scenarioId,
      plant: plantLayout.plant,
      generatedAtClock: currentEvent.clock
    },
    cursor: {
      eventIndex,
      totalSteps: scenarioEvents.length - 1,
      currentEventId: currentEvent.eventId
    },
    world: {
      zones: plantLayout.zones,
      graph: plantLayout.graph,
      incidentMemory: plantLayout.incidentMemory,
      currentState: risk.currentState,
      activeEvents: events
    },
    risk,
    futures,
    interventions,
    pathway,
    intelligence: {
      permit: permitIntelligence,
      incidentMemory,
      actionChecklist,
      graphContext
    },
    report,
    metrics: {
      leadTimeMinutes: risk.leadTimeMinutes,
      baselineStatus: risk.baselineWouldAlert ? "alerting" : "silent",
      evidenceCount: risk.evidence.length,
      projectedRiskReduction: Math.max(0, noActionFinalRisk - actionFinalRisk),
      noActionFinalRisk,
      actionFinalRisk
    },
    methodology: {
      scoring: "weighted_compound_risk",
      weights: riskWeights,
      guardrails: [
        "Risk score is deterministic and does not depend on free-form LLM output.",
        "Recommendations are advisory and require human approval for real operations.",
        "Every prevention claim is linked to event IDs or source IDs."
      ]
    },
    evaluation: index === false ? undefined : buildEvaluationSummary(),
    benchmark: buildBenchmarkSummary()
  };

  const enrichedSnapshot = {
    ...snapshot,
    submission: buildSubmissionReadiness(snapshot),
    adapterReadiness: buildAdapterReadiness(snapshot),
    responseOrchestration: buildResponseOrchestration(snapshot)
  };

  return {
    ...enrichedSnapshot,
    pitchPack: buildPitchPack(enrichedSnapshot),
    recordingPlan: buildRecordingPlan(enrichedSnapshot),
    evidenceBundle: buildEvidenceBundle(enrichedSnapshot),
    governance: buildGovernanceModelCard(enrichedSnapshot)
  };
}
