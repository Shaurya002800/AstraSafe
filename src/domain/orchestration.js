export function buildResponseOrchestration(snapshot) {
  const intervention = snapshot.interventions[0];
  const permit = snapshot.intelligence.permit;
  const workers = snapshot.risk.currentState.workerCount;
  const critical = snapshot.risk.score >= 76;

  return {
    mode: "human_approval_required",
    incidentCommandState: critical ? "prevention_escalation" : "monitoring",
    recommendedIntervention: intervention.title,
    approvalGates: [
      {
        id: "permit_pause_approval",
        owner: "Safety Officer",
        required: critical,
        action: `Approve pause for ${permit.displayId}.`
      },
      {
        id: "zone_clearance_approval",
        owner: "Shift Supervisor",
        required: workers > 0,
        action: "Confirm Zone C worker clearance."
      },
      {
        id: "restart_authorization",
        owner: "Safety Officer + Maintenance Lead",
        required: true,
        action: "Authorize hot-work restart only after ventilation and atmosphere checks pass."
      }
    ],
    dispatchMessages: [
      {
        channel: "Safety Officer",
        priority: "critical",
        message:
          "AstraSafe detected a critical pre-incident pathway in Zone C. Pause HW-204, clear workers and verify ventilation before restart."
      },
      {
        channel: "Shift Supervisor S3",
        priority: "high",
        message:
          "Confirm W12, W14 and W19 are clear of Zone C. Handover risk is active; acknowledge clearance status."
      },
      {
        channel: "Maintenance VF-2",
        priority: "high",
        message:
          "Escalate Ventilation Fan VF-2 restoration. Hot work remains unsafe while ventilation protection is degraded."
      },
      {
        channel: "Permit Owner HW-204",
        priority: "high",
        message:
          "Permit HW-204 was valid at issue but is now unsafe due to rising gas trend and delayed ventilation."
      }
    ],
    evacuationPlan: {
      zone: "Zone C",
      route: "Route B to Gate 3 muster point",
      exposedWorkers: workers,
      routeConstraint: snapshot.risk.factors.evacuationConstraint,
      verification: "Supervisor visual confirmation plus CCTV metadata update."
    },
    evidencePreservation: [
      "Freeze event timeline at currentEventId.",
      "Attach risk factors and graph paths to prevention report.",
      "Store permit conflict, incident memory and intervention ranking output.",
      "Export evidence bundle for audit review."
    ],
    successCriteria: [
      "HW-204 paused.",
      "Workers cleared from Zone C.",
      "VF-2 restoration escalated.",
      "Gas trend verified below restart threshold.",
      "Safety officer approves restart."
    ]
  };
}
