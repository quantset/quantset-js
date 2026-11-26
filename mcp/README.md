# `@quantset/mcp` — Put the Global Stock Market Inside Claude, Cursor & Codex

Financial statements for **36,000+ companies**, **127M+ facts from SEC filings back to 2000**, **4,899 ETFs you can look through (`175,000+` fund holdings mapped to tickers)**, consensus estimates, 40-factor stock screening, 734 crypto pairs, 42 FX currencies, U.S. Treasury/FRED macro curves, and prices across **67 countries**—in one MCP server for **Claude, Claude Code, Cursor, ChatGPT, Codex, Windsurf, VS Code, Hermes, and OpenClaw**.

An agent is only as good as the numbers it reads. Give yours every market, every filing, and every fund—checked before it ships.

---

## 1. Fastest Setup — One Command

```sh
npx quantset init
npx skills add quantset/skills
```

- **`npx quantset init`** approves your computer in the browser, configures the QuantSet MCP server in the AI tools it finds, saves `QUANTSET_API_KEY` to `.env`, and verifies a first call.
- **`npx skills add quantset/skills`** installs the 7 research skills (`dcf-valuation`, `comps-analysis`, `investment-memo`, `earnings-playbook`, `forensic-red-flags`, `portfolio-xray`, `quantset`).

## 2. Remote Streamable HTTP or Local Stdio (`npx`)

```sh
claude mcp add --transport http quantset https://api.quantset.dev/mcp \
  --header "Authorization: Bearer mw_demo"
```

Or in `claude_desktop_config.json` / `.cursor/mcp.json`:

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

In **Claude.ai** or **ChatGPT** web connectors, add `https://api.quantset.dev/mcp` and connect via 1-click OAuth 2.1.

---

## Checked Before It Reaches Your Agent

1. **Filings you can cite:** US statements reconcile to SEC XBRL filings and carry `form`, `accession`, `available_at` (public filing date), and a `citation_url` highlighting the exact sentence on `sec.gov`.
2. **Null means null, never zero:** When a company does not report a line, you get `null`—never a silent `0` that bends a margin or an average.
3. **Adjustments with evidence:** Adjusted closes pass a three-way check against raw closes, split continuity, and verified cash dividends (`status: "evidence-verified"`).
4. **True quarters and native units:** Quarterly cash flows are separated from fiscal year-to-date figures (`period_basis: "discrete_quarter"`), and every price states its currency, pence (`GBp`) included.
5. **Snapshots that hold still:** Every response is pinned to `X-Warehouse-Snapshot-Id` so multi-page reads never shift mid-conversation.

---

## Read-Only Tools Included

| Tool | What Your Agent Reads |
| --- | --- |
| `get_quotes` | Latest quotes across US equities, 67 international markets & 734 crypto pairs |
| `get_price_history` | Up to 64 years of daily OHLCV + evidence-verified `adj_close` & market cap |
| `get_intraday_bars` | Hourly 60-minute US bars cross-checked against daily closes |
| `screen_stocks` / `search_screener` | 40+ factor screener & statement/ratio DSL filters (`ROIC`, `EV/EBITDA`, `EV/FCF`, `FFO`, `SMA-200`, buybacks) |
| `get_company_snapshot` | Current valuation, profitability, growth, and technical metrics |
| `get_financial_metrics` | Historical valuation, profitability, efficiency, liquidity & leverage ratios |
| `get_financial_statements` | Reconciled `income`, `balance_sheet` & discrete quarterly `cash_flow` (`as_of` point-in-time supported) |
| `get_fundamentals` | Standardized multi-company revenue, EPS, and reported growth |
| `get_estimates_and_earnings` | Forward consensus EPS/revenue, analyst ratings, earnings surprises & earnings calendar |
| `get_sec_filings` | Revenue segments, debt maturities, Form 4 insider trades (Rule 10b5-1 flags), Form 13F institutional holdings & raw XBRL facts |
| `get_etf_data` | 4,899 ETF profiles, `175,000+` Form N-PORT holdings & reverse stock-to-ETF exposure (`etf-exposures`) |
| `get_macro_and_fx` | 1M–30Y U.S. Treasury curves, TIPS real yields, CPI/Labor/GDP packs, central bank policy rates, 82 FRED series & 42 FX currencies |
| `get_corporate_actions` | Dividends, splits, shareholder returns & exchange actions |
| `list_instruments` / `get_peers` | Search 90,000+ listings by name, ticker, country, or sector and find comparable peers |
| `get_capabilities` / `get_market_status` | Dataset coverage, sector taxonomies & live exchange trading hours |

## Links

- **Homepage & Pricing:** [https://quantset.dev](https://quantset.dev)
- **AI Agents & MCP Guide:** [https://quantset.dev/docs/agents](https://quantset.dev/docs/agents)
- **All Endpoints:** [https://quantset.dev/docs/api](https://quantset.dev/docs/api)
- **How We Verify Data:** [https://quantset.dev/docs/data-quality](https://quantset.dev/docs/data-quality)
- **7 Research Skills (`quantset/skills`):** [https://github.com/quantset/skills](https://github.com/quantset/skills)
- **Full LLM Contract (`llms.txt`):** [https://api.quantset.dev/llms.txt](https://api.quantset.dev/llms.txt)
