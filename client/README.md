# QuantSet — Institutional Global Stocks, SEC XBRL, ETFs, Estimates & Macro for TypeScript / JS

**Stop stitching together broken `yfinance` scrapers, rate-limited free tiers, and six separate market APIs.**

**[QuantSet](https://quantset.dev)** delivers **90,000+ global listings across 67 countries** (US history back to **1962**, S&P 500 back to **1927**), **127M+ reconciled SEC EDGAR XBRL facts (`10-K`, discrete quarterly `10-Q`, `Form 13F`, `Form 4` w/ Rule 10b5-1 flags)**, **4,899 ETF look-through holdings (`175k+` N-PORT constituents)**, **Wall Street consensus estimates & price targets**, a **40+ factor point-in-time stock screener**, **734 crypto pairs**, **42 FX currencies**, **hourly & 5-minute intraday bars**, **multi-asset USD correlation & drawdown analytics**, and **live U.S. Treasury/TIPS/FRED macroeconomic curves**—in one zero-dependency ESM client (`fetch`-native on Node 20+, Bun, Deno, and Edge) plus a 1-command AI tool installer (`npx quantset init`).

Works **immediately out of the box with zero signup** on benchmark US, London, Tokyo, India, ETF, index, macro, and crypto symbols.

**[Live Playground](https://quantset.dev/docs/api)** · **[60-Second Quickstart](https://quantset.dev/docs/quickstart)** · **[1-Line FMP Migration](https://quantset.dev/docs/switch/fmp)** · **[MCP Server (`@quantset/mcp`)](https://www.npmjs.com/package/@quantset/mcp)**

---

## Credit estimates and receipts

```ts
import { Quantset } from "quantset";
const qs = new Quantset(process.env.QUANTSET_API_KEY, "https://api.quantset.dev",
  { maxCreditsPerRequest: 10, workflowId: "daily-research" });
const params = { ticker: "NVDA", limit: 251 };
const quote = await qs.estimateCreditCost("GET", "/prices", { params });
const { receipt } = await qs.getWithReceipt("prices", params, { maxCredits: quote.maximum_credits });
console.log(receipt.credit_cost, receipt.credits_remaining);
const history = await qs.priceHistory("NVDA", { limit: 250, maxPages: 5, creditBudget: 5 });
```

`rateCard()` and `estimateCreditCost()` are free. A server-enforced ceiling limits each data call. A paginated read sends the remaining budget with every request and retains its continuation when a page or credit limit ends the read. Combined histories expose `page_receipts` and HTTP errors expose `receipt`.


## Set up in one command

```sh
npx quantset init
```

It opens a page for you to approve, then collects a key made for this computer. It adds the QuantSet
MCP server to the AI tools it finds (Claude Code, Cursor, VS Code, Windsurf, Gemini CLI, Codex), saves
the key to `.env` as `QUANTSET_API_KEY` when you run it inside a project, and makes a first call so you
see a real answer before it exits. You never type or paste a key. Pass `--yes` to skip the questions,
`--no-env` to leave `.env` alone, and `--print-key` to show the key at the end.

## Install & Run in 15 Seconds

```sh
npm install quantset
```

```ts
import { Quantset } from "quantset";

const qs = new Quantset(); // reads QUANTSET_API_KEY or starts immediately in free sandbox

// Batch quotes across US equities, London, Tokyo & crypto in 1 request
const quotes = await qs.quotes(["NVDA", "AAPL", "global:SHEL.L", "global:1301.T", "crypto:BTCUSDT"]);

// Five daily bars in one price request
const prices = await qs.prices("NVDA", { limit: 5 });

// Wall Street forward consensus + quarterly financials + Treasury yield curve
const estimates = await qs.estimates("NVDA", { metric: "eps" });
const curve = await qs.treasury_yields({ limit: 5 });
```

Pass `new Quantset(process.env.QUANTSET_API_KEY)` in server-side code to unlock all **52,000+ symbols**, market-wide stock screening, using a prepaid credit pack or monthly credit pool. **[Get an API key →](https://quantset.dev/pricing)**

---

## What You Can Build With One Key

| Capability | Built-in methods on `Quantset` |
| --- | --- |
| **Global Quotes, History & Intraday** | `instruments`, `quotes`, `prices`, `intraday`, `snapshot`, `get("market-session", { ticker: "NVDA" })` |
| **40-Factor Stock Screener & Peers** | `screener`, `fundamentals`, `get("peers", { ticker: "NVDA" })` |
| **Portfolio Correlations, Alpha & Drawdowns** | `get("analytics/correlations", ...)`, `get("total-return", { ticker: "NVDA" })`, `get("drawdowns", { ticker: "NVDA" })` |
| **Wall Street Estimates & Earnings Calendars** | `estimates`, `earnings`, `get("analyst-ratings", { ticker: "NVDA" })`, `get("calendar/earnings")` |
| **ETF Constituents & Reverse Exposure** | `etf_holdings`, `get("etf-exposures", { ticker: "NVDA" })`, `corporate_actions` |
| **Macro, Treasury/TIPS Curves & 42 FX Pairs** | `treasury_yields`, `macro_series`, `macro`, `fx` |
| **Reconciled Financials, Segments & Insiders** | `income`, `balance_sheet`, `cash_flow`, `sec_facts`, `get("segments", { ticker: "NVDA" })`, `get("insider-activity", { ticker: "NVDA" })` |

```ts
// Multi-asset USD correlation & volatility matrix
const corr = await qs.get("analytics/correlations", {
  tickers: ["NVDA", "AAPL", "crypto:BTCUSDT"]
});

// Snapshot-pinned async pagination over the 40-factor stock screener (full key)
for await (const page of qs.paginate("screener", { min_roic: 20, max_pe_ttm: 30, limit: 100 }, 3)) {
  console.log(page.snapshot_id, page.data.length);
}
```

## Pagination and errors

`prices()` reads one page. To assemble ascending history within a request budget, call
`priceHistory("NVDA", { start: "2024-01-01", limit: 500, maxPages: 4 })`.
If the budget ends before the data, the result retains `next_cursor` and `snapshot_id`.

HTTP errors throw `QuantsetError` with `err.code`, `err.detail`, `err.field`, `err.candidates`,
`err.response.status` and `err.retryAfter`. For `snapshot_changed`, discard the partial result and restart at page one.
