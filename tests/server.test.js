import assert from "node:assert/strict";
import { test } from "node:test";
import { createAstraSafeHandler } from "../server.js";

const handler = createAstraSafeHandler();

async function request(url, { method = "GET" } = {}) {
  const response = {
    status: null,
    headers: {},
    body: "",
    writeHead(status, headers) {
      this.status = status;
      this.headers = Object.fromEntries(
        Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
      );
    },
    end(body) {
      this.body = body ? body.toString() : "";
    }
  };

  await handler({ method, url }, response);
  return response;
}

test("health endpoint exposes production-safe headers", async () => {
  const response = await request("/api/health");
  const body = JSON.parse(response.body);

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(response.headers["x-content-type-options"], "nosniff");
  assert.match(response.headers["content-security-policy"], /default-src 'self'/);
});

test("risk endpoint clamps invalid scenario steps", async () => {
  const response = await request("/api/risk/current?step=999");
  const body = JSON.parse(response.body);

  assert.equal(response.status, 200);
  assert.equal(body.cursor.eventIndex, 6);
  assert.equal(body.risk.score, 86);
});

test("server rejects unsupported methods and unknown API routes", async () => {
  const postResponse = await request("/api/health", { method: "POST" });
  const missingResponse = await request("/api/not-real");

  assert.equal(postResponse.status, 405);
  assert.equal(missingResponse.status, 404);
});

test("static app supports GET and HEAD without exposing missing assets", async () => {
  const pageResponse = await request("/");
  const headResponse = await request("/src/app.js", { method: "HEAD" });
  const missingResponse = await request("/private.txt");

  assert.equal(pageResponse.status, 200);
  assert.match(pageResponse.body, /AstraSafe AI/);
  assert.equal(headResponse.status, 200);
  assert.equal(headResponse.body, "");
  assert.equal(missingResponse.status, 404);
});
