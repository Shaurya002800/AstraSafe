import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSnapshot } from "./src/domain/snapshot.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const modulePath = fileURLToPath(import.meta.url);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png"
};

const securityHeaders = {
  "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
};

function resolvePath(url, port) {
  const cleanUrl = new URL(url, `http://localhost:${port}`);
  const pathname = cleanUrl.pathname === "/" ? "/index.html" : cleanUrl.pathname;
  const requested = normalize(join(root, pathname));

  if (!requested.startsWith(root)) {
    return null;
  }

  return requested;
}

function sendJson(req, res, status, body) {
  res.writeHead(status, {
    ...securityHeaders,
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(req.method === "HEAD" ? undefined : JSON.stringify(body, null, 2));
}

function parseStep(value, fallback = 0) {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? Math.min(6, Math.max(0, parsed)) : fallback;
}

function handleApi(req, res, host, port) {
  const url = new URL(req.url || "/", `http://${host}:${port}`);
  const step = parseStep(url.searchParams.get("step"));
  const snapshot = buildSnapshot(step);

  if (url.pathname === "/api/health") {
    sendJson(req, res, 200, {
      ok: true,
      product: "AstraSafe AI",
      modelVersion: snapshot.meta.modelVersion,
      scenarioId: snapshot.meta.scenarioId,
      environment: process.env.NODE_ENV || "development"
    });
    return true;
  }

  if (url.pathname === "/api/world/current") {
    sendJson(req, res, 200, snapshot);
    return true;
  }

  if (url.pathname === "/api/risk/current") {
    sendJson(req, res, 200, {
      meta: snapshot.meta,
      cursor: snapshot.cursor,
      risk: snapshot.risk,
      metrics: snapshot.metrics,
      methodology: snapshot.methodology
    });
    return true;
  }

  if (url.pathname === "/api/futures/simulate") {
    sendJson(req, res, 200, {
      meta: snapshot.meta,
      futures: snapshot.futures,
      interventions: snapshot.interventions
    });
    return true;
  }

  if (url.pathname === "/api/intelligence/permit") {
    sendJson(req, res, 200, {
      meta: snapshot.meta,
      permit: snapshot.intelligence.permit,
      actionChecklist: snapshot.intelligence.actionChecklist
    });
    return true;
  }

  if (url.pathname === "/api/intelligence/memory") {
    sendJson(req, res, 200, {
      meta: snapshot.meta,
      incidentMemory: snapshot.intelligence.incidentMemory
    });
    return true;
  }

  if (url.pathname === "/api/graph/context") {
    sendJson(req, res, 200, {
      meta: snapshot.meta,
      graphContext: snapshot.intelligence.graphContext
    });
    return true;
  }

  if (url.pathname === "/api/reports/latest") {
    sendJson(req, res, 200, {
      meta: snapshot.meta,
      report: snapshot.report
    });
    return true;
  }

  if (url.pathname === "/api/evidence/bundle") {
    const bundleStep = parseStep(url.searchParams.get("step"), 6);
    sendJson(req, res, 200, buildSnapshot(bundleStep).evidenceBundle);
    return true;
  }

  if (url.pathname === "/api/integrations/adapters") {
    const adapterStep = parseStep(url.searchParams.get("step"), 6);
    sendJson(req, res, 200, buildSnapshot(adapterStep).adapterReadiness);
    return true;
  }

  if (url.pathname === "/api/orchestration/response") {
    const responseStep = parseStep(url.searchParams.get("step"), 6);
    sendJson(req, res, 200, buildSnapshot(responseStep).responseOrchestration);
    return true;
  }

  if (url.pathname === "/api/governance/model-card") {
    const governanceStep = parseStep(url.searchParams.get("step"), 6);
    sendJson(req, res, 200, buildSnapshot(governanceStep).governance);
    return true;
  }

  if (url.pathname === "/api/evaluation/summary") {
    sendJson(req, res, 200, snapshot.evaluation);
    return true;
  }

  if (url.pathname === "/api/evaluation/benchmark") {
    sendJson(req, res, 200, snapshot.benchmark);
    return true;
  }

  if (url.pathname === "/api/submission/readiness") {
    sendJson(req, res, 200, snapshot.submission);
    return true;
  }

  if (url.pathname === "/api/submission/pitch-pack") {
    const pitchStep = parseStep(url.searchParams.get("step"), 6);
    sendJson(req, res, 200, buildSnapshot(pitchStep).pitchPack);
    return true;
  }

  if (url.pathname === "/api/submission/recording-plan") {
    const recordingStep = parseStep(url.searchParams.get("step"), 6);
    sendJson(req, res, 200, buildSnapshot(recordingStep).recordingPlan);
    return true;
  }

  if (url.pathname.startsWith("/api/")) {
    sendJson(req, res, 404, { ok: false, error: "Unknown AstraSafe API route." });
    return true;
  }

  return false;
}

export function createAstraSafeHandler({ host = "127.0.0.1", port = 4173 } = {}) {
  return async function handleRequest(req, res) {
    try {
      if (!['GET', 'HEAD'].includes(req.method || "")) {
        sendJson(req, res, 405, { ok: false, error: "Method not allowed." });
        return;
      }

      if (handleApi(req, res, host, port)) return;

      const filePath = resolvePath(req.url || "/", port);
      if (!filePath) throw new Error("Invalid asset path.");

      const body = await readFile(filePath);
      const extension = extname(filePath);
      const cacheControl = process.env.NODE_ENV === "production" && extension !== ".html"
        ? "public, max-age=300"
        : "no-cache";
      res.writeHead(200, {
        ...securityHeaders,
        "Content-Type": mimeTypes[extension] || "application/octet-stream",
        "Cache-Control": cacheControl
      });
      res.end(req.method === "HEAD" ? undefined : body);
    } catch (error) {
      res.writeHead(404, {
        ...securityHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store"
      });
      res.end(req.method === "HEAD" ? undefined : "AstraSafe asset not found.");
    }
  };
}

export function createAstraSafeServer(options = {}) {
  return createServer(createAstraSafeHandler(options));
}

if (process.argv[1] && fileURLToPath(new URL(`file://${process.argv[1]}`)) === modulePath) {
  const port = Number(process.env.PORT || 4173);
  const host = process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
  const server = createAstraSafeServer({ host, port });

  server.listen(port, host, () => {
    console.log(`AstraSafe AI running at http://${host}:${port}`);
  });
}
