export function buildEvidenceBundle(snapshot) {
  const generatedAt = `${snapshot.meta.plant}-${snapshot.meta.scenarioId}-${snapshot.meta.generatedAtClock}`.replaceAll(
    " ",
    "_"
  );

  return {
    bundleId: `ASTRA-${snapshot.cursor.currentEventId}`,
    generatedAt,
    manifest: {
      scenarioId: snapshot.meta.scenarioId,
      modelVersion: snapshot.meta.modelVersion,
      simulationMode: snapshot.meta.simulationMode,
      currentEventId: snapshot.cursor.currentEventId,
      riskScore: snapshot.risk.score,
      riskState: snapshot.risk.state,
      evidenceLinks: snapshot.metrics.evidenceCount,
      activeGraphNodes: snapshot.intelligence.graphContext.activeNodeCount,
      activeGraphLinks: snapshot.intelligence.graphContext.activeRelationshipCount,
      reportIncluded: true,
      benchmarkIncluded: true,
      judgeSafeClaimIncluded: true
    },
    contents: {
      currentState: snapshot.risk.currentState,
      riskFactors: snapshot.risk.factors,
      evidence: snapshot.risk.evidence,
      graphContext: snapshot.intelligence.graphContext,
      permit: snapshot.intelligence.permit,
      incidentMemory: snapshot.intelligence.incidentMemory,
      intervention: snapshot.interventions[0],
      futures: snapshot.futures,
      preventionReport: snapshot.report,
      benchmark: snapshot.benchmark.summary,
      judgeSafeClaim: snapshot.submission.judgeSafeClaim
    },
    auditNotes: [
      "Risk scoring is deterministic and auditable.",
      "LLM-style narrative is generated from verified scenario data only.",
      "AstraSafe recommendations require safety officer approval in real operations.",
      "Synthetic data is used for hackathon demonstration and repeatable evaluation."
    ],
    markdown: buildEvidenceMarkdown(snapshot)
  };
}

function buildEvidenceMarkdown(snapshot) {
  return [
    "# AstraSafe Evidence Bundle",
    "",
    `Bundle event: ${snapshot.cursor.currentEventId}`,
    `Scenario: ${snapshot.meta.scenarioId}`,
    `Risk: ${snapshot.risk.score}/100 - ${snapshot.risk.state}`,
    `Lead time: ${snapshot.metrics.leadTimeMinutes} minutes`,
    `Projected risk reduction: ${snapshot.metrics.projectedRiskReduction} points`,
    "",
    "## Evidence",
    ...snapshot.risk.evidence.map(
      (item) => `- ${item.detail} [${item.eventId} / ${item.source}]`
    ),
    "",
    "## Recommended intervention",
    `${snapshot.interventions[0].title}: ${snapshot.interventions[0].expectedEffect}`,
    "",
    "## Judge-safe claim",
    snapshot.submission.judgeSafeClaim,
    "",
    "## Prevention report",
    snapshot.report
  ].join("\n");
}
