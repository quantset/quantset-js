import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

test("stdio launcher negotiates MCP and forwards tools, credentials and errors", { timeout: 10000 }, async (t) => {
  const requests = [];
  const version = "2025-06-18";
  const server = createServer(async (req, res) => {
    if (req.method !== "POST") {
      res.writeHead(405).end();
      return;
    }
    let body = "";
    for await (const chunk of req) body += chunk;
    const rpc = JSON.parse(body);
    requests.push({ rpc, headers: req.headers });
    if (!("id" in rpc)) {
      res.writeHead(202).end();
      return;
    }
    if (rpc.method === "tools/call" && rpc.params?.name === "get_capabilities") {
      res.writeHead(403).end();
      return;
    }
    const ambiguity = { code: "ambiguous_instrument", field: "ticker", detail: "Choose a listing", candidates: ["us:BTC", "crypto:BTCUSDT"] };
    const results = {
      initialize: { protocolVersion: version, serverInfo: { name: "test", version: "1" }, capabilities: { tools: {} } },
      "tools/list": { tools: [{ name: "get_capabilities", inputSchema: { type: "object" } }] },
      "tools/call": {
        content: [{ type: "text", text: JSON.stringify(ambiguity) }], isError: true, structuredContent: ambiguity,
        _meta: { operationId: "get_price_history", status: 422 }
      }
    };
    const result = results[rpc.method];
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ jsonrpc: "2.0", id: rpc.id, result }));
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => server.close());
  const client = new Client({ name: "consumer", version: "1" });
  const cli = fileURLToPath(new URL("../mcp/cli.js", import.meta.url));
  const url = "http://127.0.0.1:" + server.address().port + "/mcp";
  t.after(() => client.close());
  await client.connect(new StdioClientTransport({
    command: process.execPath, args: [cli], env: { QUANTSET_API_KEY: "demo-test", QUANTSET_MCP_URL: url }
  }));
  assert.equal((await client.listTools()).tools[0].name, "get_capabilities");
  await assert.rejects(client.callTool({ name: "get_capabilities", arguments: {} }), error =>
    error.message.includes("403") && error.data?.status === 403);
  const ambiguity = await client.callTool({ name: "get_price_history", arguments: { ticker: "BTC" } });
  assert.equal(ambiguity.isError, true);
  assert.equal(ambiguity.structuredContent.code, "ambiguous_instrument");
  assert.deepEqual(ambiguity.structuredContent.candidates, ["us:BTC", "crypto:BTCUSDT"]);
  assert.ok(requests.every(r => r.headers.authorization === "Bearer demo-test"));
  const released = JSON.parse(readFileSync(new URL("../mcp/package.json", import.meta.url), "utf8")).version;
  assert.ok(requests.every(r => r.headers["user-agent"] === `quantset-mcp/${released} node/${process.versions.node} host/consumer`));
  assert.equal(requests.find(r => r.rpc.method === "tools/list").headers["mcp-protocol-version"], version);
});
