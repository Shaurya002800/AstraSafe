import { plantLayout } from "./scenario.js";

export const riskWeights = {
  sensorAnomaly: 0.22,
  permitConflict: 0.18,
  workerExposure: 0.16,
  equipmentDegradation: 0.14,
  historicalSimilarity: 0.12,
  shiftVulnerability: 0.1,
  evacuationConstraint: 0.08
};

export const factorLabels = {
  sensorAnomaly: "Sensor anomaly",
  permitConflict: "Permit conflict",
  workerExposure: "Worker exposure",
  equipmentDegradation: "Equipment degradation",
  historicalSimilarity: "Incident memory similarity",
  shiftVulnerability: "Shift vulnerability",
  evacuationConstraint: "Evacuation constraint"
};

const emptyFactors = {
  sensorAnomaly: 0,
  permitConflict: 0,
  workerExposure: 0,
  equipmentDegradation: 0,
  historicalSimilarity: 0,
  shiftVulnerability: 0,
  evacuationConstraint: 0
};

function latest(events, type) {
  return [...events].reverse().find((event) => event.type === type);
}

function has(events, type) {
  return events.some((event) => event.type === type);
}

export function deriveCurrentState(events) {
  const gasEvent = [...events]
    .reverse()
    .find((event) => event.gasPpm !== undefined && event.source === "sensor.G7");
  const cctvEvent = latest(events, "cctv_detection");

  return {
    gasPpm: gasEvent?.gasPpm ?? 42,
    gasTrend: gasEvent?.trend ?? "stable",
    fanDelayed: has(events, "maintenance_delay"),
    hotWorkActive: has(events, "permit_activated"),
    workerCount: cctvEvent?.workerCount ?? 0,
    shiftHandover: has(events, "shift_handover_started"),
    preventionAlerted: has(events, "astrasafe_prevention_alert"),
    traditionalAlarmed: has(events, "traditional_alarm")
  };
}

export function computeRisk(events) {
  const state = deriveCurrentState(events);
  const factors = { ...emptyFactors };
  const evidence = [];

  const gasRatio = Math.min(state.gasPpm / 100, 1);
  if (state.gasTrend === "rising_fast") {
    factors.sensorAnomaly = Math.max(76, Math.round(gasRatio * 88));
    evidence.push({
      factor: "sensorAnomaly",
      eventId: "evt_1042",
      source: "sensor.G7",
      detail: "Gas is rising fast while still below the alarm threshold."
    });
  } else if (state.gasPpm > 45) {
    factors.sensorAnomaly = Math.round(gasRatio * 48);
  }

  if (state.hotWorkActive && state.gasTrend === "rising_fast") {
    factors.permitConflict = 96;
    evidence.push({
      factor: "permitConflict",
      eventId: "evt_1050",
      source: "permit.HW204",
      detail: "Hot work is active in the same zone as the rising combustible gas trend."
    });
  } else if (state.hotWorkActive) {
    factors.permitConflict = 38;
  }

  if (state.workerCount > 0) {
    factors.workerExposure = Math.min(100, 45 + state.workerCount * 17);
    evidence.push({
      factor: "workerExposure",
      eventId: "evt_1061",
      source: "camera.CAM_C",
      detail: `${state.workerCount} workers are exposed inside Zone C.`
    });
  }

  if (state.fanDelayed) {
    factors.equipmentDegradation = 90;
    evidence.push({
      factor: "equipmentDegradation",
      eventId: "evt_1035",
      source: "maintenance.VF2",
      detail: "Ventilation Fan VF-2 is delayed, reducing the zone safety margin."
    });
  }

  if (state.gasTrend === "rising_fast" && state.hotWorkActive && state.fanDelayed) {
    factors.historicalSimilarity = Math.round(plantLayout.incidentMemory.similarity * 100);
    evidence.push({
      factor: "historicalSimilarity",
      eventId: plantLayout.incidentMemory.sourceId,
      source: plantLayout.incidentMemory.sourceId,
      detail: "NearMiss-17 matches the gas + hot work + degraded ventilation pattern."
    });
  }

  if (state.shiftHandover) {
    factors.shiftVulnerability = 82;
    evidence.push({
      factor: "shiftVulnerability",
      eventId: "evt_1068",
      source: "shift.S3",
      detail: "Supervisor handover increases response coordination risk."
    });
  }

  if (state.workerCount >= 3 && state.hotWorkActive) {
    factors.evacuationConstraint = 70;
    evidence.push({
      factor: "evacuationConstraint",
      eventId: "evt_1061",
      source: "camera.CAM_C",
      detail: "Multiple workers must be cleared from a high-hazard zone."
    });
  }

  const score = Math.round(
    Object.entries(riskWeights).reduce((sum, [key, weight]) => sum + factors[key] * weight, 0)
  );

  return {
    score,
    state: classifyRisk(score),
    factors,
    evidence,
    currentState: state,
    traditionalAlarm: state.gasPpm >= 100,
    baselineWouldAlert: state.gasPpm >= 100,
    leadTimeMinutes:
      score >= 76 && !state.traditionalAlarmed && state.gasPpm < 100 ? 21 : score >= 56 ? 16 : 0
  };
}

