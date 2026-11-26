# QuantSet — Build AI Trading Platforms, Next.js Market Dashboards & Financial Agents in TypeScript / JS

**Ship autonomous AI financial agents, Next.js stock research terminals, portfolio trackers, and quantitative screeners—without broken `yfinance` scrapers, rate-limited free tiers, or juggling six separate APIs.**

**[QuantSet](https://quantset.dev)** delivers **90,000+ global stocks across 67 countries** (64 years of survivorship-checked US daily OHLCV back to **1962**; S&P 500 to **1927**), **127M+ reconciled SEC EDGAR XBRL facts (`10-K`, discrete quarterly `10-Q`, `Form 13F`, `Form 4` w/ Rule 10b5-1 insider flags, segments & debt walls)**, **4,899 ETF look-through holdings (`175k+` N-PORT constituents)**, **Wall Street consensus estimates & price targets**, a **40+ factor point-in-time stock screener**, **734 crypto pairs**, **42 FX currencies**, **hourly & 5-minute intraday bars**, **multi-asset USD correlation & drawdown analytics**, and **live U.S. Treasury / TIPS / FRED macroeconomic curves**—in one zero-dependency ESM client (`fetch`-native on Node 20+, Bun, Deno, Cloudflare Workers, and Vercel Edge).

Works **immediately out of the box with zero signup** on benchmark US, London, Tokyo, India, ETF, index, macro, and crypto symbols (`mw_demo`).

**[Live Playground](https://quantset.dev/docs/api)** · **[60-Second Quickstart](https://quantset.dev/docs/quickstart)** · **[1-Line FMP Migration](https://quantset.dev/docs/switch/fmp)** · **[MCP Server (`@quantset/mcp`)](https://www.npmjs.com/package/@quantset/mcp)** · **[7 Buyside Agent Skills](https://github.com/quantset/skills)**

---

## Connect Your AI Coding Tools in One Command

```sh
npx quantset init
```

Automatically provisions your personal QuantSet API key in your browser, wires the QuantSet MCP server into **Claude Code, Cursor, VS Code, Windsurf, Gemini CLI, and Codex**, writes `QUANTSET_API_KEY` to `.env`, and runs a live verification call. Pair with `npx skills add quantset/skills` to add 7 institutional buyside skills (5-Year DCF, Trading Comps, 1-Page HTML Investment Memo, Short-Seller Forensics, Earnings Playbook, and 4,899-ETF Portfolio X-Ray).

---

## Install & Run in 15 Seconds (Zero Signup Needed)

```sh
npm install quantset
```

```ts
import { Quantset } from "quantset";

const qs = new Quantset(); // reads QUANTSET_API_KEY or starts immediately in free sandbox

// 1. Batch quotes across New York, London, Tokyo & Crypto in one request
const quotes = await qs.quotes(["NVDA", "AAPL", "global:SHEL.L", "global:1301.T", "crypto:BTCUSDT"]);

// 2. Daily OHLCV bars with 3-way verified split & dividend adjustments
const prices = await qs.prices("NVDA", { limit: 30 });

// 3. Wall Street forward EPS consensus + discrete quarterly SEC 10-Q financials + Treasury yield curve
const estimates = await qs.estimates("NVDA", { metric: "eps" });
const income = await qs.income(["NVDA"], { period: "quarterly", limit_per_instrument: 4 });
const curve = await qs.treasury_yields({ limit: 5 });
```

Pass `new Quantset(process.env.QUANTSET_API_KEY)` on the server to unlock all **90,000+ global symbols**, 64-year histories, and full-universe stock screening. **[Get an API key →](https://quantset.dev/pricing)**

---

## What You Can Build With QuantSet

### 1. AI Financial Agents & Vercel AI SDK / LangGraph Tools
Give your AI copilot or autonomous trading research agent a 1-call fundamental, institutional 13F, peer, and consensus briefing on any public company:

```ts
// One-call AI Agent Context Pack: snapshot multiples, 4Y financials, top 13F hedge-fund holders, peers & news
const context = await qs.get("context", { ticker: "us:NVDA" });

// Wall Street price targets & buy/hold/sell distribution + C-suite Form 4 insider buys
const consensus = await qs.analyst_consensus("us:NVDA");
const insiders = await qs.get("sec/insider-transactions", { ticker: "us:NVDA", limit: 25 });
```

### 2. Multi-Asset Portfolio Dashboards & 4,899-ETF Overlap X-Rays
Unpack any ETF's Form N-PORT holdings—or reverse-query which ETFs have the highest weight in a stock—alongside true USD correlation matrices and max drawdowns:

```ts
// Multi-asset USD correlation & volatility matrix
const corr = await qs.get("analytics/correlations", {
  tickers: ["us:NVDA", "us:AAPL", "crypto:BTCUSDT"]
});

// Reverse ETF look-through: every ETF holding NVDA ordered by portfolio weight
const exposures = await qs.get("etf-exposures", { ticker: "us:NVDA", limit: 25 });
```

### 3. 40-Factor Institutional Stock Screeners
Filter across US and 67 global markets by `ROIC`, `EV/FCF`, `EV/EBITDA`, `Forward P/E`, `SMA-200`, dividend streaks, and net buyback share-count reduction:

```ts
for await (const page of qs.paginate("screener", { min_roic: 20, max_pe_ttm: 30, limit: 100 }, 3)) {
  console.log(page.snapshot_id, page.data.length);
}
```

---

## Everything Under One Client

| Capability | Built-in Methods on `Quantset` |
| --- | --- |
| **Global Quotes, 64Y History & Intraday** | `instruments`, `quotes`, `prices`, `priceHistory`, `intraday`, `snapshot`, `get("market-session", { ticker: "NVDA" })` |
| **40-Factor Stock Screener & Peer Comps** | `screener`, `fundamentals`, `get("peers", { ticker: "NVDA" })`, `get("context", { ticker: "NVDA" })` |
| **Portfolio Correlations, Alpha & Drawdowns** | `get("analytics/correlations", ...)`, `get("total-return", { ticker: "NVDA" })`, `get("drawdowns", { ticker: "NVDA" })` |
| **Wall Street Consensus, Targets & Calendars** | `estimates`, `analyst_consensus`, `earnings`, `get("analyst-ratings", { ticker: "NVDA" })`, `get("calendar/earnings")` |
| **4,899 ETFs, Splits, Dividends & Buybacks** | `etf_holdings`, `get("etf-exposures", { ticker: "NVDA" })`, `corporate_actions` |
| **Macro, Treasury/TIPS Curves & 42 FX Pairs** | `treasury_yields`, `macro_series`, `macro`, `fx` |
| **SEC XBRL Statements, Segments & Insiders** | `income`, `balance_sheet`, `cash_flow`, `sec_facts`, `get("segments", { ticker: "NVDA" })`, `get("debt-maturities", { ticker: "NVDA" })`, `get("insider-activity", { ticker: "NVDA" })`, `get("institutional-ownership", { ticker: "NVDA" })` |

---

## Snapshot-Pinned Pagination & Typed Errors

- `priceHistory("NVDA", { start: "2020-01-01", limit: 500, maxPages: 10 })` assembles oldest-first ascending history pinned to a single immutable `snapshot_id`.
- HTTP errors throw `QuantsetError` with `err.code`, `err.detail`, `err.field`, `err.candidates`, `err.response.status`, and `err.retryAfter`.

## Technical Guides & Links

- **Homepage & Pricing:** [https://quantset.dev](https://quantset.dev)
- **Interactive API Reference (45+ Endpoints):** [https://quantset.dev/docs/api](https://quantset.dev/docs/api)
- **SEC EDGAR & XBRL Financial Statements API:** [https://quantset.dev/docs/guides/sec-edgar-xbrl-api](https://quantset.dev/docs/guides/sec-edgar-xbrl-api)
- **Form 13F Institutional Holdings & Form 4 Insiders API:** [https://quantset.dev/docs/guides/13f-insider-float-api](https://quantset.dev/docs/guides/13f-insider-float-api)
- **Analyst Consensus Estimates & Price Targets API:** [https://quantset.dev/docs/guides/analyst-estimates-upgrades-api](https://quantset.dev/docs/guides/analyst-estimates-upgrades-api)
- **ETF Holdings (4,899 Funds) & U.S. Treasury Yield Curve API:** [https://quantset.dev/docs/guides/etf-holdings-treasury-yield-api](https://quantset.dev/docs/guides/etf-holdings-treasury-yield-api)
- **Adjusted Close, Splits & Dividends Verification:** [https://quantset.dev/docs/guides/adjusted-close-splits-api](https://quantset.dev/docs/guides/adjusted-close-splits-api)
- **Global Stock Data API (67 Countries):** [https://quantset.dev/docs/global-markets](https://quantset.dev/docs/global-markets)
- **Switch from `yfinance` / Yahoo Finance:** [https://quantset.dev/docs/switch/yfinance](https://quantset.dev/docs/switch/yfinance)
- **Switch from Financial Modeling Prep (FMP):** [https://quantset.dev/docs/switch/fmp](https://quantset.dev/docs/switch/fmp)
- **7 Buyside Skills for Claude Code & Cursor:** [https://github.com/quantset/skills](https://github.com/quantset/skills)
- **Full LLM Contract (`llms-full.txt`):** [https://api.quantset.dev/llms-full.txt](https://api.quantset.dev/llms-full.txt)
