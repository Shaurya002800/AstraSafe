export const adapterContracts = [
  {
    id: "sensor_scada",
    label: "SCADA / gas sensors",
    status: "simulated",
    cadence: "5 seconds",
    requiredFields: ["sensor_id", "zone_id", "value", "threshold", "trend", "reliability"],
    sampleSource: "sensor.G7",
    mapsTo: "sensor_anomaly_score"
  },
  {
    id: "permit_to_work",
    label: "Permit-to-work",
    status: "simulated",
    cadence: "on status change",
    requiredFields: ["permit_id", "type", "zone", "start", "expiry", "supervisor", "risk_class"],
    sampleSource: "permit.HW204",
    mapsTo: "permit_conflict_score"
  },
  {
    id: "cctv_context",
    label: "CCTV metadata",
    status: "mocked_labels",
    cadence: "5-10 seconds",
    requiredFields: ["camera_id", "zone_id", "worker_count", "ppe_state", "confidence"],
    sampleSource: "camera.CAM_C",
    mapsTo: "worker_exposure_score"
  },
  {
    id: "maintenance_cmms",
    label: "Maintenance / CMMS",
    status: "simulated",
    cadence: "on work-order update",
    requiredFields: ["equipment_id", "status", "task", "delay_minutes", "criticality"],
    sampleSource: "maintenance.VF2",
    mapsTo: "equipment_degradation_score"
  },
  {
    id: "shift_roster",
    label: "Shift and supervisor roster",
    status: "simulated",
    cadence: "shift event",
    requiredFields: ["shift_id", "handover_start", "staffing_level", "supervisor"],
    sampleSource: "shift.S3",
    mapsTo: "shift_vulnerability_score"
  },
  {
    id: "incident_memory",
    label: "Incident reports and SOPs",
    status: "synthetic_corpus",
    cadence: "indexed offline",
    requiredFields: ["source_id", "summary", "entities", "corrective_action", "confidence"],
    sampleSource: "incident.NM17 / sop.HOTWORK.07",
    mapsTo: "historical_similarity_score"
  }
];

export function buildAdapterReadiness(snapshot) {
  const activeSources = new Set(snapshot.risk.evidence.map((item) => item.source));
  const adapters = adapterContracts.map((adapter) => ({
    ...adapter,
    activeInScenario:
      activeSources.has(adapter.sampleSource) ||
      adapter.sampleSource
        .split(" / ")
        .some((source) => activeSources.has(source) || snapshot.report.includes(source)),
    payloadExample: buildPayloadExample(adapter.id)
  }));

  return {
    mode: "synthetic_adapter_contracts",
    readiness:
      "AstraSafe currently uses deterministic synthetic events, with adapter contracts ready for real plant connectors.",
    adapters,
    productionPath: [
      "Replace synthetic scenario events with SCADA/MQTT or historian connector output.",
      "Map permit-to-work status changes into the normalized event schema.",
      "Send CCTV metadata only, not face imagery, for privacy-preserving exposure scoring.",
      "Index incident reports and SOPs into a source-linked retrieval layer.",
      "Keep deterministic risk scoring as the gate before any narrative generation."
    ]
  };
}

function buildPayloadExample(id) {
  const examples = {
    sensor_scada: {
      event_type: "sensor_trend_change",
      sensor_id: "gas_G7",
      zone_id: "zone_C",
      value: 54,
      threshold: 100,
      trend: "rising_fast"
    },
    permit_to_work: {
      event_type: "permit_activated",
      permit_id: "hot_work_HW204",
      type: "hot_work",
      zone: "zone_C",
      supervisor: "S3"
    },
    cctv_context: {
      event_type: "cctv_detection",
      camera_id: "CAM_C",
      zone_id: "zone_C",
      worker_count: 3,
      confidence: 0.84
    },
    maintenance_cmms: {
      event_type: "maintenance_delay",
      equipment_id: "ventilation_fan_VF2",
      delay_minutes: 45,
      criticality: "high"
    },
    shift_roster: {
      event_type: "shift_handover_started",
      supervisor: "S3",
      staffing_level: "reduced_attention"
    },
    incident_memory: {
      source_id: "incident.NM17",
      similarity: 0.93,
      corrective_action: "Pause hot work and restore ventilation."
    }
  };

  return examples[id];
}
