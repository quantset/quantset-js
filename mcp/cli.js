#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Every request names this package and its version, and once the app has introduced itself, the app it runs in.
const VERSION = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")).version;
const AGENT = `quantset-mcp/${VERSION} node/${process.versions.node}`;
const headers = { Authorization: "Bearer " + (process.env.QUANTSET_API_KEY || "mw_demo"), "User-Agent": AGENT };

const local = new StdioServerTransport();
const remote = new StreamableHTTPClientTransport(new URL(process.env.QUANTSET_MCP_URL || "https://api.quantset.dev/mcp"), {
  requestInit: { headers }
});

let initializeId;
remote.onmessage = (message) => {
  if ("result" in message && message.id === initializeId && message.result.protocolVersion) {
    remote.setProtocolVersion(message.result.protocolVersion);
    initializeId = undefined;
  }
  local.send(message).catch(() => process.exit(1));
};

local.onmessage = (message) => {
  if (message.method === "initialize") {
    initializeId = message.id;
    const host = String(message.params?.clientInfo?.name ?? "").toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(0, 40);
    if (host) headers["User-Agent"] = `${AGENT} host/${host}`;
  }
  remote.send(message).catch((error) => {
    const status = Number.isInteger(error.code) && error.code >= 400 && error.code <= 599 ? error.code : undefined;
    const description = status === undefined ? "Quantset MCP request failed" : "Quantset MCP request failed (HTTP " + status + ")";
    if ("method" in message && "id" in message) {
      local.send({
        jsonrpc: "2.0", id: message.id,
        error: { code: -32000, message: description, data: status === undefined ? undefined : { status } }
      })
        .catch(() => process.exit(1));
    } else {
      console.error(description);
    }
  });
};

local.onerror = () => console.error("Invalid MCP stdio message");
async function close() {
  await remote.close();
  await local.close();
}
process.stdin.once("end", close);
process.once("SIGTERM", close);
process.once("SIGINT", close);
await remote.start();
await local.start();
