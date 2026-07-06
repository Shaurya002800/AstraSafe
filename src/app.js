import { getEventsUntil, plantLayout, scenarioEvents } from "./domain/scenario.js";
import {
  buildPathway,
  computeRisk,
  factorLabels,
  generatePreventionReport,
  rankInterventions,
  simulateFutures
} from "./domain/risk-engine.js";

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
  plantMap: document.querySelector("#plant-map")
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
  const pathway = buildPathway(riskResult);
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
  const futures = simulateFutures(riskResult);
  const [best] = rankInterventions(riskResult);

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
  ui.reportOutput.textContent = generatePreventionReport(events, riskResult, intervention);
}

function render() {
  const events = getEventsUntil(eventIndex);
  const currentEvent = events.at(-1);
  const riskResult = computeRisk(events);
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
  renderEvents(events);
  renderMapState(riskResult);
  renderReport(events, riskResult, intervention);
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
