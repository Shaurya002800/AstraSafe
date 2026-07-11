export const benchmarkScenarios = [
  {
    id: "gas_hotwork_fan_workers",
    title: "Gas + hot work + workers + fan maintenance",
    validationType: "deterministic_synthetic_replay",
    causalSignals: ["gas trend", "hot-work permit", "worker exposure", "fan delay", "shift handover"],
    baselineAlertClock: "11:06",
    simpleRuleAlertClock: "10:51",
    astraSafeAlertClock: "10:45",
    leadTimeMinutes: 21,
    baselineOutcome: "late_threshold_alert",
    simpleRuleOutcome: "partial_context_alert",
    astraSafeOutcome: "critical_pre_incident_detected",
    riskBefore: 86,
    riskAfter: 18,
    evidenceLinks: 7,
    recommendedIntervention: "Pause HW-204, evacuate Zone C and restore VF-2"
  },
  {
    id: "confined_space_oxygen_handover",
    title: "Confined space entry + oxygen drop trend + supervisor absent",
    validationType: "deterministic_synthetic_replay",
    causalSignals: ["oxygen trend", "confined-space permit", "worker exposure", "supervisor absence"],
    baselineAlertClock: "11:24",
    simpleRuleAlertClock: "11:10",
    astraSafeAlertClock: "11:02",
    leadTimeMinutes: 22,
    baselineOutcome: "late_threshold_alert",
    simpleRuleOutcome: "partial_context_alert",
    astraSafeOutcome: "pathway_detected",
    riskBefore: 82,
    riskAfter: 24,
    evidenceLinks: 6,
    recommendedIntervention: "Suspend entry, verify atmosphere and restore supervision"
  },
  {
    id: "forklift_blind_corner_crowding",
    title: "Forklift route conflict + blind corner + worker crowding",
    validationType: "deterministic_synthetic_replay",
    causalSignals: ["forklift route", "blind corner", "worker crowding", "restricted visibility"],
    baselineAlertClock: "No alert",
    simpleRuleAlertClock: "No alert",
    astraSafeAlertClock: "14:11",
    leadTimeMinutes: null,
    baselineOutcome: "missed_compound_risk",
    simpleRuleOutcome: "missed_geospatial_context",
    astraSafeOutcome: "geospatial_conflict_detected",
    riskBefore: 74,
    riskAfter: 29,
    evidenceLinks: 5,
    recommendedIntervention: "Hold forklift route and clear the pedestrian conflict zone"
  },
  {
    id: "startup_isolation_permit_gap",
    title: "Maintenance isolation incomplete + startup permit",
    validationType: "deterministic_synthetic_replay",
    causalSignals: ["incomplete isolation", "startup permit", "equipment state", "maintenance sequence"],
    baselineAlertClock: "16:40",
    simpleRuleAlertClock: "16:27",
    astraSafeAlertClock: "16:18",
    leadTimeMinutes: 22,
    baselineOutcome: "late_threshold_alert",
    simpleRuleOutcome: "partial_context_alert",
    astraSafeOutcome: "permit_sequence_risk_detected",
    riskBefore: 79,
    riskAfter: 23,
    evidenceLinks: 6,
    recommendedIntervention: "Block startup and complete isolation verification"
  }
];

export function buildBenchmarkSummary() {
  const detectedByAstraSafe = benchmarkScenarios.length;
  const baselineMisses = benchmarkScenarios.filter(
    (scenario) => scenario.baselineOutcome === "missed_compound_risk"
  ).length;
  const simpleRuleMisses = benchmarkScenarios.filter(
    (scenario) => scenario.simpleRuleOutcome.startsWith("missed_")
  ).length;
  const leadTimes = benchmarkScenarios
    .map((scenario) => scenario.leadTimeMinutes)
    .filter((value) => Number.isFinite(value));
  const averageLeadTime = Math.round(
    leadTimes.reduce((sum, value) => sum + value, 0) / leadTimes.length
  );
  const averageRiskReduction = Math.round(
    benchmarkScenarios.reduce(
      (sum, scenario) => sum + Math.max(0, scenario.riskBefore - scenario.riskAfter),
      0
    ) / benchmarkScenarios.length
  );
  const totalEvidenceLinks = benchmarkScenarios.reduce(
    (sum, scenario) => sum + scenario.evidenceLinks,
    0
  );

  return {
    methodology: {
      version: "synthetic-benchmark-v1",
      validationType: "Deterministic synthetic scenario replay",
      claimBoundary:
        "Results demonstrate prototype behavior under authored scenarios; they are not real-plant accuracy claims.",
      comparators: [
        "Single-sensor threshold baseline",
        "Two-factor static rule baseline",
        "AstraSafe compound causal engine"
      ],
      formulas: {
        detectionRate: "detected scenarios / total scenarios",
        leadTime: "traditional threshold alert time - AstraSafe alert time",
        riskReduction: "no-action projected risk - intervention projected risk"
      }
    },
    summary: {
      scenarioCount: benchmarkScenarios.length,
      astraSafeDetectionRate: detectedByAstraSafe / benchmarkScenarios.length,
      baselineDetectionRate: (benchmarkScenarios.length - baselineMisses) / benchmarkScenarios.length,
      simpleRuleDetectionRate:
        (benchmarkScenarios.length - simpleRuleMisses) / benchmarkScenarios.length,
      baselineMisses,
      simpleRuleMisses,
      averageLeadTimeMinutes: averageLeadTime,
      averageRiskReduction,
      totalEvidenceLinks
    },
    scenarios: benchmarkScenarios
  };
}
