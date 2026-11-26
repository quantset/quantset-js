# `@quantset/mcp` — Turn Claude, Cursor & Codex Into a Buyside Quant & SEC Research Desk

**Stop letting your AI assistant hallucinate financial statements from Google Search or crash on broken `yfinance` scrapers.**

**[QuantSet](https://quantset.dev)** wires **Claude Desktop**, **Claude Code**, **Cursor**, **Windsurf**, **VS Code**, **OpenClaw**, and **ChatGPT / Codex** directly into an institutional financial warehouse: **90,000+ global listings across 67 countries** (US history back to **1962**, S&P 500 back to **1927**), **127M+ reconciled SEC EDGAR XBRL facts (`10-K`, discrete quarterly `10-Q`, `Form 13F`, `Form 4` w/ Rule 10b5-1 flags)**, **4,899 ETF look-through holdings (`175k+` N-PORT constituents)**, **Wall Street consensus estimates & ratings**, a **40+ factor point-in-time stock screener**, **734 crypto pairs**, **42 ECB FX currencies**, and **live U.S. Treasury / TIPS / FRED macroeconomic curves**.

- **Works in 10 seconds with zero signup** via the built-in `mw_demo` sandbox key (or run `npx quantset init` to connect your entire computer and AI tools in one command).
- **Pair with the 7 Buyside Workflow Skills (`npx skills add quantset/skills`):** Run Goldman-grade 5-year DCFs (`dcf-valuation`), 7-peer Trading Comps (`comps-analysis`), 1-page HTML Buyside Memos (`investment-memo`), 7-point Short-Seller Forensic Audits (`forensic-red-flags`), Earnings Playbooks (`earnings-playbook`), and 4,899-ETF Portfolio Overlap X-Rays (`portfolio-xray`).
- **Engineering-grade data hygiene:** True discrete quarterly cash flows (`period_basis: "discrete_quarter"`, never YTD 10-Q traps), 3-way split/dividend cross-checked `adj_close`, SEC accession & filing-date provenance (`available_at`), explicit quote currencies (`GBp` pence vs. `GBP`), and strict `null` for unreported lines (never fake `0`s).
- **100% safe & read-only:** Every tool carries `readOnlyHint: true` and `destructiveHint: false`, with free upfront credit estimation (`estimate_credit_cost`) and per-call budget ceilings (`max_credits`).

---

## 1. Connect in 10 Seconds — Claude Desktop & Cursor (`npx`)

Paste into `claude_desktop_config.json` or `.cursor/mcp.json` (Node.js 20+):

```json
{
  "mcpServers": {
    "quantset": {
      "command": "npx",
      "args": ["-y", "@quantset/mcp"],
      "env": {
        "QUANTSET_API_KEY": "mw_demo"
      }
    }
  }
}
```

Swap `"mw_demo"` for your key from **[quantset.dev](https://quantset.dev/pricing)** to unlock all **52,000+ global symbols** and full-universe stock screening.

## 2. Zero-Install Remote HTTP (Claude Code, VS Code, Claude.ai & ChatGPT)

```sh
claude mcp add --transport http quantset https://api.quantset.dev/mcp \
  --header "Authorization: Bearer mw_demo"
```

In **Claude.ai** or **ChatGPT** web connectors, enter `https://api.quantset.dev/mcp` and click **Connect** (supports 1-click OAuth 2.1 sandbox or full key).

---

## Try Asking Immediately

- *"Compare NVDA, AAPL, and BTCUSDT 1-year total return, max drawdown, and USD correlation."*
- *"What do Wall Street analysts expect Microsoft to earn next year, and how many quarters in a row has it beaten EPS estimates?"*
- *"Which ETFs have the largest portfolio weight in NVDA right now?"*
- *"Plot the current U.S. Treasury yield curve from 1M to 30Y, check the 2s10s spread, and compare TIPS real yields."*
- *(Full key)* *"Screen US stocks for ROIC > 20%, EV/FCF < 25, positive YoY revenue growth, and shrinking share count over the past year."*

---

## 14 Purpose-Built Read-Only Tools

| Tool | What your agent gets |
| --- | --- |
| `get_quotes` | Batch quotes across US equities, 67 international exchanges & 734 crypto pairs |
| `get_price_history` | Up to 64 years of daily OHLCV + verified split/dividend adjusted close & market cap |
| `get_intraday_bars` | Cross-checked hourly bars & live session candles |
| `screen_stocks` | 40+ factor screener (`ROIC`, `EV/EBITDA`, `EV/FCF`, `FFO`, `SMA-200`, buybacks, dividend streaks) |
| `get_company_snapshot` | Full valuation, quality, momentum snapshot + sector/SIC peer table |
| `get_estimates_and_earnings` | Forward EPS/revenue consensus, price targets, ratings & 122k+ earnings calendar events |
| `get_etf_data` | 4,899 ETF profiles, 175k+ holdings & reverse stock-to-ETF exposure (`etf-exposures`) |
| `get_macro_and_fx` | 1M–30Y Treasury curves, TIPS real yields, macroeconomic indicators & 42 FX currencies |
| `get_corporate_actions` | Splits, reverse splits, dividend history & buyback streaks |
| `get_financial_statements` | Reconciled `income`, `balance_sheet` & discrete quarterly `cash_flow` |
| `get_fundamentals` | Multi-company growth, margin & capital-efficiency comparisons |
| `get_sec_filings` | Revenue segments, debt maturities, insider cluster buys (Rule 10b5-1 flags) & 13F holders |
| `list_instruments` | Instant search across 73,000+ global tickers, names, ETFs, crypto & indices |
| `get_capabilities` | Dataset coverage, fields and taxonomies |
| `get_market_status` | Current US market status |
| `get_peers` | Comparable listings for a company |
| `get_screener_filters` | Available structured screener fields and operators |

---

Pass `{"ticker":"NVDA","limit":5}` to `get_price_history` or `{"tickers":["NVDA","AAPL"]}` to
`get_quotes`. For `get_financial_statements`, use an array of tickers, name the statement kind,
and set `as_of` when you need information available by a historical date.
Tool failures include a stable `code` and may include `field` and canonical `candidates`.
Reuse `snapshot_id` and `next_cursor` with the original filters to continue a page.

## Links

- **Live MCP Playground:** [quantset.dev/docs/agents](https://quantset.dev/docs/agents)
- **Full Agent Contract (`llms.txt`):** [api.quantset.dev/llms.txt](https://api.quantset.dev/llms.txt)
- **Plans & API Keys:** [quantset.dev/pricing](https://quantset.dev/pricing)
