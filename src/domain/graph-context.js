import { plantLayout } from "./scenario.js";

function hasEvent(events, type) {
  return events.some((event) => event.type === type);
}

function edgeActive(edge, signals) {
  const [from, relation, to] = edge;
  if (from.startsWith("Worker")) return signals.workersPresent;
  if (from.startsWith("Permit") || from.startsWith("Hot Work")) return signals.permitActive;
  if (from.includes("Fan") || to.includes("Under Maintenance")) return signals.fanDelayed;
  if (from.includes("Gas Sensor") || to.includes("Rising Fast")) return signals.gasRising;
  if (from.includes("NearMiss")) return signals.incidentMemoryActive;
  if (relation === "CONTAINS" || relation === "PROTECTS") return true;
  return false;
}

export function buildGraphContext(events, riskResult) {
  const signals = {
    gasRising: hasEvent(events, "sensor_trend_change"),
    fanDelayed: hasEvent(events, "maintenance_delay"),
    permitActive: hasEvent(events, "permit_activated"),
    workersPresent: hasEvent(events, "cctv_detection"),
    incidentMemoryActive: riskResult.evidence.some((item) => item.source === "incident.NM17")
  };

  const relationships = plantLayout.graph.map(([from, relation, to]) => ({
    from,
    relation,
    to,
    active: edgeActive([from, relation, to], signals)
  }));

  const activeRelationships = relationships.filter((item) => item.active);
  const nodes = new Map();

  relationships.forEach((item) => {
    nodes.set(item.from, {
      id: item.from,
      kind: classifyNode(item.from),
      active: activeRelationships.some((edge) => edge.from === item.from || edge.to === item.from)
    });
    nodes.set(item.to, {
      id: item.to,
      kind: classifyNode(item.to),
      active: activeRelationships.some((edge) => edge.from === item.to || edge.to === item.to)
    });
  });

  return {
    summary:
      riskResult.score >= 76
        ? "AstraSafe connected worker exposure, hot work, rising gas, degraded ventilation and incident memory into one accident pathway."
        : "AstraSafe is monitoring relationships across workers, zones, permits, equipment and sensors.",
    activeNodeCount: [...nodes.values()].filter((node) => node.active).length,
    activeRelationshipCount: activeRelationships.length,
    nodes: [...nodes.values()],
    relationships,
    causalPaths: [
      ["Worker W12/W14/W19", "LOCATED_IN", "Zone C", "EXPOSED_TO", "Rising Gas G7"],
      ["Permit HW-204", "ACTIVE_IN", "Zone C", "CONFLICTS_WITH", "Ventilation Fan VF-2 delay"],
      ["NearMiss-17", "SIMILAR_TO", "Current Context", "SUPPORTS", "Pause hot work action"]
    ].filter((path) => {
      if (path[0].startsWith("Worker")) return signals.workersPresent;
      if (path[0].startsWith("Permit")) return signals.permitActive && signals.fanDelayed;
      if (path[0].startsWith("NearMiss")) return signals.incidentMemoryActive;
      return false;
    })
  };
}

function classifyNode(label) {
  if (label.startsWith("Worker")) return "worker";
  if (label.startsWith("Zone")) return "zone";
  if (label.includes("Sensor")) return "sensor";
  if (label.includes("Permit") || label.includes("Hot Work")) return "permit";
  if (label.includes("Fan")) return "equipment";
  if (label.includes("NearMiss")) return "memory";
  if (label.includes("Risk") || label.includes("Context")) return "risk";
  return "asset";
}