export function classifyRisk(score) {
  if (score >= 91) return "Emergency";
  if (score >= 76) return "Critical pre-incident";
  if (score >= 56) return "Accident pathway forming";
  if (score >= 31) return "Weak signal";
  return "Normal";
}

export function simulateFutures(riskResult) {
  const current = riskResult.score;
  const noAction = [0, 5, 10, 15, 21].map((minute, index) => ({
    minute,
    risk: Math.min(100, Math.round(current + [0, 5, 9, 16, 23][index]))
  }));
  const intervention = [0, 2, 4, 7, 10].map((minute, index) => ({
    minute,
    risk: Math.max(14, Math.round(current - [0, 22, 44, 61, 68][index]))
  }));

  return {
    noAction,
    intervention,
    narrative: {
      noAction:
        "If no action is taken, the system projects the gas trend, active ignition source, worker exposure and handover delay will continue converging toward a threshold breach.",
      intervention:
        "Pausing HW-204 removes the ignition source, evacuation removes exposure, and restoring VF-2 rebuilds the safety margin."
    }
  };
}

export function rankInterventions(riskResult) {
  const futures = simulateFutures(riskResult);
  const noActionFinal = futures.noAction.at(-1).risk;
  const interventionFinal = futures.intervention.at(-1).risk;
  const projectedRiskReduction = (noActionFinal - interventionFinal) / 100;
  const responseSpeed = 0.88;
  const confidence = 0.87;
  const reversibility = 0.81;
  const operationalDisruption = 0.42;
  const score =
    0.4 * projectedRiskReduction +
    0.2 * responseSpeed +
    0.15 * confidence +
    0.15 * reversibility -
    0.1 * operationalDisruption;

  return [
    {
      id: "pause_evacuate_restore",
      title: "Pause HW-204, evacuate Zone C, restore VF-2",
      summary:
        "Removes ignition source and worker exposure while the ventilation protection layer is restored.",
      score: Number(score.toFixed(2)),
      confidence,
      expectedEffect: `Risk drops from ${riskResult.score} to ${interventionFinal} within 10 minutes.`,
      disruption: "Medium-low",
      evidence: ["sensor.G7", "permit.HW204", "worker.W12/W14/W19", "maintenance.VF2", "incident.NM17"]
    },
    {
      id: "full_zone_shutdown",
      title: "Full Zone C shutdown",
      summary:
        "Highly effective but more disruptive than the targeted intervention for the current state.",
      score: 0.67,
      confidence: 0.91,
      expectedEffect: "Risk drops quickly, with higher production impact.",
      disruption: "High",
      evidence: ["zone.C", "permit.HW204", "maintenance.VF2"]
    }
  ].sort((a, b) => b.score - a.score);
}

export function buildPathway(riskResult) {
  const order = [
    "sensorAnomaly",
    "equipmentDegradation",
    "permitConflict",
    "workerExposure",
    "shiftVulnerability",
    "historicalSimilarity"
  ];

  return order
    .map((factor) => riskResult.evidence.find((item) => item.factor === factor))
    .filter(Boolean)
    .map((item) => ({
      title: factorLabels[item.factor],
      detail: item.detail,
      eventId: item.eventId
    }));
}

export function generatePreventionReport(events, riskResult, intervention) {
  const state = riskResult.currentState;
  const lines = [
    "AstraSafe Prevention Report",
    "Report ID: PREV-2026-001",
    "Plant: Nova Steel Demo",
    "Zone: Zone C",
    `Generated at: ${events.at(-1).clock}`,
    "",
    "1. Current state",
    `${riskResult.state}. Compound risk score: ${riskResult.score}/100.`,
    "",
    "2. Confirmed evidence",
    ...riskResult.evidence.map((item) => `- ${item.detail} [${item.eventId}]`),
    "",
    "3. Prediction",
    riskResult.leadTimeMinutes
      ? `AstraSafe predicts escalation ${riskResult.leadTimeMinutes} minutes before the traditional gas threshold alarm.`
      : "No critical escalation predicted yet.",
    "",
    "4. Recommended intervention",
    intervention
      ? `${intervention.title}. ${intervention.expectedEffect} Confidence: ${intervention.confidence}.`
      : "Continue monitoring.",
    "",
    "5. Baseline comparison",
    riskResult.baselineWouldAlert
      ? "Traditional single-sensor baseline would alert."
      : `Traditional single-sensor baseline is silent because gas is ${state.gasPpm} ppm below the 100 ppm threshold.`,
    "",
    "6. Uncertainty",
    "CCTV confidence is 0.84; worker count should be verified by the shift supervisor before physical action."
  ];

  return lines.join("\n");
}
