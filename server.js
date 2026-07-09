import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSnapshot } from "./src/domain/snapshot.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function resolvePath(url) {
  const cleanUrl = new URL(url, `http://localhost:${port}`);
  const pathname = cleanUrl.pathname === "/" ? "/index.html" : cleanUrl.pathname;
  const requested = normalize(join(root, pathname));

  if (!requested.startsWith(root)) {
    return join(root, "index.html");
  }

  return requested;
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(body, null, 2));
}

function handleApi(req, res) {
  const url = new URL(req.url || "/", `http://${host}:${port}`);
  const step = url.searchParams.get("step") ?? 0;
  const snapshot = buildSnapshot(step);

  if (url.pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      product: "AstraSafe AI",
      modelVersion: snapshot.meta.modelVersion,
      scenarioId: snapshot.meta.scenarioId
    });
    return true;
  }

  if (url.pathname === "/api/world/current") {
    sendJson(res, 200, snapshot);
    return true;
  }

  if (url.pathname === "/api/risk/current") {
    sendJson(res, 200, {
      meta: snapshot.meta,
      cursor: snapshot.cursor,
      risk: snapshot.risk,
      metrics: snapshot.metrics,
      methodology: snapshot.methodology
    });
    return true;
  }

  if (url.pathname === "/api/futures/simulate") {
    sendJson(res, 200, {
      meta: snapshot.meta,
      futures: snapshot.futures,
      interventions: snapshot.interventions
    });
    return true;
  }

  if (url.pathname === "/api/intelligence/permit") {
    sendJson(res, 200, {
      meta: snapshot.meta,
      permit: snapshot.intelligence.permit,
      actionChecklist: snapshot.intelligence.actionChecklist
    });
    return true;
  }

  if (url.pathname === "/api/intelligence/memory") {
    sendJson(res, 200, {
      meta: snapshot.meta,
      incidentMemory: snapshot.intelligence.incidentMemory
    });
    return true;
  }

  if (url.pathname === "/api/graph/context") {
    sendJson(res, 200, {
      meta: snapshot.meta,
      graphContext: snapshot.intelligence.graphContext
    });
    return true;
  }

  if (url.pathname === "/api/reports/latest") {
    sendJson(res, 200, {
      meta: snapshot.meta,
      report: snapshot.report
    });
    return true;
  }

  if (url.pathname === "/api/evidence/bundle") {
    const bundleStep = url.searchParams.get("step") ?? 6;
    sendJson(res, 200, buildSnapshot(bundleStep).evidenceBundle);
    return true;
  }

  if (url.pathname === "/api/integrations/adapters") {
    const adapterStep = url.searchParams.get("step") ?? 6;
    sendJson(res, 200, buildSnapshot(adapterStep).adapterReadiness);
    return true;
  }

  if (url.pathname === "/api/orchestration/response") {
    const responseStep = url.searchParams.get("step") ?? 6;
    sendJson(res, 200, buildSnapshot(responseStep).responseOrchestration);
    return true;
  }

  if (url.pathname === "/api/governance/model-card") {
    const governanceStep = url.searchParams.get("step") ?? 6;
    sendJson(res, 200, buildSnapshot(governanceStep).governance);
    return true;
  }

  if (url.pathname === "/api/evaluation/summary") {
    sendJson(res, 200, snapshot.evaluation);
    return true;
  }

  if (url.pathname === "/api/evaluation/benchmark") {
    sendJson(res, 200, snapshot.benchmark);
    return true;
  }

  if (url.pathname === "/api/submission/readiness") {
    sendJson(res, 200, snapshot.submission);
    return true;
  }

  if (url.pathname === "/api/submission/pitch-pack") {
    const pitchStep = url.searchParams.get("step") ?? 6;
    sendJson(res, 200, buildSnapshot(pitchStep).pitchPack);
    return true;
  }

  if (url.pathname === "/api/submission/recording-plan") {
    const recordingStep = url.searchParams.get("step") ?? 6;
    sendJson(res, 200, buildSnapshot(recordingStep).recordingPlan);
    return true;
  }

  if (url.pathname.startsWith("/api/")) {
    sendJson(res, 404, { ok: false, error: "Unknown AstraSafe API route." });
    return true;
  }

  return false;
}

const server = createServer(async (req, res) => {
  try {
    if (handleApi(req, res)) return;

    const filePath = resolvePath(req.url || "/");
    const body = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(body);
  } catch (error) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("AstraSafe asset not found.");
  }
});

server.listen(port, host, () => {
  console.log(`AstraSafe AI running at http://${host}:${port}`);
});
