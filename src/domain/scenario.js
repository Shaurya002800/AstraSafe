export const plantLayout = {
  plant: "Nova Steel Demo",
  scenarioId: "accident_that_never_happened",
  traditionalThreshold: {
    gasPpm: 100
  },
  zones: [
    { id: "zone_A", label: "Zone A", role: "Loading Bay", hazardClass: "medium" },
    { id: "zone_B", label: "Zone B", role: "Utilities", hazardClass: "low" },
    { id: "zone_C", label: "Zone C", role: "Coke Oven / Hot Work", hazardClass: "high" },
    { id: "zone_D", label: "Zone D", role: "Maintenance", hazardClass: "medium" }
  ],
  graph: [
    ["Worker W12", "LOCATED_IN", "Zone C"],
    ["Worker W14", "LOCATED_IN", "Zone C"],
    ["Worker W19", "LOCATED_IN", "Zone C"],
    ["Zone C", "CONTAINS", "Gas Sensor G7"],
    ["Permit HW-204", "ACTIVE_IN", "Zone C"],
    ["Hot Work HW-204", "NEAR", "Coke Oven Battery-2"],
    ["Ventilation Fan VF-2", "PROTECTS", "Zone C"],
    ["Fan VF-2", "HAS_STATUS", "Under Maintenance"],
    ["Gas Sensor G7", "SHOWS_TREND", "Rising Fast"],
    ["NearMiss-17", "SIMILAR_TO", "Current Context"]
  ],
  incidentMemory: {
    sourceId: "incident.NM17",
    title: "NearMiss-17: hot work during degraded ventilation",
    similarity: 0.86,
    summary:
      "A previous near miss combined rising combustible gas, active hot work, delayed ventilation restoration and workers inside a coke oven service zone.",
    correctiveAction:
      "Pause hot work, clear the affected zone, restore ventilation and require supervisor verification before restart."
  }
};

export const scenarioEvents = [
  {
    t: 0,
    clock: "10:30",
    eventId: "evt_1001",
    type: "sensor_value",
    label: "Baseline gas reading normal",
    source: "sensor.G7",
    zoneId: "zone_C",
    gasPpm: 42,
    threshold: 100,
    trend: "stable",
    confidence: 0.96
  },
  {
    t: 240,
    clock: "10:34",
    eventId: "evt_1042",
    type: "sensor_trend_change",
    label: "Gas Sensor G7 rising fast below alarm threshold",
    source: "sensor.G7",
    zoneId: "zone_C",
    gasPpm: 54,
    threshold: 100,
    trend: "rising_fast",
    confidence: 0.94
  },
  {
    t: 420,
    clock: "10:37",
    eventId: "evt_1035",
    type: "maintenance_delay",
    label: "Ventilation Fan VF-2 maintenance delay",
    source: "maintenance.VF2",
    zoneId: "zone_C",
    equipmentId: "ventilation_fan_VF2",
    delayMinutes: 45,
    criticality: "high",
    confidence: 0.91
  },
  {
    t: 600,
    clock: "10:40",
    eventId: "evt_1050",
    type: "permit_activated",
    label: "Hot Work Permit HW-204 activated in Zone C",
    source: "permit.HW204",
    zoneId: "zone_C",
    permitId: "hot_work_HW204",
    permitType: "hot_work",
    supervisor: "S3",
    confidence: 0.98
  },
  {
    t: 720,
    clock: "10:42",
    eventId: "evt_1061",
    type: "cctv_detection",
    label: "Three workers detected inside Zone C",
    source: "camera.CAM_C",
    zoneId: "zone_C",
    workerCount: 3,
    workers: ["W12", "W14", "W19"],
    ppeOk: true,
    confidence: 0.84
  },
  {
    t: 840,
    clock: "10:44",
    eventId: "evt_1068",
    type: "shift_handover_started",
    label: "Shift handover started for supervisor S3",
    source: "shift.S3",
    zoneId: "zone_C",
    supervisor: "S3",
    staffingLevel: "reduced_attention",
    confidence: 0.9
  },
  {
    t: 900,
    clock: "10:45",
    eventId: "evt_1074",
    type: "astrasafe_prevention_alert",
    label: "Accident pathway predicted before traditional alarm",
    source: "risk.astrasafe",
    zoneId: "zone_C",
    predictedThresholdBreachMinutes: 21,
    confidence: 0.87
  },
  {
    t: 2160,
    clock: "11:06",
    eventId: "evt_1099",
    type: "traditional_alarm",
    label: "Traditional gas alarm would trigger now",
    source: "sensor.G7",
    zoneId: "zone_C",
    gasPpm: 100,
    threshold: 100,
    confidence: 0.96
  }
];

export function getEventsUntil(index) {
  return scenarioEvents.slice(0, Math.max(1, index + 1));
}
