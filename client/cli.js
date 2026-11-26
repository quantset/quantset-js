#!/usr/bin/env node
// quantset init: connect this computer and its AI tools to QuantSet with one command.
//
// It opens a page for you to approve, collects a key made for this computer, adds the QuantSet
// MCP server to the AI tools it finds, saves the key for your code, and makes a first call so you
// see a real answer before it exits. No key is typed or pasted on the way. No dependencies.

import { execFile, spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, hostname, platform } from "node:os";
import { delimiter, dirname, join } from "node:path";
import { createInterface } from "node:readline/promises";

const VERSION = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")).version;
const AGENT = `quantset-cli/${VERSION} node/${process.versions.node}`;

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name, fallback) => {
  const at = args.indexOf(name);
  return at >= 0 && args[at + 1] ? args[at + 1] : fallback;
};
const SITE = option("--site", process.env.QUANTSET_SITE || "https://quantset.dev").replace(/\/+$/, "");
const YES = flag("--yes") || flag("-y");
const colour = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (text) => (colour ? `\x1b[${code}m${text}\x1b[0m` : text);
const bold = paint("1"), dim = paint("2"), green = paint("32"), amber = paint("33"), red = paint("31");
const say = (text = "") => process.stdout.write(text + "\n");
const step = (n, text) => say(`\n${bold(`${n}. ${text}`)}`);
const ok = (text) => say(`   ${green("✓")} ${text}`);
const skip = (text) => say(`   ${dim("·")} ${dim(text)}`);
const bad = (text) => say(`   ${red("✗")} ${text}`);
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

function help() {
  say(`quantset ${VERSION}

Usage
  npx quantset init          Connect this computer and its AI tools to QuantSet

Options
  --yes, -y                  Answer yes to every question
  --no-env                   Do not write the key to a .env file
  --no-open                  Do not open the browser
  --print-key                Show the full key at the end
  --site <url>               Use another QuantSet site (default https://quantset.dev)`);
}

async function ask(question, fallback = true) {
  if (YES || !process.stdin.isTTY) return fallback;
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  const reply = (await prompt.question(`   ${question} ${dim(fallback ? "(Y/n)" : "(y/N)")} `)).trim().toLowerCase();
  prompt.close();
  return reply ? reply.startsWith("y") : fallback;
}

async function call(url, { method = "GET", body, headers = {} } = {}) {
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: { "User-Agent": AGENT, ...(body ? { "Content-Type": "application/json" } : {}), ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(`Could not reach ${new URL(url).host}. Check your connection and try again.`);
  }
  const data = await response.json().catch(() => ({}));
  return { status: response.status, data, headers: response.headers };
}

const run = (command, list) =>
  new Promise((done) => execFile(command, list, { timeout: 30000 }, (error, stdout, stderr) => done({ ok: !error, text: String(stderr || stdout || (error && error.message) || "").trim() })));

function onPath(name) {
  const names = platform() === "win32" ? [name + ".cmd", name + ".exe", name] : [name];
  return (process.env.PATH || "").split(delimiter).some((folder) => folder && names.some((file) => existsSync(join(folder, file))));
}

function openBrowser(url) {
  const [command, list] = platform() === "darwin" ? ["open", [url]] : platform() === "win32" ? ["cmd", ["/c", "start", "", url]] : ["xdg-open", [url]];
  try {
    spawn(command, list, { stdio: "ignore", detached: true }).on("error", () => {}).unref();
  } catch {
    // The address is printed, so the browser not opening is not a failure.
  }
}

// Adds one server to a JSON config file without disturbing anything else in it.
function mergeJson(file, path, value) {
  let config = {};
  if (existsSync(file)) {
    const text = readFileSync(file, "utf8").trim();
    if (text) {
      try {
        config = JSON.parse(text);
      } catch {
        return { ok: false, text: `${file} is not valid JSON, so it was left alone` };
      }
    }
  }
  let node = config;
  for (const key of path.slice(0, -1)) node = node[key] && typeof node[key] === "object" ? node[key] : (node[key] = {});
  node[path[path.length - 1]] = value;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(config, null, 2) + "\n");
  return { ok: true, text: file };
}

// One entry for each AI tool the wizard can set up. `found` says whether it is on this computer.
function clients(key, mcpUrl) {
  const home = homedir();
  const bearer = { Authorization: `Bearer ${key}` };
  return [
    {
      name: "Claude Code",
      found: () => onPath("claude"),
      add: async () => {
        await run("claude", ["mcp", "remove", "quantset", "--scope", "user"]);
        return run("claude", ["mcp", "add", "--transport", "http", "--scope", "user", "quantset", mcpUrl, "--header", `Authorization: Bearer ${key}`]);
      },
    },
    {
      name: "Cursor",
      found: () => existsSync(join(home, ".cursor")),
      add: async () => mergeJson(join(home, ".cursor", "mcp.json"), ["mcpServers", "quantset"], { url: mcpUrl, headers: bearer }),
    },
    {
      name: "VS Code",
      found: () => onPath("code"),
      add: () => run("code", ["--add-mcp", JSON.stringify({ name: "quantset", type: "http", url: mcpUrl, headers: bearer })]),
    },
    {
      name: "Windsurf",
      found: () => existsSync(join(home, ".codeium", "windsurf")),
      add: async () => mergeJson(join(home, ".codeium", "windsurf", "mcp_config.json"), ["mcpServers", "quantset"], { serverUrl: mcpUrl, headers: bearer }),
    },
    {
      name: "Gemini CLI",
      found: () => onPath("gemini"),
      add: () => run("gemini", ["mcp", "add", "--transport", "http", "--scope", "user", "quantset", mcpUrl, "--header", `Authorization: Bearer ${key}`]),
    },
    {
      name: "Codex",
      found: () => onPath("codex"),
      note: "Codex reads the key from QUANTSET_API_KEY. Add it to your shell profile, or run Codex from a folder with the .env below.",
      add: () => run("codex", ["mcp", "add", "quantset", "--url", mcpUrl, "--bearer-token-env-var", "QUANTSET_API_KEY"]),
    },
  ];
}

