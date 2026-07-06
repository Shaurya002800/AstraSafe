import { plantLayout } from "./scenario.js";

function activeEvent(events, type) {
  return events.some((event) => event.type === type);
}

function latestEvent(events, type) {
  return [...events].reverse().find((event) => event.type === type);
}

export function evaluatePermitIntelligence(events, riskResult) {
  const permitEvent = latestEvent(events, "permit_activated");
  const gasTrendActive = activeEvent(events, "sensor_trend_change");
  const fanDelayActive = activeEvent(events, "maintenance_delay");
  const workersPresent = activeEvent(events, "cctv_detection");
  const shiftHandover = activeEvent(events, "shift_handover_started");

  const conflicts = [
    gasTrendActive && {
      id: "permit_conflict_gas_trend",
      severity: "high",
      eventId: "evt_1042",
      detail: "Combustible gas trend is rising in the permitted work zone."
    },
    fanDelayActive && {
      id: "permit_conflict_ventilation",
      severity: "high",
      eventId: "evt_1035",
      detail: "Ventilation protection layer is degraded while hot work is active."
    },
    workersPresent && {
      id: "permit_conflict_exposure",
      severity: "medium",
      eventId: "evt_1061",
      detail: "Workers are inside the affected zone during an unsafe context shift."
    },
    shiftHandover && {
      id: "permit_conflict_handover",
      severity: "medium",
      eventId: "evt_1068",
      detail: "Supervisor handover increases coordination risk for active hot work."
    }
  ].filter(Boolean);

  const status = !permitEvent
    ? "No active permit"
    : riskResult.score >= 76
      ? "Unsafe after issue"
      : conflicts.length
        ? "Requires review"
        : "Valid";

  return {
    permitId: permitEvent?.permitId ?? "hot_work_HW204",
    displayId: "HW-204",
    type: "Hot work",
    zone: "Zone C",
    supervisor: permitEvent?.supervisor ?? "S3",
    issuedState: "Valid at issue",
    currentStatus: status,
    recommendation:
      status === "Unsafe after issue"
        ? "Pause permit and require safety officer re-authorization after ventilation is restored."
        : status === "Requires review"
          ? "Hold next work step until supervisor reviews the changed context."
          : "Continue monitoring.",
    conflicts,
    confidence: permitEvent ? 0.91 : 0.72
  };
}

export function retrieveIncidentMemory(events, riskResult) {
  const memory = plantLayout.incidentMemory;
  const hasCorePattern =
    activeEvent(events, "sensor_trend_change") &&
    activeEvent(events, "maintenance_delay") &&
    activeEvent(events, "permit_activated");

  const workerSignal = activeEvent(events, "cctv_detection") ? 0.04 : 0;
  const shiftSignal = activeEvent(events, "shift_handover_started") ? 0.03 : 0;
  const score = hasCorePattern ? Math.min(0.95, memory.similarity + workerSignal + shiftSignal) : 0.28;

  return {
    query: "rising gas + hot work + degraded ventilation + worker exposure",
    matches: [
      {
        sourceId: memory.sourceId,
        title: memory.title,
        similarity: Number(score.toFixed(2)),
        summary: memory.summary,
        correctiveAction: memory.correctiveAction,
        evidence: ["evt_1042", "evt_1035", "evt_1050", "evt_1061"].filter((eventId) =>
          riskResult.evidence.some((item) => item.eventId === eventId)
        )
      },
      {
        sourceId: "sop.HOTWORK.07",
        title: "SOP HOTWORK-07: suspend hot work under ventilation impairment",
        similarity: hasCorePattern ? 0.79 : 0.34,
        summary:
          "Hot work must be paused when gas readings trend upward and engineered ventilation controls are unavailable or delayed.",
        correctiveAction:
          "Suspend ignition source, verify atmosphere, restore ventilation and record supervisor approval before restart.",
        evidence: ["evt_1035", "evt_1050"].filter((eventId) =>
          riskResult.evidence.some((item) => item.eventId === eventId)
        )
      }
    ]
  };
}

export function buildActionChecklist(riskResult, permitIntelligence) {
  if (riskResult.score < 56) {
    return [
      { id: "watch_zone", status: "active", label: "Continue enhanced monitoring for Zone C." },
      { id: "verify_sensor", status: "pending", label: "Verify Gas Sensor G7 trend if slope increases." }
    ];
  }

  return [
    {
      id: "pause_permit",
      status: riskResult.score >= 76 ? "required" : "recommended",
      label: `Pause ${permitIntelligence.displayId} until supervisor re-authorization.`
    },
    {
      id: "clear_zone",
      status: riskResult.currentState.workerCount > 0 ? "required" : "pending",
      label: "Clear workers W12, W14 and W19 from Zone C."
    },
    {
      id: "restore_ventilation",
      status: riskResult.currentState.fanDelayed ? "required" : "pending",
      label: "Dispatch maintenance escalation for Ventilation Fan VF-2."
    },
    {
      id: "verify_atmosphere",
      status: "recommended",
      label: "Run gas verification before work restart."
    },
    {
      id: "preserve_evidence",
      status: "active",
      label: "Preserve event evidence and prevention report for audit."
    }
  ];
}
