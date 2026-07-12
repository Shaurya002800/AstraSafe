export const judgingCriteria = [
  {
    id: "innovation",
    label: "Innovation",
    weight: 25,
    readiness: 92,
    evidence:
      "Causal accident-pathway detection, knowledge graph context and counterfactual replay differentiate AstraSafe from threshold alerts."
  },
  {
    id: "business_impact",
    label: "Business Impact",
    weight: 25,
    readiness: 90,
    evidence:
      "The demo shows 21 minutes of prevention lead time, targeted intervention and reduced shutdown ambiguity."
  },
  {
    id: "technical_excellence",
    label: "Technical Excellence",
    weight: 20,
    readiness: 88,
    evidence:
      "Deterministic risk engine, API snapshots, permit intelligence, incident memory, benchmark suite and evidence report are implemented."
  },
  {
    id: "scalability",
    label: "Scalability",
    weight: 15,
    readiness: 82,
    evidence:
      "The architecture separates simulator, risk, graph, intelligence, benchmark and API layers for future SCADA/CCTV/permit adapters."
  },
  {
    id: "user_experience",
    label: "User Experience",
    weight: 15,
    readiness: 87,
    evidence:
      "Command-center UI explains the plant state, causal chain, intervention, baseline comparison and safety checklist in one flow."
  }
];

export function buildSubmissionReadiness(snapshot) {
  const weightedScore = Math.round(
    judgingCriteria.reduce(
      (sum, criterion) => sum + criterion.readiness * (criterion.weight / 100),
      0
    )
  );

  return {
    overallReadiness: weightedScore,
    status: weightedScore >= 85 ? "submission_ready_mvp" : "needs_polish",
    finalPitch:
      "AstraSafe AI detects accident pathways before alarms trigger, explains the causal chain and recommends the smallest verified intervention.",
    judgeSafeClaim:
      "AstraSafe is a decision-support layer for safety officers. It does not replace certified safety systems or human approval.",
    criteria: judgingCriteria,
    deliverables: [
      {
        id: "prototype",
        label: "Working prototype",
        status: "ready",
        evidence: "Dashboard, simulator, risk engine, graph context, permit intelligence and reports are live."
      },
      {
        id: "api",
        label: "Inspectable APIs",
        status: "ready",
        evidence: "World, risk, futures, graph, intelligence, report, evaluation and benchmark endpoints are exposed."
      },
      {
        id: "evaluation",
        label: "Evaluation report",
        status: "ready",
        evidence: `${snapshot.benchmark.summary.scenarioCount} benchmark scenarios, ${snapshot.benchmark.summary.averageLeadTimeMinutes} min average lead time.`
      },
      {
        id: "demo_story",
        label: "Demo story",
        status: "ready",
        evidence: "The Accident That Never Happened: risk 86 before the traditional threshold alarm."
      },
      {
        id: "pitch_deck",
        label: "Presentation deck",
        status: "ready",
        evidence: "The verified 11-slide PowerPoint is available in outputs/AstraSafe_AI_Hackathon_Pitch.pptx."
      },
      {
        id: "demo_video",
        label: "Demo video",
        status: "ready",
        evidence: "A 3 minute 30 second narrated pitch video is available at outputs/AstraSafe_Demo_Video.mp4."
      },
      {
        id: "public_deployment",
        label: "Public deployment",
        status: "ready",
        evidence: "The verified Render service is live at https://astrasafe-ai.onrender.com."
      }
    ]
  };
}
