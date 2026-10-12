"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const CONFIG = fs.readFileSync(path.join(__dirname, "..", "config.js"), "utf8");
const API = "https://autonoma-del-peru.app.n8n.cloud/webhook/auditor-ua-api";

function setup(responseFactory) {
  const calls = [];
  const window = {
    location: { href: "https://example.github.io/revisa/" },
    fetch: async (resource, options) => {
      calls.push({ resource, options });
      return responseFactory
        ? responseFactory(resource)
        : new Response('{"ok":true}', {
            status: 200,
            headers: { "content-type": "application/json" }
          });
    }
  };
  vm.runInNewContext(CONFIG, {
    window, URL, Request,
    console: { log() {} }
  });
  return { calls, fetch: window.fetch, config: window.AUDITOR_UA_CONFIG };
}

test("routes individual, batch, report and paraphrase without prefix collisions", async () => {
  const { calls, fetch } = setup();
  for (const endpoint of ["audit", "audit-batch", "report", "paraphrase"]) {
    await fetch("http://localhost:5000/api/" + endpoint, { method: "POST" });
  }
  assert.deepEqual(
    calls.map(call => call.resource),
    ["audit", "audit-batch", "report", "paraphrase"].map(s => API + "/" + s)
  );
});

test("preserves query strings and allows URL objects", async () => {
  const { calls, fetch } = setup();
  await fetch(new URL("https://example.org/api/audit-batch?case=42"));
  assert.equal(calls[0].resource, API + "/audit-batch?case=42");
});

test("preserves multipart body and metadata when a Request is intercepted", async () => {
  const { calls, fetch } = setup();
  const original = new Request("http://localhost:5000/api/audit-batch", {
    method: "POST",
    headers: { "x-case": "ABC", "content-type": "text/plain" },
    body: "test-payload"
  });
  await fetch(original);
  assert.ok(calls[0].resource instanceof Request);
  assert.equal(calls[0].resource.url, API + "/audit-batch");
  assert.equal(calls[0].resource.method, "POST");
  assert.equal(calls[0].resource.headers.get("x-case"), "ABC");
  assert.equal(await calls[0].resource.clone().text(), "test-payload");
});

test("does not redirect unrelated requests", async () => {
  const { calls, fetch } = setup();
  await fetch("https://example.com/api/audit-log");
  assert.equal(calls[0].resource, "https://example.com/api/audit-log");
});

test("reports HTML failures without consuming valid JSON bodies", async () => {
  const { fetch } = setup(() => new Response("<html>not found</html>", {
    status: 404, headers: { "content-type": "text/html" }
  }));
  await assert.rejects(() => fetch("/api/audit"), /HTTP 404/);
  const ok = setup(() => new Response('{"ok":true}', {
    status: 200, headers: { "content-type": "application/problem+json" }
  }));
  const r = await ok.fetch("/api/audit");
  assert.deepEqual(await r.json(), { ok: true });
});