// Writes QUANTSET_API_KEY to .env, replacing an older value, and keeps .env out of git.
function saveEnv(folder, key) {
  const file = join(folder, ".env");
  const lines = existsSync(file) ? readFileSync(file, "utf8").split("\n") : [];
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  const at = lines.findIndex((line) => /^\s*QUANTSET_API_KEY\s*=/.test(line));
  if (at >= 0) lines[at] = `QUANTSET_API_KEY=${key}`;
  else lines.push(`QUANTSET_API_KEY=${key}`);
  writeFileSync(file, lines.join("\n") + "\n");
  let ignored = false;
  if (existsSync(join(folder, ".git"))) {
    const ignore = join(folder, ".gitignore");
    const rules = existsSync(ignore) ? readFileSync(ignore, "utf8") : "";
    if (!rules.split("\n").some((line) => [".env", ".env*", "*.env", "/.env"].includes(line.trim()))) {
      writeFileSync(ignore, rules + (rules && !rules.endsWith("\n") ? "\n" : "") + ".env\n");
      ignored = true;
    }
  }
  return ignored;
}

async function init() {
  say(bold("\nQuantSet setup"));
  say(dim("Connects this computer and its AI tools. Takes about a minute."));

  step(1, "Approve this computer in your browser");
  const started = await call(`${SITE}/auth/device`, { method: "POST", body: { host: hostname() } });
  if (started.status !== 201) throw new Error(typeof started.data.detail === "string" ? started.data.detail : `Setup could not start (HTTP ${started.status}).`);
  const { device_code: device, user_code: code, verification_url_complete: page, interval, expires_in: lifetime } = started.data;
  say(`   Code  ${bold(code)}`);
  say(`   ${page}`);
  if (!flag("--no-open")) openBrowser(page);
  say(dim("   Waiting for you to press Connect on that page"));

  let grant = null;
  const deadline = Date.now() + lifetime * 1000;
  while (Date.now() < deadline) {
    await sleep(Math.max(1, interval) * 1000);
    const poll = await call(`${SITE}/auth/device/token`, { method: "POST", body: { device_code: device } });
    if (poll.status === 200) {
      grant = poll.data;
      break;
    }
    if (poll.status !== 202) throw new Error(typeof poll.data.detail === "string" ? poll.data.detail : "Setup was not approved. Run the command again.");
  }
  if (!grant) throw new Error("Nobody pressed Connect in time. Run the command again.");
  const key = grant.api_key;
  ok(`Connected as ${grant.email}`);

  step(2, "Add QuantSet to your AI tools");
  const found = clients(key, grant.mcp_url).filter((client) => client.found());
  const added = [];
  if (!found.length) skip("No AI tools found on this computer. The console shows how to add one.");
  else if (await ask(`Found ${found.map((client) => client.name).join(", ")}. Add QuantSet to ${found.length === 1 ? "it" : "all of them"}?`)) {
    for (const client of found) {
      const result = await client.add();
      if (result.ok) {
        ok(client.name);
        added.push(client);
        if (client.note) say(dim(`     ${client.note}`));
      } else bad(`${client.name}: ${result.text.split("\n")[0] || "could not be added"}`);
    }
  } else skip("Left your AI tools as they are");

  step(3, "Save the key for your code");
  const project = [".git", "package.json", "pyproject.toml", "requirements.txt", "go.mod", "Cargo.toml"].some((name) => existsSync(join(process.cwd(), name)));
  let saved = false;
  if (flag("--no-env")) skip("Skipped, as asked");
  else if (!project) skip("This folder is not a project. Run the command inside one to save the key to its .env file.");
  else if (await ask("Save it to .env in this folder as QUANTSET_API_KEY?")) {
    const ignored = saveEnv(process.cwd(), key);
    saved = true;
    ok(".env updated" + (ignored ? ", and .env added to .gitignore" : ""));
  } else skip("Not saved");

  step(4, "Make a first call");
  const first = await call(`${grant.base}/api/v1/quotes?tickers=us:NVDA`, { headers: { "X-API-Key": key } });
  const quote = first.status === 200 && Array.isArray(first.data.data) ? first.data.data[0] : null;
  if (quote && quote.close != null) ok(`NVIDIA closed at $${Number(quote.close).toFixed(2)} on ${quote.date}`);
  else bad(`The first call did not come back (HTTP ${first.status}). Your key is fine. Try again in a minute.`);

  say("");
  say(bold("You are set up."));
  if (added.length) say(`Open a new chat in ${added[0].name} and ask: ${amber('"Using QuantSet, compare NVIDIA’s and Apple’s revenue growth over the last four fiscal years."')}`);
  if (grant.trial_credits_remaining > 0) say(`You have ${grant.trial_credits_remaining} free credits. They work on every covered listing.`);
  say(`Usage, keys and plans: ${grant.console_url}`);
  if (flag("--print-key") || (!added.length && !saved)) {
    say("");
    say(`Your key, shown once: ${bold(key)}`);
    say(dim("Keep it out of source control. You can revoke it in the console at any time."));
  }
}

const command = args.find((item, at) => !item.startsWith("-") && args[at - 1] !== "--site");
if (flag("--version") || flag("-v")) say(VERSION);
else if (command !== "init" || flag("--help") || flag("-h")) help();
else
  init().catch((failure) => {
    say("");
    bad(failure.message);
    process.exitCode = 1;
  });
