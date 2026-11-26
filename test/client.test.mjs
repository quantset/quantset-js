import assert from "node:assert/strict";
import test from "node:test";
import { Quantset, QuantsetError } from "quantset";

test("price pages retain the snapshot, original filters and chronological order", async (t) => {
  const pages = [
    { data: [{ date: "2025-02-01" }, { date: "2025-02-02" }], next_cursor: "before-feb" },
    { data: [{ date: "2025-01-31" }], next_cursor: null }
  ];
  const fetch = t.mock.method(globalThis, "fetch", (url, options) => {
    assert.equal(url.pathname, "/api/v1/prices");
    assert.equal(url.hostname, "api.quantset.dev");
    assert.equal(url.searchParams.get("ticker"), "nvda");
    assert.equal(url.searchParams.get("start"), "2025-01-01");
    assert.equal(url.searchParams.get("limit"), "20000");
    assert.equal(options.headers.get("X-API-Key"), "demo-test");
    if (pages.length === 1) {
      assert.equal(url.searchParams.get("snapshot_id"), "s1");
      assert.equal(url.searchParams.get("cursor"), "before-feb");
    }
    return Response.json({ ...pages.shift(), snapshot_id: "s1" });
  });
  const result = await new Quantset("demo-test").priceHistory("nvda", { start: "2025-01-01", limit: 20_000, maxPages: 2 });
  assert.equal(fetch.mock.callCount(), 2);
  assert.deepEqual(result.data.map(row => row.date), ["2025-01-31", "2025-02-01", "2025-02-02"]);
  assert.equal(result.next_cursor, null);
});

test("income and screener use the REST contract and retain HTTP errors", async (t) => {
  const requests = [];
  t.mock.method(globalThis, "fetch", (url) => {
    requests.push(url);
    return requests.length === 1 ? Response.json({ data: [], snapshot_id: "s1", next_cursor: null }) : new Response("full key required", { status: 403 });
  });
  const qs = new Quantset();
  await qs.income(["global:SHEL.L"], { limit_per_instrument: 2, period: "quarterly" });
  assert.equal(requests[0].pathname, "/api/v1/financial-statements/income");
  assert.equal(requests[0].searchParams.get("limit_per_instrument"), "2");
  assert.equal(requests[0].searchParams.get("tickers"), "global:SHEL.L");
  await assert.rejects(qs.screener({ has_fundamentals: false }), error =>
    error instanceof QuantsetError && error.response.status === 403);
  assert.equal(requests[1].searchParams.get("has_fundamentals"), "false");
});

test("price requests read one page and a page budget retains the continuation", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", (url) => Response.json({
    data: [], snapshot_id: "s1", next_cursor: url.searchParams.get("limit") === "2" ? "older" : null
  }));
  const client = new Quantset();
  await client.prices("IBM", { start: "1962-01-01" });
  assert.equal(fetch.mock.callCount(), 1);
  assert.equal(fetch.mock.calls[0].arguments[0].searchParams.get("limit"), null);
  assert.equal((await client.prices("IBM", { limit: 2 })).next_cursor, "older");
  assert.equal((await client.priceHistory("IBM", { limit: 2, maxPages: 1 })).next_cursor, "older");
  assert.equal(fetch.mock.callCount(), 3);
});

test("authentication, raw responses, entitlement detail and retry timing", async (t) => {
  const prior = process.env.QUANTSET_API_KEY;
  t.after(() => {
    if (prior === undefined) delete process.env.QUANTSET_API_KEY;
    else process.env.QUANTSET_API_KEY = prior;
  });
  const calls = t.mock.method(globalThis, "fetch", (url) => {
    if (url.pathname.endsWith("capabilities")) return Response.json({ resources: [] });
    if (url.pathname.endsWith("profile")) return Response.json([{ symbol: "IBM" }]);
    if (url.searchParams.get("format") === "csv") return new Response("date,close\n");
    return Response.json({ code: "rate_limited", detail: "Plan allowance exhausted" }, { status: 429, headers: { "Retry-After": "12" } });
  });
  delete process.env.QUANTSET_API_KEY;
  assert.deepEqual(await new Quantset().get("capabilities"), { resources: [] });
  process.env.QUANTSET_API_KEY = "env-key";
  assert.deepEqual(await new Quantset().get("/api/v1/fmp/stable/profile", { symbol: "IBM" }), [{ symbol: "IBM" }]);
  assert.equal(await new Quantset("explicit").get("quotes", { format: "csv" }), "date,close\n");
  await assert.rejects(new Quantset().screener(), error =>
    error.code === "rate_limited" && error.detail === "Plan allowance exhausted" && error.retryAfter === "12" &&
    error.response.status === 429 && error.message.includes("Retry-After: 12"));
  for (const path of ["https://example.org/", "//other.test/path", "%2e%2e/admin"]) {
    await assert.rejects(new Quantset().get(path), /relative API path/);
  }
  assert.deepEqual(calls.mock.calls.map(call => call.arguments[1].headers.get("X-API-Key")),
                   ["mw_demo", "env-key", "explicit", "env-key"]);
});

