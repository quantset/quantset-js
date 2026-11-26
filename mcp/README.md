# `@quantset/mcp` — Turn Claude, Cursor & Codex Into an AI Hedge Fund & SEC Research Desk

**Stop letting your AI assistant hallucinate balance sheets from Google Search or crash on broken `yfinance` scrapers.**

**[QuantSet](https://quantset.dev)** turns **Claude Desktop**, **Claude Code**, **Cursor**, **Windsurf**, **VS Code**, **OpenClaw**, and **ChatGPT / Codex** into a live institutional equity research & quantitative analytics desk: **90,000+ global stocks across 67 countries** (64 years of survivorship-checked US history back to **1962**; S&P 500 to **1927**), **127M+ reconciled SEC EDGAR XBRL facts (`10-K`, discrete quarterly `10-Q`, `Form 13F`, `Form 4` w/ Rule 10b5-1 insider flags, segments & debt walls)**, **4,899 ETF look-through holdings (`175k+` N-PORT constituents)**, **Wall Street consensus estimates & price targets**, a **40+ factor point-in-time stock screener**, **734 crypto pairs**, **42 FX currencies**, and **live U.S. Treasury / TIPS / FRED macroeconomic curves**.

- **Works in 10 seconds with zero signup** via the built-in `mw_demo` sandbox key (or run `npx quantset init` to connect your entire computer and AI tools in one command).
- **Add the 7 Buyside Workflow Skills (`npx skills add quantset/skills`):** Run Goldman-grade 5-year DCFs & Reverse-DCFs (`dcf-valuation`), 7-peer Trading Comps Football Fields (`comps-analysis`), printable 1-page HTML Buyside Memos (`investment-memo`), 7-point Short-Seller Forensic Audits (`forensic-red-flags`), Earnings Playbooks (`earnings-playbook`), and 4,899-ETF Portfolio Overlap X-Rays (`portfolio-xray`).
- **Institutional data hygiene:** True discrete quarterly cash flows (`period_basis: "discrete_quarter"`, never YTD 10-Q traps), 3-way split/dividend cross-checked `adj_close`, SEC accession & filing-date citations (`available_at`), explicit quote currencies (`GBp` pence vs. `GBP`), and strict `null` for unreported lines (never fake `0`s).

---

## 1. Fastest Setup — Connect All Your AI Tools in One Command

```sh
npx quantset init
npx skills add quantset/skills
```

Or paste directly into `claude_desktop_config.json` / `.cursor/mcp.json` (Node.js 20+):

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

Swap `"mw_demo"` for your key from **[quantset.dev](https://quantset.dev/pricing)** (or let your agent mint a key with **30 free full-catalog trial credits** right inside chat!) to unlock all **90,000+ global symbols** and full-universe stock screening.

## 2. Zero-Install Remote HTTP (Claude Code, VS Code, Claude.ai & ChatGPT)

```sh
claude mcp add --transport http quantset https://api.quantset.dev/mcp \
  --header "Authorization: Bearer mw_demo"
```

In **Claude.ai** or **ChatGPT** web connectors, enter `https://api.quantset.dev/mcp` and click **Connect** (supports 1-click OAuth 2.1).

---

## What Your Agent Can Do Immediately

- **Buyside DCF & Reverse-DCF:** *"Run a 5-year DCF valuation and Reverse-DCF on NVIDIA (`us:NVDA`) using live 10Y Treasury yields and SBC-adjusted Owner FCF."*
- **Trading Comps Table:** *"Build a peer trading comps table for `us:NVDA` (`EV/Revenue`, `EV/EBITDA`, `EV/FCF`, `Forward P/E`, `ROIC`, `FCF Margin`) with 25th/Median/75th percentiles."*
- **Short-Seller Forensic Audit:** *"Audit `us:AAPL` for cash-conversion divergence, SBC dilution, 24-month debt maturity walls, segment margin decay, and unscheduled Form 4 C-suite insider selling vs. Rule 10b5-1."*
- **Portfolio & 4,899-ETF Overlap X-Ray:** *"Compare `us:NVDA`, `us:AAPL`, `global:SHEL.L`, and `crypto:BTCUSDT` USD correlations, max drawdowns, and show which ETFs have the largest portfolio weight in `NVDA`."*
- **40-Factor Point-in-Time Stock Screening:** *"Screen US stocks with ROIC > 20%, EV/FCF < 25, positive YoY revenue growth, and shrinking share count over the past year."*

---

## Read-Only Institutional Tools Included

| Tool | What Your Agent Gets |
| --- | --- |
| `get_quotes` | Batch quotes across US equities, 67 international exchanges & 734 crypto pairs |
| `get_price_history` | Up to 64 years of daily OHLCV + verified split/dividend `adj_close` & market cap |
| `get_intraday_bars` | Cross-checked hourly bars & live session candles |
| `screen_stocks` / `search_screener` | 40+ factor screener & arbitrary statement/ratio DSL filters (`ROIC`, `EV/EBITDA`, `EV/FCF`, `FFO`, `SMA-200`, buybacks) |
| `get_company_snapshot` | Full valuation, quality, momentum snapshot + sector/SIC metrics |
| `get_financial_metrics` | Historical valuation, profitability, efficiency, liquidity & leverage ratios |
| `get_estimates_and_earnings` | Forward Wall Street EPS/revenue consensus, price targets, analyst ratings & earnings surprises |
| `get_etf_data` | 4,899 ETF profiles, 175k+ N-PORT holdings & reverse stock-to-ETF exposure (`etf-exposures`) |
| `get_macro_and_fx` | 1M–30Y U.S. Treasury curves, TIPS real yields, CPI/Labor/GDP packs, central bank policy rates & 42 FX currencies |
| `get_corporate_actions` | Forward/reverse splits, verified cash dividends & shareholder returns |
| `get_financial_statements` | Reconciled SEC XBRL `income`, `balance_sheet` & discrete quarterly `cash_flow` (`as_of` point-in-time supported) |
| `get_sec_filings` | Product/geo revenue segments, debt maturity walls, Form 4 insider trades (Rule 10b5-1 flags), Form 13F whales & raw XBRL facts |
| `list_instruments` / `get_peers` | Instant search & SIC/sector peer discovery across 90,000+ global listings |
| `get_capabilities` / `get_market_status` | Dataset coverage, sector taxonomies, and live exchange session status |

---

## Links

- **Live MCP & Agent Setup Guide:** [quantset.dev/docs/agents](https://quantset.dev/docs/agents)
- **7 Buyside Workflow Skills:** [github.com/quantset/skills](https://github.com/quantset/skills)
- **Full Agent Contract (`llms.txt`):** [api.quantset.dev/llms.txt](https://api.quantset.dev/llms.txt)
- **Plans & API Keys:** [quantset.dev/pricing](https://quantset.dev/pricing)
