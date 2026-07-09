import { plantLayout, scenarioEvents } from "./domain/scenario.js";
import { buildSnapshot } from "./domain/snapshot.js";
import { factorLabels } from "./domain/risk-engine.js";

const ui = {
  scenarioTime: document.querySelector("#scenario-time"),
  systemState: document.querySelector("#system-state span:last-child"),
  riskBadge: document.querySelector("#risk-badge"),
  riskState: document.querySelector("#risk-state"),
  leadTime: document.querySelector("#lead-time"),
  riskFill: document.querySelector("#risk-fill"),
  factorList: document.querySelector("#factor-list"),
  pathwayList: document.querySelector("#pathway-list"),
  eventFeed: document.querySelector("#event-feed"),
  noActionRisk: document.querySelector("#no-action-risk"),
  actionRisk: document.querySelector("#action-risk"),
  noActionBars: document.querySelector("#no-action-bars"),
  actionBars: document.querySelector("#action-bars"),
  interventionCard: document.querySelector("#intervention-card"),
  reportOutput: document.querySelector("#report-output"),
  playToggle: document.querySelector("#play-toggle"),
  copyReport: document.querySelector("#copy-report"),
  plantMap: document.querySelector("#plant-map"),
  metricLead: document.querySelector("#metric-lead"),
  metricBaseline: document.querySelector("#metric-baseline"),
  metricReduction: document.querySelector("#metric-reduction"),
  metricEvidence: document.querySelector("#metric-evidence"),
  methodOutput: document.querySelector("#method-output"),
  evaluationOutput: document.querySelector("#evaluation-output"),
  permitOutput: document.querySelector("#permit-output"),
  memoryOutput: document.querySelector("#memory-output"),
  checklistOutput: document.querySelector("#checklist-output"),
  graphOutput: document.querySelector("#graph-output"),
  benchmarkOutput: document.querySelector("#benchmark-output"),
  submissionOutput: document.querySelector("#submission-output"),
  pitchOutput: document.querySelector("#pitch-output"),
  copyBrief: document.querySelector("#copy-brief"),
  recordingOutput: document.querySelector("#recording-output"),
  copyRecording: document.querySelector("#copy-recording"),
  bundleOutput: document.querySelector("#bundle-output"),
  copyBundle: document.querySelector("#copy-bundle"),
  downloadBundle: document.querySelector("#download-bundle"),
  adapterOutput: document.querySelector("#adapter-output"),
  orchestrationOutput: document.querySelector("#orchestration-output"),
  governanceOutput: document.querySelector("#governance-output")
};

let eventIndex = 0;
let playing = false;
let timer = null;

function statusClass(score) {
  if (score >= 76) return "critical";
  if (score >= 56) return "forming";
  if (score >= 31) return "warning";
  return "normal";
}

function setBodyState(score) {
  document.body.dataset.risk = statusClass(score);
  ui.plantMap.dataset.risk = statusClass(score);
}

function renderFactors(riskResult) {
  const entries = Object.entries(riskResult.factors);
  ui.factorList.innerHTML = entries
    .map(([key, value]) => {
      const active = value > 0 ? "active" : "";
      return `
        <div class="factor-row ${active}">
          <div>
            <span>${factorLabels[key]}</span>
            <small>${Math.round(value)} / 100</small>
          </div>
          <div class="mini-meter"><i style="width: ${value}%"></i></div>
        </div>
      `;
    })
    .join("");
}

function renderPathway(riskResult) {
  const pathway = riskResult.pathway;
  ui.pathwayList.innerHTML = pathway.length
    ? pathway
        .map(
          (item) => `
            <li>
              <span>${item.title}</span>
              <p>${item.detail}</p>
              <small>${item.eventId}</small>
            </li>
          `
        )
        .join("")
    : `<li><span>Monitoring baseline</span><p>No compound accident chain has formed yet.</p><small>evt_1001</small></li>`;
}

