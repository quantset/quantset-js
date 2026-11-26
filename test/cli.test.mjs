// `quantset init` against a stand-in server: approval, AI tool config, .env and the first call.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const CLI = join(dirname(fileURLToPath(import.meta.url)), "..", "client", "cli.js");
const KEY = "qsk_test-key_0123456789abcdefghijklmnopqrstuv";

function standIn({ approveAfter = 1, quoteStatus = 200 } = {}) {
  const seen = [];
  let polls = 0;
  const server = createServer((request, response) => {
    let body = "";
    request.on("data", (chunk) => (body += chunk));
    request.on("end", () => {
      const base = `http://127.0.0.1:${server.address().port}`;
      seen.push({ path: request.url, agent: request.headers["user-agent"], key: request.headers["x-api-key"], body });
      const send = (status, data) => {
        response.writeHead(status, { "Content-Type": "application/json" });
        response.end(JSON.stringify(data));
      };
      if (request.url === "/auth/device") return send(201, { device_code: "device-secret-000000000000", user_code: "BCDF-GHJK", verification_url_complete: `${base}/activate?code=BCDF-GHJK`, interval: 0, expires_in: 30 });
      if (request.url === "/auth/device/token") {
        polls += 1;
        return polls <= approveAfter
          ? send(202, { status: "pending" })
          : send(200, { status: "approved", api_key: KEY, email: "dev@example.org", plan: "sandbox", trial_credits_remaining: 100, base, mcp_url: `${base}/mcp`, console_url: `${base}/account` });
      }
      if (request.url.startsWith("/api/v1/quotes")) return send(quoteStatus, quoteStatus === 200 ? { data: [{ instrument_id: "us:NVDA", close: 188.4, date: "2026-11-24" }] } : { detail: "down" });
      send(404, {});
    });
  });
  return new Promise((ready) => server.listen(0, "127.0.0.1", () => ready({ server, seen, site: `http://127.0.0.1:${server.address().port}` })));
}

// The wizard runs whatever AI tools it finds on PATH. In a test that must be nothing: a real tool
// on the developer's machine would be run for real. Node itself is started by its full path.
const EMPTY_PATH = mkdtempSync(join(tmpdir(), "qs-path-"));

// A home and a project that belong to the test.
function sandbox() {
  const home = mkdtempSync(join(tmpdir(), "qs-home-"));
  const project = mkdtempSync(join(tmpdir(), "qs-project-"));
  mkdirSync(join(home, ".cursor"));
  writeFileSync(join(home, ".cursor", "mcp.json"), JSON.stringify({ mcpServers: { other: { url: "https://example.com/mcp" } } }));
  mkdirSync(join(project, ".git"));
  writeFileSync(join(project, "package.json"), "{}");
  writeFileSync(join(project, ".env"), "OTHER=1\nQUANTSET_API_KEY=old\n");
  return { home, project, env: { ...process.env, HOME: home, USERPROFILE: home, PATH: EMPTY_PATH, NO_COLOR: "1" } };
}

const run = (args, { env, cwd }) =>
  new Promise((done) => execFile(process.execPath, [CLI, ...args], { env, cwd, timeout: 20000 }, (error, stdout) => done({ code: error ? error.code : 0, out: stdout })));

test("init approves, configures the tools it finds, saves the key and makes a first call", async () => {
  const { server, seen, site } = await standIn();
  const box = sandbox();
  try {
    const result = await run(["init", "--yes", "--no-open", "--site", site], { env: box.env, cwd: box.project });
    assert.equal(result.code, 0, result.out);
    assert.match(result.out, /Code\s+BCDF-GHJK/);
    assert.match(result.out, /Connected as dev@example\.org/);
    assert.match(result.out, /Found Cursor\. Add QuantSet to it\?|✓ Cursor/);
    assert.match(result.out, /✓ Cursor/);
    for (const tool of ["Claude Code", "VS Code", "Gemini CLI", "Codex"]) assert.ok(!result.out.includes(`✓ ${tool}`), `${tool} must not be found in a test`);
    assert.match(result.out, /NVIDIA closed at \$188\.40 on 2026-11-24/);
    assert.match(result.out, /You have 100 free credits\. They work on every covered listing\./);
    // The key is never printed when it has somewhere to live.
    assert.ok(!result.out.includes(KEY));

    const cursor = JSON.parse(readFileSync(join(box.home, ".cursor", "mcp.json"), "utf8"));
    assert.deepEqual(cursor.mcpServers.quantset, { url: `${site}/mcp`, headers: { Authorization: `Bearer ${KEY}` } });
    assert.equal(cursor.mcpServers.other.url, "https://example.com/mcp");
    assert.equal(readFileSync(join(box.project, ".env"), "utf8"), `OTHER=1\nQUANTSET_API_KEY=${KEY}\n`);
    assert.equal(readFileSync(join(box.project, ".gitignore"), "utf8"), ".env\n");

    assert.ok(seen.every((item) => item.agent.startsWith("quantset-cli/")));
    assert.equal(seen.filter((item) => item.path === "/auth/device/token").length, 2);
    assert.equal(seen.at(-1).key, KEY);
  } finally {
    server.close();
  }
});

test("with nowhere to put the key, init shows it once", async () => {
  const { server, site } = await standIn({ approveAfter: 0, quoteStatus: 503 });
  const home = mkdtempSync(join(tmpdir(), "qs-bare-"));
  try {
    const result = await run(["init", "--yes", "--no-open", "--site", site], { env: { ...process.env, HOME: home, USERPROFILE: home, PATH: EMPTY_PATH, NO_COLOR: "1" }, cwd: home });
    assert.equal(result.code, 0, result.out);
    assert.match(result.out, /No AI tools found/);
    assert.match(result.out, /not a project/);
    assert.match(result.out, /first call did not come back \(HTTP 503\)/);
    assert.ok(result.out.includes(`Your key, shown once: ${KEY}`));
    assert.ok(!existsSync(join(home, ".env")));
  } finally {
    server.close();
  }
});

test("without a command it explains itself and changes nothing", async () => {
  const result = await run([], { env: { ...process.env, NO_COLOR: "1" }, cwd: tmpdir() });
  assert.equal(result.code, 0);
  assert.match(result.out, /npx quantset init/);
});
