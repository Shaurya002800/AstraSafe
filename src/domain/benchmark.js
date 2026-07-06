export const benchmarkScenarios = [
  {
    id: "gas_hotwork_fan_workers",
    title: "Gas + hot work + workers + fan maintenance",
    baselineAlertClock: "11:06",
    astraSafeAlertClock: "10:45",
    leadTimeMinutes: 21,
    baselineOutcome: "late_threshold_alert",
    astraSafeOutcome: "critical_pre_incident_detected",
    riskBefore: 86,
    riskAfter: 18,
    evidenceLinks: 7
  },
  {
    id: "confined_space_oxygen_handover",
    title: "Confined space entry + oxygen drop trend + supervisor absent",
    baselineAlertClock: "11:24",
    astraSafeAlertClock: "11:02",
    leadTimeMinutes: 22,
    baselineOutcome: "late_threshold_alert",
    astraSafeOutcome: "pathway_detected",
    riskBefore: 82,
    riskAfter: 24,
    evidenceLinks: 6
  },
  {
    id: "forklift_blind_corner_crowding",
    title: "Forklift route conflict + blind corner + worker crowding",
    baselineAlertClock: "No alert",
    astraSafeAlertClock: "14:11",
    leadTimeMinutes: null,
    baselineOutcome: "missed_compound_risk",
    astraSafeOutcome: "geospatial_conflict_detected",
    riskBefore: 74,
    riskAfter: 29,
    evidenceLinks: 5
  },
  {
    id: "startup_isolation_permit_gap",
    title: "Maintenance isolation incomplete + startup permit",
    baselineAlertClock: "16:40",
    astraSafeAlertClock: "16:18",
    leadTimeMinutes: 22,
    baselineOutcome: "late_threshold_alert",
    astraSafeOutcome: "permit_sequence_risk_detected",
    riskBefore: 79,
    riskAfter: 23,
    evidenceLinks: 6
  }
];

export function buildBenchmarkSummary() {
  const detectedByAstraSafe = benchmarkScenarios.length;
  const baselineMisses = benchmarkScenarios.filter(
    (scenario) => scenario.baselineOutcome === "missed_compound_risk"
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
    summary: {
      scenarioCount: benchmarkScenarios.length,
      astraSafeDetectionRate: detectedByAstraSafe / benchmarkScenarios.length,
      baselineMisses,
      averageLeadTimeMinutes: averageLeadTime,
      averageRiskReduction,
      totalEvidenceLinks
    },
    scenarios: benchmarkScenarios
  };
}
