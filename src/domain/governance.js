export function buildGovernanceModelCard(snapshot) {
  return {
    modelName: "AstraSafe causal-risk-v1",
    modelType: "deterministic_compound_risk_engine",
    intendedUse:
      "Early warning and decision support for industrial safety officers during compound-risk formation.",
    notFor:
      "Autonomous plant shutdown, replacing certified safety systems, replacing trained safety officers or making legal compliance claims without site validation.",
    validationStatus: {
      current: "synthetic_hackathon_validation",
      evidence:
        `${snapshot.benchmark.summary.scenarioCount} synthetic benchmark scenarios, deterministic replay and browser-tested dashboard outputs.`,
      requiredBeforeProduction: [
        "Domain expert review of risk weights and causal rules.",
        "Site-specific calibration using historical incidents and near misses.",
        "Integration testing with plant historian, permit system and CCTV metadata.",
        "Safety officer acceptance testing and incident response drills."
      ]
    },
    humanOversight: [
      "Permit pause, evacuation, shutdown and restart actions require human approval.",
      "AstraSafe can recommend actions but cannot execute high-impact operations in production mode.",
      "Every recommendation must expose evidence, uncertainty and responsible owner."
    ],
    privacy: [
      "CCTV use is represented as metadata only: worker count, zone and confidence.",
      "No face recognition, biometric identification or raw video storage is required for the MVP.",
      "Worker identifiers are synthetic and should be minimized or pseudonymized in real deployments."
    ],
    reliabilityControls: [
      "Risk score is deterministic and independent of free-form LLM text.",
      "Narrative/report text is generated only from verified event data.",
      "Evidence bundle preserves event IDs and source IDs.",
      "Baseline comparison is explicit so prevention claims remain measurable."
    ],
    limitations: [
      "Synthetic scenario data is not proof of production performance.",
      "Risk weights are reasonable demo defaults, not certified process-safety parameters.",
      "Computer vision is represented by mocked metadata labels in this MVP.",
      "Real deployment requires plant-specific validation, governance and fallback to existing safety systems."
    ],
    productionGate: snapshot.submission.status === "submission_ready_mvp" ? "pilot_only" : "prototype"
  };
}
