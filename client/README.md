# QuantSet for TypeScript & JavaScript — Put the Global Stock Market Inside Your Agents and Code

**`90,000+` symbols** and **`52,000+` stocks across `67` countries** (US daily history back to **1962**; S&P 500 to **1927**), **`734` crypto pairs**, **`42` FX currencies**, **`36,000+` companies with standardized financial statements**, **`127M+` facts from SEC filings back to 2000**, **`4,899` ETFs you can look through (`175,000+` fund holdings mapped to tickers)**, consensus estimates, 40-factor stock screening, and U.S. Treasury/FRED macro curves—in one zero-dependency ESM client (`fetch`-native on Node 20+, Bun, Deno, Cloudflare Workers, and Vercel Edge) plus a one-command setup CLI (`npx quantset init`).

Works **immediately out of the box with zero signup** on sample US, London, Tokyo, Mumbai, ETF, index, macro, and crypto listings (`mw_demo`), and includes **250 free credits** across the full 90,000+ symbol warehouse when you run `npx quantset init` or claim a key at **[quantset.dev/signup](https://quantset.dev/signup)** (no credit card required).

**[Live API Reference](https://quantset.dev/docs/api)** · **[Quickstart](https://quantset.dev/docs/quickstart)** · **[How We Verify Data](https://quantset.dev/docs/data-quality)** · **[MCP Server (`@quantset/mcp`)](https://www.npmjs.com/package/@quantset/mcp)** · **[7 Research Skills](https://github.com/quantset/skills)**

---

## Set Up Your Computer & AI Tools in One Command

```sh
npx quantset init
```

Opens a browser tab to approve your computer, provisions a personal API key, configures the QuantSet MCP server in the AI tools it finds (**Claude Code, Cursor, VS Code, Windsurf, Gemini CLI, Codex**), writes `QUANTSET_API_KEY` to `.env`, and verifies a first call. Pair with `npx skills add quantset/skills` to add seven research skills (DCF, Trading Comps, 1-Page HTML Investment Memo, Forensic Red-Flags, Earnings Playbook, and Portfolio X-Ray).

---

## Install & Run in 15 Seconds

```sh
npm install quantset
```

```ts
import { Quantset } from "quantset";

const qs = new Quantset(); // reads QUANTSET_API_KEY or starts immediately in free sandbox

// 1. Batch quotes across New York, London, Tokyo & Crypto in one request
const quotes = await qs.quotes(["us:NVDA", "us:AAPL", "global:SHEL.L", "global:1301.T", "crypto:BTCUSDT"]);

// 2. Daily OHLCV with evidence-verified split & dividend adjustments
const prices = await qs.prices("NVDA", { limit: 30 });

// 3. Reconciled SEC XBRL discrete quarterly statements + Wall Street consensus + Treasury curve
const income = await qs.income(["NVDA"], { period: "quarterly", limit_per_instrument: 4 });
const estimates = await qs.estimates("NVDA", { metric: "eps" });
const curve = await qs.treasury_yields({ limit: 5 });
```

---

## Institutional Depth, Global Breadth

- **`90,000+` symbols across `67` countries** in one schema and one set of canonical IDs (`us:NVDA`, `global:7203.T`, `global:SHEL.L`, `crypto:BTCUSDT`, `index:SPX`).
- **`36,000+` companies with financial statements** and **`127M+` facts from SEC filings since 2000** (`10-K`, discrete `10-Q`, `Form 13F` institutional holdings, `Form 4` insider trades with Rule 10b5-1 flags, product/geographic segments, debt maturity walls, and `8-K` guidance).
- **`4,899` ETFs you can look through (`175,000+` holdings mapped to tickers):** Unpack any fund to exact weights (`etf_holdings`), or flip it around and find every fund that holds a stock (`get("etf-exposures", { ticker: "us:NVDA" })`).
- **40+ factor point-in-time screener & quant primitives:** Screen by `ROIC`, `EV/FCF`, `EV/EBITDA`, `FFO`, `SMA-200`, and net buyback share shrinkage, plus dividend-reinvested total return, peak-to-trough drawdowns, and multi-asset USD correlation matrices.
- **Macro & 42 FX currencies:** Daily 1M–30Y U.S. Treasury and TIPS yield curves, CPI/Labor/GDP packs, 10 central bank policy rates, 82 FRED series, and dated FX rates.

```ts
// One-call research context bundle: snapshot multiples, 4Y financials, top 13F holders, peers & news
const context = await qs.get("context", { ticker: "us:NVDA" });

// Multi-asset USD correlation & volatility matrix
const corr = await qs.get("analytics/correlations", {
  tickers: ["us:NVDA", "us:AAPL", "crypto:BTCUSDT"]
});

// Snapshot-pinned async pagination over the 40-factor stock screener
for await (const page of qs.paginate("screener", { min_roic: 20, max_pe_ttm: 30, limit: 100 }, 3)) {
  console.log(page.snapshot_id, page.data.length);
}
```

---

## Checked Before It Reaches Your Code

1. **Filings you can cite:** US statements reconcile to SEC XBRL filings and carry `form`, `accession`, `available_at` (public filing date), and a `citation_url` highlighting the exact line on `sec.gov`.
2. **Null means null, never zero:** Missing or unreported lines return `null`—never a silent `0` that distorts margins or valuation averages.
3. **Adjustments with evidence:** Adjusted closes pass a three-way check against raw closes, split continuity, and verified cash dividends (`status: "evidence-verified"`).
4. **True quarters and native units:** Quarterly cash flows are separated from fiscal year-to-date figures (`period_basis: "discrete_quarter"`), and every price states its currency, pence (`GBp`) included.
5. **Snapshots that hold still:** Every response is pinned to `X-Warehouse-Snapshot-Id` so multi-page reads never shift mid-loop.

---

## Built-In Methods on `Quantset`

| Dataset Group | Methods |
| --- | --- |
| **Prices, Intraday & Sessions** | `instruments`, `quotes`, `prices`, `priceHistory`, `intraday`, `snapshot`, `get("market-session", { ticker: "NVDA" })` |
| **Fundamentals, Screening & Peers** | `screener`, `fundamentals`, `get("financial-metrics", { ticker: "NVDA" })`, `get("peers", { ticker: "NVDA" })`, `get("context", { ticker: "NVDA" })` |
| **Returns, Risk & Correlations** | `get("returns", { ticker: "NVDA" })`, `get("total-return", { ticker: "NVDA" })`, `get("drawdowns", { ticker: "NVDA" })`, `get("analytics/correlations", ...)` |
| **Estimates, Consensus & Calendars** | `estimates`, `analyst_consensus`, `earnings`, `get("analyst-ratings", { ticker: "NVDA" })`, `get("calendar/earnings")` |
| **4,899 ETFs & Corporate Actions** | `etf_holdings`, `get("etf-profile", { ticker: "IVV" })`, `get("etf-exposures", { ticker: "NVDA" })`, `corporate_actions` |
| **Macro, Treasury Curves & FX** | `treasury_yields`, `macro_series`, `macro`, `fx` |
| **SEC Filings, Segments & Ownership** | `income`, `balance_sheet`, `cash_flow`, `sec_facts`, `get("segments", { ticker: "NVDA" })`, `get("debt-maturities", { ticker: "NVDA" })`, `get("insider-activity", { ticker: "NVDA" })`, `get("institutional-ownership", { ticker: "NVDA" })` |

## Links

- **Homepage & Pricing:** [https://quantset.dev](https://quantset.dev)
- **Quickstart:** [https://quantset.dev/docs/quickstart](https://quantset.dev/docs/quickstart)
- **All Endpoints:** [https://quantset.dev/docs/api](https://quantset.dev/docs/api)
- **How We Verify Data:** [https://quantset.dev/docs/data-quality](https://quantset.dev/docs/data-quality)
- **Global Markets:** [https://quantset.dev/docs/global-markets](https://quantset.dev/docs/global-markets)
- **AI Agents & MCP:** [https://quantset.dev/docs/agents](https://quantset.dev/docs/agents)
- **7 Research Skills (`quantset/skills`):** [https://github.com/quantset/skills](https://github.com/quantset/skills)
- **Full LLM Contract (`llms-full.txt`):** [https://api.quantset.dev/llms-full.txt](https://api.quantset.dev/llms-full.txt)
