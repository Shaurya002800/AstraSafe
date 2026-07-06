import { getEventsUntil, scenarioEvents } from "./scenario.js";
import { computeRisk, simulateFutures } from "./risk-engine.js";

function eventByType(type) {
  return scenarioEvents.find((event) => event.type === type);
}

export function buildEvaluationSummary() {
  const preventionEvent = eventByType("astrasafe_prevention_alert");
  const traditionalEvent = eventByType("traditional_alarm");
  const preventionIndex = scenarioEvents.findIndex(
    (event) => event.type === "astrasafe_prevention_alert"
  );
  const events = getEventsUntil(preventionIndex);
  const risk = computeRisk(events);
  const futures = simulateFutures(risk);
  const projectedRiskReduction = futures.noAction.at(-1).risk - futures.intervention.at(-1).risk;

  return {
    scenarioId: "accident_that_never_happened",
    title: "Gas + hot work + workers + fan maintenance",
    baseline: {
      name: "Single-sensor gas threshold",
      alertClock: traditionalEvent.clock,
      alertCondition: "Gas Sensor G7 reaches 100 ppm"
    },
    astrasafe: {
      alertClock: preventionEvent.clock,
      alertCondition: "Compound pathway score reaches critical pre-incident band",
      riskScore: risk.score
    },
    metrics: {
      leadTimeMinutes: risk.leadTimeMinutes,
      baselineSilentAtAstraSafeAlert: !risk.baselineWouldAlert,
      projectedRiskReduction,
      evidenceLinks: risk.evidence.length
    },
    result:
      "AstraSafe detects the compound accident pathway while the single-sensor baseline remains silent."
  };
}