test("pagination is lazy, preserves filters and refuses a rotated snapshot or repeated cursor", async (t) => {
  const pages = [
    { snapshot_id: "s1", next_cursor: "older" }, { snapshot_id: "s1", next_cursor: "older" },
    { snapshot_id: "s2", next_cursor: null }
  ];
  const fetch = t.mock.method(globalThis, "fetch", () => Response.json({ data: [], ...pages.shift() }));
  const client = new Quantset();
  const iterator = client.paginate("screener", { min_roic: 15 });
  assert.equal(fetch.mock.callCount(), 0);
  assert.equal((await iterator.next()).value.next_cursor, "older");
  await assert.rejects(iterator.next(), /repeated cursor/);
  const params = fetch.mock.calls[1].arguments[0].searchParams;
  assert.deepEqual(Object.fromEntries(params), { min_roic: "15", cursor: "older", snapshot_id: "s1" });
  await assert.rejects(client.paginate("screener", { snapshot_id: "s1" }).next(), /changed snapshots/);
});

test("named helpers map to the warehouse paths and parameters", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => Response.json({ data: [], snapshot_id: "s", next_cursor: null }));
  const qs = new Quantset();
  const cases = [
    ["quotes", [["aapl","global:SHEL.L"]], "quotes", { tickers: "aapl,global:SHEL.L" }],
    ["balance_sheet", [["aapl"], { limit_per_instrument: 4 }], "financial-statements/balance_sheet", { limit_per_instrument: "4" }],
    ["cash_flow", [["aapl"]], "financial-statements/cash_flow", { tickers: "aapl" }],
    ["instruments", [], "instruments"], ["intraday", ["nvda"], "intraday", { ticker: "nvda" }],
    ["snapshot", ["nvda"], "snapshots", { ticker: "nvda" }], ["fundamentals", [], "fundamentals"],
    ["analyst_consensus", ["7203.T"], "analyst-consensus", { ticker: "7203.T" }],
    ["estimates", ["nvda"], "estimates", { ticker: "nvda" }], ["earnings", ["aapl"], "earnings", { ticker: "aapl" }],
    ["corporate_actions", ["aapl"], "calendar/corporate-actions", { ticker: "aapl" }], ["etf_holdings", ["ivv"], "etf-holdings", { ticker: "ivv" }],
    ["sec_facts", [{ issuer_cik: "0001045810" }], "sec/company-facts", { issuer_cik: "0001045810" }], ["sec_facts", [{ ticker: "nvda" }], "sec/company-facts", { ticker: "nvda" }],
    ["macro", [{ series_ids: "FEDFUNDS" }], "macro/indicators", { series_ids: "FEDFUNDS" }],
    ["macro_series", [], "macro/series"], ["treasury_yields", [], "macro/treasury-yields"],
    ["fx", [{ base_currency: "EUR" }], "fx/rates", { base_currency: "EUR" }]
  ];
  for (const [name, args, path, params] of cases) {
    await qs[name](...args);
    const url = fetch.mock.calls.at(-1).arguments[0];
    assert.equal(decodeURIComponent(url.pathname), "/api/v1/" + path);
    for (const [k, v] of Object.entries(params ?? {})) assert.equal(url.searchParams.get(k), v);
  }
});


test("structured projections use a POST with JSON arrays", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => Response.json({ data: [], snapshot_id: "s", next_cursor: null }));
  const body = { tickers: ["NVDA", "AAPL"], line_items: ["revenue"] };
  await new Quantset().lineItems(body);
  const [url, init] = fetch.mock.calls[0].arguments;
  assert.equal(url.pathname, "/api/v1/financial-statements/line-items");
  assert.equal(init.method, "POST");
  assert.equal(init.headers.get("Content-Type"), "application/json");
  assert.deepEqual(JSON.parse(init.body), body);
});

test("credit ceilings use typed receipt metadata", async (t) => {
  let n = 0;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    n++;
    assert.equal(url.pathname, "/api/v1/prices");
    assert.equal(options.headers.get("X-Max-Credits"), "2");
    return Response.json({ data: [] }, { headers: { "X-Credit-Cost": "1", "X-Credits-Remaining": "99",
      "X-Rate-Card-Version": "test", "X-Request-Id": "rq_1" } });
  });
  const qs = new Quantset("demo", "https://api.quantset.dev", { maxCreditsPerRequest: 5 });
  assert.equal(qs.estimateCreditCost, undefined);
  const { data, receipt } = await qs.getWithReceipt("prices", { ticker: "NVDA", limit: 251 }, { maxCredits: 2 });
  assert.deepEqual(data, { data: [] });
  assert.deepEqual(receipt, { credit_cost: 1, credits_remaining: 99, rate_card_version: "test", request_id: "rq_1" });
});

test("a shared workflow budget stops pagination and preserves its continuation", async t => {
  const caps = [];
  t.mock.method(globalThis, "fetch", (url, options) => {
    caps.push(options.headers.get("X-Max-Credits"));
    assert.equal(options.headers.get("X-Workflow-Id"), "research");
    return Response.json({ snapshot_id:"s", data:[], next_cursor:"page" + (caps.length+1) },
      { headers:{"X-Credit-Cost": String(caps.length)} });
  });
  const client = new Quantset("demo", "https://api.quantset.dev", { workflowId:"research", maxCreditsPerRequest:10 });
  const history = await client.priceHistory("NVDA", { maxPages:5, creditBudget:3 });
  assert.deepEqual(caps, ["3","2"]);
  assert.deepEqual(history.page_receipts.map(r=>r.credit_cost), [1,2]);
  assert.equal(history.next_cursor, "page3");
  assert.equal(history.receipt, undefined);
});
