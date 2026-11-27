# QuantSet MCP

Put the global stock market inside Claude, Cursor and Codex.

| | |
| --- | --- |
| **90,000+** | symbols covered |
| **67** | countries in one schema |
| **36,000+** | companies with financial statements |
| **127M+** | facts from SEC filings since 2000 |
| **4,899** | ETFs you can look through |
| **175,000+** | fund holdings mapped to tickers |
| **42** | currencies with dated FX rates |

**Free to start: 250 credits, no card.** [Get a key](https://quantset.dev/signup)

## Quickstart

```sh
npx quantset init
```

Or try it right now with no signup:

```sh
claude mcp add --transport http quantset https://api.quantset.dev/mcp \
  --header "Authorization: Bearer mw_demo"
```

Add the seven research skills (DCF, comps, memos, earnings, forensics, portfolio x-ray):

```sh
npx skills add quantset/skills
```

## Ask the questions one lookup can't answer

- "Which fast-growing companies are still cheap?"
- "How much of my portfolio is secretly one stock? I hold IVV, QQQ and SMH."
- "Which carmaker is cheapest once you put them in one currency?"
- "Which companies are growing revenue 20%+ with 15%+ free cash flow margins and still trade under 15x EV/FCF?"
- "Are Nvidia insiders selling into the rally, and is it on a pre-arranged 10b5-1 plan?"
- "Who is buying back the most stock while trading at the cheapest multiples?"
- "Where in the AI supply chain is free cash flow growing fastest?"

## What you get

- **Prices:** daily and intraday across 67 countries, plus crypto and FX
- **Financials:** income, balance sheet and cash flow for 36,000+ companies
- **SEC filings:** 127M+ facts back to 2000, insider trades and 13F holdings, each linked to its source
- **ETFs:** look through 4,899 funds to 175,000+ holdings
- **Estimates:** consensus EPS and revenue, with earnings surprises
- **Screener:** 40+ factors
- **Macro:** Treasury curves, CPI and FRED series

## Built for agents

- Every figure links to the filing it came from
- Missing data returns `null`, never a fake `0`
- Snapshots stay fixed across multi-page reads

## Manual setup

In `claude_desktop_config.json` or `.cursor/mcp.json`:

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

In **Claude.ai** or **ChatGPT** web connectors, add `https://api.quantset.dev/mcp` and connect with OAuth.

## Tools Included

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
| `submit_feedback` | Free feedback tool for reporting missing fields, ticker requests, or data questions |
| `list_instruments` / `get_peers` | Search 90,000+ listings by name, ticker, country, or sector and find comparable peers |
| `get_capabilities` / `get_market_status` | Dataset coverage, sector taxonomies & live exchange trading hours |

## Links

- **Homepage & Pricing:** [https://quantset.dev](https://quantset.dev)
- **AI Agents & MCP Guide:** [https://quantset.dev/docs/agents](https://quantset.dev/docs/agents)
- **All Endpoints:** [https://quantset.dev/docs/api](https://quantset.dev/docs/api)
- **How We Verify Data:** [https://quantset.dev/docs/data-quality](https://quantset.dev/docs/data-quality)
- **7 Research Skills (`quantset/skills`):** [https://github.com/quantset/skills](https://github.com/quantset/skills)
- **Full LLM Contract (`llms.txt`):** [https://api.quantset.dev/llms.txt](https://api.quantset.dev/llms.txt)