function renderGraph(snapshot) {
  const graph = snapshot.intelligence.graphContext;
  ui.graphOutput.innerHTML = `
    <div class="graph-summary">
      <strong>${graph.activeNodeCount} active nodes</strong>
      <strong>${graph.activeRelationshipCount} active links</strong>
      <p>${graph.summary}</p>
    </div>
    <div class="graph-paths">
      ${graph.causalPaths.length
        ? graph.causalPaths
            .map(
              (path) => `
                <div>
                  ${path.map((item, index) => `<span class="${index % 2 ? "edge-label" : ""}">${item}</span>`).join("")}
                </div>
              `
            )
            .join("")
        : "<div><span>Zone C</span><span class=\"edge-label\">MONITORING</span><span>Sensor G7</span></div>"}
    </div>
    <div class="relationship-list">
      ${graph.relationships
        .filter((edge) => edge.active)
        .slice(0, 7)
        .map(
          (edge) => `
            <div>
              <span>${edge.from}</span>
              <b>${edge.relation}</b>
              <span>${edge.to}</span>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderBars(target, points) {
  target.innerHTML = points
    .map(
      (point) => `
        <span style="height: ${Math.max(10, point.risk)}%" title="${point.minute} min: ${point.risk} risk">
          <i>${point.risk}</i>
        </span>
      `
    )
    .join("");
}

function renderFutures(riskResult) {
  const futures = riskResult.futures;
  const [best] = riskResult.interventions;

  ui.noActionRisk.textContent = `${futures.noAction.at(-1).risk}/100`;
  ui.actionRisk.textContent = `${futures.intervention.at(-1).risk}/100`;
  renderBars(ui.noActionBars, futures.noAction);
  renderBars(ui.actionBars, futures.intervention);
  ui.interventionCard.innerHTML = `
    <span>Recommended Intervention</span>
    <strong>${best.title}</strong>
    <p>${best.summary}</p>
    <div class="intervention-meta">
      <b>Score ${best.score}</b>
      <b>Confidence ${best.confidence}</b>
      <b>${best.disruption} disruption</b>
    </div>
  `;

  return best;
}

function renderEvents(events) {
  ui.eventFeed.innerHTML = [...events]
    .reverse()
    .slice(0, 6)
    .map(
      (event) => `
        <li>
          <time>${event.clock}</time>
          <span>${event.label}</span>
          <small>${event.eventId} / ${event.source}</small>
        </li>
      `
    )
    .join("");
}

function renderMapState(riskResult) {
  const state = riskResult.currentState;
  ui.plantMap.classList.toggle("workers-visible", state.workerCount > 0);
  ui.plantMap.classList.toggle("permit-active", state.hotWorkActive);
  ui.plantMap.classList.toggle("fan-delayed", state.fanDelayed);
  ui.plantMap.classList.toggle("gas-rising", state.gasTrend === "rising_fast");
}

function renderReport(events, riskResult, intervention) {
  ui.reportOutput.textContent = riskResult.report;
}

function renderMetrics(snapshot) {
  ui.metricLead.textContent = snapshot.metrics.leadTimeMinutes
    ? `${snapshot.metrics.leadTimeMinutes} min`
    : "--";
  ui.metricBaseline.textContent =
    snapshot.metrics.baselineStatus === "silent" ? "Silent" : "Alerting";
  ui.metricReduction.textContent = `${snapshot.metrics.projectedRiskReduction} pts`;
  ui.metricEvidence.textContent = `${snapshot.metrics.evidenceCount}`;
}

function renderMethodology(snapshot) {
  const weights = Object.entries(snapshot.methodology.weights)
    .map(([key, value]) => `${factorLabels[key]} ${Math.round(value * 100)}%`)
    .join(" / ");

  ui.methodOutput.innerHTML = `
    <span>${snapshot.methodology.scoring.replaceAll("_", " ")}</span>
    <p>${weights}</p>
    <small>${snapshot.methodology.guardrails[0]}</small>
  `;
}

function renderEvaluation(snapshot) {
  const evaluation = snapshot.evaluation;
  ui.evaluationOutput.innerHTML = `
    <div><span>Scenario</span><strong>${evaluation.title}</strong></div>
    <div><span>Baseline alert</span><strong>${evaluation.baseline.alertClock}</strong></div>
    <div><span>AstraSafe alert</span><strong>${evaluation.astrasafe.alertClock}</strong></div>
    <div><span>Lead time gained</span><strong>${evaluation.metrics.leadTimeMinutes} min</strong></div>
    <p>${evaluation.result}</p>
  `;
}

function renderBenchmark(snapshot) {
  const benchmark = snapshot.benchmark;
  ui.benchmarkOutput.innerHTML = `
    <div class="benchmark-summary">
      <div><span>Scenarios</span><strong>${benchmark.summary.scenarioCount}</strong></div>
      <div><span>Detection rate</span><strong>${Math.round(benchmark.summary.astraSafeDetectionRate * 100)}%</strong></div>
      <div><span>Avg lead time</span><strong>${benchmark.summary.averageLeadTimeMinutes} min</strong></div>
      <div><span>Avg risk reduction</span><strong>${benchmark.summary.averageRiskReduction} pts</strong></div>
    </div>
    <div class="benchmark-table">
      ${benchmark.scenarios
        .map(
          (scenario) => `
            <div>
              <span>${scenario.title}</span>
              <b>${scenario.astraSafeAlertClock}</b>
              <b>${scenario.baselineAlertClock}</b>
              <strong>${scenario.leadTimeMinutes ?? "Detected"}${scenario.leadTimeMinutes ? " min" : ""}</strong>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderSubmission(snapshot) {
  const submission = snapshot.submission;
  ui.submissionOutput.innerHTML = `
    <div class="submission-score">
      <strong>${submission.overallReadiness}</strong>
      <span>${submission.status.replaceAll("_", " ")}</span>
      <p>${submission.finalPitch}</p>
    </div>
    <div class="criteria-list">
      ${submission.criteria
        .map(
          (criterion) => `
            <div>
              <span>${criterion.label} / ${criterion.weight}%</span>
              <strong>${criterion.readiness}%</strong>
              <p>${criterion.evidence}</p>
            </div>
          `
        )
        .join("")}
    </div>
    <div class="deliverable-list">
      ${submission.deliverables
        .map(
          (item) => `
            <div class="${item.status}">
              <b>${item.status}</b>
              <span>${item.label}</span>
              <p>${item.evidence}</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderGovernance(snapshot) {
  const governance = snapshot.governance;
  ui.governanceOutput.innerHTML = `
    <div class="governance-card">
      <span>${governance.modelName}</span>
      <strong>${governance.productionGate}</strong>
      <p>${governance.intendedUse}</p>
    </div>
    <div class="governance-grid">
      <div>
        <span>Not for</span>
        <p>${governance.notFor}</p>
      </div>
      <div>
        <span>Validation</span>
        <p>${governance.validationStatus.evidence}</p>
      </div>
      <div>
        <span>Human oversight</span>
        <p>${governance.humanOversight[0]}</p>
      </div>
      <div>
        <span>Privacy</span>
        <p>${governance.privacy[0]}</p>
      </div>
    </div>
    <div class="limitation-list">
      ${governance.limitations.map((item) => `<div>${item}</div>`).join("")}
    </div>
  `;
}

function renderPitchPack(snapshot) {
  const pitch = snapshot.pitchPack;
  ui.pitchOutput.innerHTML = `
    <div class="pitch-card">
      <span>${pitch.title}</span>
      <strong>${pitch.oneLinePitch}</strong>
      <p>${pitch.problem}</p>
    </div>
    <div class="proof-list">
      ${pitch.proofPoints.map((point) => `<div>${point}</div>`).join("")}
    </div>
    <ol class="demo-flow">
      ${pitch.demoFlow.map((step) => `<li>${step}</li>`).join("")}
    </ol>
  `;
  ui.copyBrief.dataset.brief = pitch.markdown;
}

function renderRecordingPlan(snapshot) {
  const plan = snapshot.recordingPlan;
  ui.recordingOutput.innerHTML = `
    <div class="recording-summary">
      <strong>${plan.title}</strong>
      <p>${plan.openingLine}</p>
    </div>
    <div class="scene-list">
      ${plan.scenes
        .map(
          (scene) => `
            <article>
              <time>${scene.timeRange}</time>
              <div>
                <span>${scene.screen}</span>
                <p>${scene.action}</p>
                <small>${scene.narration}</small>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;
  ui.copyRecording.dataset.plan = [
    `# ${plan.title}`,
    "",
    `Opening: ${plan.openingLine}`,
    "",
    ...plan.scenes.map(
      (scene) =>
        `## ${scene.timeRange} - ${scene.screen}\nAction: ${scene.action}\nNarration: ${scene.narration}`
    ),
    "",
    "## Checklist",
    ...plan.recordingChecklist.map((item) => `- ${item}`),
    "",
    `Closing: ${plan.closingLine}`
  ].join("\n");
}

function renderPermit(snapshot) {
  const permit = snapshot.intelligence.permit;
  ui.permitOutput.innerHTML = `
    <div class="permit-card ${permit.currentStatus.toLowerCase().replaceAll(" ", "-")}">
      <div>
        <span>${permit.displayId}</span>
        <strong>${permit.currentStatus}</strong>
      </div>
      <p>${permit.recommendation}</p>
      <small>${permit.type} / ${permit.zone} / Supervisor ${permit.supervisor} / Confidence ${permit.confidence}</small>
    </div>
    <div class="conflict-list">
      ${permit.conflicts.length
        ? permit.conflicts
            .map(
              (conflict) => `
                <div>
                  <b>${conflict.severity}</b>
                  <span>${conflict.detail}</span>
                  <small>${conflict.eventId}</small>
                </div>
              `
            )
            .join("")
        : "<div><b>clear</b><span>No permit conflict detected at this step.</span><small>permit.HW204</small></div>"}
    </div>
  `;
}

function renderMemory(snapshot) {
  const memory = snapshot.intelligence.incidentMemory;
  ui.memoryOutput.innerHTML = `
    <div class="memory-query">Query: ${memory.query}</div>
    ${memory.matches
      .map(
        (match) => `
          <article class="memory-card">
            <div>
              <span>${match.sourceId}</span>
              <strong>${Math.round(match.similarity * 100)}% match</strong>
            </div>
            <h3>${match.title}</h3>
            <p>${match.summary}</p>
            <small>${match.correctiveAction}</small>
          </article>
        `
      )
      .join("")}
  `;
}

function renderChecklist(snapshot) {
  ui.checklistOutput.innerHTML = snapshot.intelligence.actionChecklist
    .map(
      (item) => `
        <li class="${item.status}">
          <span>${item.status}</span>
          <p>${item.label}</p>
        </li>
      `
    )
    .join("");
}

function renderOrchestration(snapshot) {
  const orchestration = snapshot.responseOrchestration;
  ui.orchestrationOutput.innerHTML = `
    <div class="orchestration-summary">
      <strong>${orchestration.incidentCommandState.replaceAll("_", " ")}</strong>
      <span>${orchestration.mode.replaceAll("_", " ")}</span>
      <p>${orchestration.recommendedIntervention}</p>
    </div>
    <div class="approval-list">
      ${orchestration.approvalGates
        .map(
          (gate) => `
            <div class="${gate.required ? "required" : ""}">
              <span>${gate.owner}</span>
              <strong>${gate.required ? "Required" : "Advisory"}</strong>
              <p>${gate.action}</p>
            </div>
          `
        )
        .join("")}
    </div>
    <div class="dispatch-list">
      ${orchestration.dispatchMessages
        .map(
          (dispatch) => `
            <div>
              <span>${dispatch.channel}</span>
              <b>${dispatch.priority}</b>
              <p>${dispatch.message}</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderEvidenceBundle(snapshot) {
  const bundle = snapshot.evidenceBundle;
  ui.bundleOutput.innerHTML = `
    <div class="bundle-summary">
      <strong>${bundle.bundleId}</strong>
      <span>${bundle.manifest.riskScore}/100 ${bundle.manifest.riskState}</span>
      <p>${bundle.auditNotes[0]} ${bundle.auditNotes[2]}</p>
    </div>
    <div class="bundle-grid">
      <div><span>Evidence links</span><strong>${bundle.manifest.evidenceLinks}</strong></div>
      <div><span>Graph nodes</span><strong>${bundle.manifest.activeGraphNodes}</strong></div>
      <div><span>Graph links</span><strong>${bundle.manifest.activeGraphLinks}</strong></div>
      <div><span>Model</span><strong>${bundle.manifest.modelVersion}</strong></div>
    </div>
  `;
  ui.copyBundle.dataset.bundle = bundle.markdown;
  ui.downloadBundle.dataset.bundle = JSON.stringify(bundle, null, 2);
}

function renderAdapters(snapshot) {
  const readiness = snapshot.adapterReadiness;
  ui.adapterOutput.innerHTML = `
    <div class="adapter-summary">
      <strong>${readiness.mode.replaceAll("_", " ")}</strong>
      <p>${readiness.readiness}</p>
    </div>
    <div class="adapter-grid">
      ${readiness.adapters
        .map(
          (adapter) => `
            <div class="${adapter.activeInScenario ? "active" : ""}">
              <span>${adapter.label}</span>
              <strong>${adapter.status}</strong>
              <p>${adapter.mapsTo}</p>
              <small>${adapter.cadence} / ${adapter.requiredFields.length} fields</small>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function render() {
  const snapshot = buildSnapshot(eventIndex);
  const events = snapshot.world.activeEvents;
  const currentEvent = events.at(-1);
  const riskResult = {
    ...snapshot.risk,
    futures: snapshot.futures,
    interventions: snapshot.interventions,
    pathway: snapshot.pathway,
    report: snapshot.report
  };
  const intervention = renderFutures(riskResult);

  ui.scenarioTime.textContent = currentEvent.clock;
  ui.systemState.textContent = riskResult.state;
  ui.riskBadge.textContent = riskResult.score;
  ui.riskState.textContent = riskResult.state;
  ui.leadTime.textContent = riskResult.leadTimeMinutes
    ? `${riskResult.leadTimeMinutes} min before threshold`
    : "Baseline silent";
  ui.riskFill.style.width = `${riskResult.score}%`;

  setBodyState(riskResult.score);
  renderFactors(riskResult);
  renderPathway(riskResult);
  renderGraph(snapshot);
  renderEvents(events);
  renderMapState(riskResult);
  renderReport(events, riskResult, intervention);
  renderMetrics(snapshot);
  renderMethodology(snapshot);
  renderEvaluation(snapshot);
  renderBenchmark(snapshot);
  renderSubmission(snapshot);
  renderGovernance(snapshot);
  renderPitchPack(snapshot);
  renderRecordingPlan(snapshot);
  renderPermit(snapshot);
  renderMemory(snapshot);
  renderChecklist(snapshot);
  renderOrchestration(snapshot);
  renderEvidenceBundle(snapshot);
  renderAdapters(snapshot);
}

function step(direction) {
  eventIndex = Math.min(scenarioEvents.length - 2, Math.max(0, eventIndex + direction));
  render();
}

function togglePlay() {
  playing = !playing;
  ui.playToggle.textContent = playing ? "Pause Scenario" : "Play Scenario";

  if (playing) {
    timer = window.setInterval(() => {
      if (eventIndex >= scenarioEvents.length - 2) {
        togglePlay();
        return;
      }
      step(1);
    }, 1300);
  } else {
    window.clearInterval(timer);
  }
}

document.querySelector("#step-back").addEventListener("click", () => step(-1));
document.querySelector("#step-forward").addEventListener("click", () => step(1));
document.querySelector("#jump-critical").addEventListener("click", () => {
  eventIndex = scenarioEvents.findIndex((event) => event.type === "astrasafe_prevention_alert");
  render();
});
ui.playToggle.addEventListener("click", togglePlay);
ui.copyReport.addEventListener("click", async () => {
  await navigator.clipboard.writeText(ui.reportOutput.textContent);
  ui.copyReport.textContent = "Copied";
  window.setTimeout(() => {
    ui.copyReport.textContent = "Copy Report";
  }, 1200);
});
ui.copyBrief.addEventListener("click", async () => {
  await navigator.clipboard.writeText(ui.copyBrief.dataset.brief || "");
  ui.copyBrief.textContent = "Copied";
  window.setTimeout(() => {
    ui.copyBrief.textContent = "Copy Brief";
  }, 1200);
});
ui.copyRecording.addEventListener("click", async () => {
  await navigator.clipboard.writeText(ui.copyRecording.dataset.plan || "");
  ui.copyRecording.textContent = "Copied";
  window.setTimeout(() => {
    ui.copyRecording.textContent = "Copy Plan";
  }, 1200);
});
ui.copyBundle.addEventListener("click", async () => {
  await navigator.clipboard.writeText(ui.copyBundle.dataset.bundle || "");
  ui.copyBundle.textContent = "Copied";
  window.setTimeout(() => {
    ui.copyBundle.textContent = "Copy Bundle";
  }, 1200);
});
ui.downloadBundle.addEventListener("click", () => {
  const blob = new Blob([ui.downloadBundle.dataset.bundle || "{}"], {
    type: "application/json"
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "astrasafe-evidence-bundle.json";
  link.click();
  URL.revokeObjectURL(link.href);
});

document.querySelectorAll(".zone").forEach((zone) => {
  zone.addEventListener("click", () => {
    const found = plantLayout.zones.find((item) => item.id === zone.dataset.zone);
    if (found) {
      ui.systemState.textContent = `${found.label}: ${found.role}`;
      window.setTimeout(render, 1400);
    }
  });
});

render();
