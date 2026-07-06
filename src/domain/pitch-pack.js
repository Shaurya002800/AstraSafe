export function buildPitchPack(snapshot) {
  return {
    title: "AstraSafe AI - The Accident That Never Happened",
    oneLinePitch:
      "AstraSafe AI is a causal safety twin that predicts accident pathways before alarms trigger, then shows the safest future and the smallest intervention that prevents the incident.",
    problem:
      "Industrial plants already have sensors, permits, cameras, maintenance logs and shift records, but weak signals often remain disconnected until a threshold alarm fires too late.",
    solution:
      "AstraSafe connects live events to plant context, computes deterministic compound risk, retrieves similar incident memory, simulates futures and produces an evidence-backed prevention checklist.",
    demoFlow: [
      "Open with Zone C normal and the traditional gas baseline silent.",
      "Play weak signals: rising gas trend, VF-2 maintenance delay, HW-204 hot work, workers entering Zone C and shift handover.",
      "Jump to prevention: show risk 86 while the gas threshold alarm is still silent.",
      "Show the causal pathway and knowledge graph connecting workers, permit, sensor, fan and NearMiss-17.",
      "Show counterfactual replay: no action reaches 100 risk, intervention drops to 18.",
      "Close with the prevention report, benchmark suite and submission readiness mapping."
    ],
    proofPoints: [
      `${snapshot.metrics.leadTimeMinutes} minutes of lead time before the traditional threshold alarm.`,
      `${snapshot.metrics.projectedRiskReduction} point projected risk reduction after the recommended intervention.`,
      `${snapshot.intelligence.graphContext.activeNodeCount} active graph nodes and ${snapshot.intelligence.graphContext.activeRelationshipCount} active graph links explain the accident pathway.`,
      `${snapshot.benchmark.summary.scenarioCount} benchmark scenarios with ${Math.round(snapshot.benchmark.summary.astraSafeDetectionRate * 100)}% AstraSafe detection in the synthetic suite.`,
      `${snapshot.metrics.evidenceCount} event/source evidence links in the prevention state.`
    ],
    apiCatalog: [
      "/api/health",
      "/api/world/current?step=6",
      "/api/risk/current?step=6",
      "/api/futures/simulate?step=6",
      "/api/intelligence/permit?step=6",
      "/api/intelligence/memory?step=6",
      "/api/graph/context?step=6",
      "/api/reports/latest?step=6",
      "/api/evaluation/summary",
      "/api/evaluation/benchmark",
      "/api/submission/readiness",
      "/api/submission/pitch-pack"
    ],
    closingLine:
      "This is not emergency response. This is emergency prevention: before the alarm, before the accident.",
    markdown: buildPitchMarkdown(snapshot)
  };
}

function buildPitchMarkdown(snapshot) {
  return [
    "# AstraSafe AI - The Accident That Never Happened",
    "",
    "## One-line pitch",
    "AstraSafe AI is a causal safety twin that predicts accident pathways before alarms trigger, then shows the safest future and the smallest intervention that prevents the incident.",
    "",
    "## Demo proof",
    `- AstraSafe alert: ${snapshot.evaluation.astrasafe.alertClock}`,
    `- Traditional baseline alert: ${snapshot.evaluation.baseline.alertClock}`,
    `- Lead time gained: ${snapshot.metrics.leadTimeMinutes} minutes`,
    `- Risk reduction: ${snapshot.metrics.noActionFinalRisk} to ${snapshot.metrics.actionFinalRisk}`,
    `- Evidence links: ${snapshot.metrics.evidenceCount}`,
    "",
    "## What to show",
    "1. Play the scenario from normal state.",
    "2. Jump to Prevention.",
    "3. Show risk, causal pathway, knowledge graph and permit intelligence.",
    "4. Show counterfactual replay and prevention report.",
    "5. Show benchmark suite and submission readiness.",
    "",
    "## Judge-safe claim",
    snapshot.submission.judgeSafeClaim,
    "",
    "## Closing line",
    "This is not emergency response. This is emergency prevention: before the alarm, before the accident."
  ].join("\n");
}
