import { Quantset } from "./index.js";

export interface QuantsetToolSpec<Args = any> {
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  execute: (args: Args) => Promise<unknown>;
}

/**
 * Framework-agnostic AI tool definitions for Vercel AI SDK (`generateText` / `streamText`),
 * Mastra, OpenAI Agents JS, and LangChain.js — zero extra runtime dependencies required.
 */
export function createQuantsetTools(
  client: Quantset = new Quantset(undefined, undefined, { workflowId: "js-ai-tools" })
): Record<string, QuantsetToolSpec> {
  return {
    quantset_quotes: {
      description:
        "Fetch latest prices, 1-day change %, USD market cap, trailing P/E, and native currency across up to 100 US, 67-country global, or crypto symbols (e.g. ['us:NVDA', 'global:SHEL.L', 'crypto:BTCUSDT']).",
      parameters: {
        type: "object",
        properties: {
          tickers: { type: "array", items: { type: "string" }, description: "Ticker symbols or canonical IDs." },
        },
        required: ["tickers"],
      },
      execute: async ({ tickers }: { tickers: string[] }) => (await client.quotes(tickers)).data,
    },
    quantset_financial_statements: {
      description:
        "Fetch standardized income, balance_sheet, or discrete quarterly cash_flow statements across 36,000+ companies with SEC XBRL provenance.",
      parameters: {
        type: "object",
        properties: {
          tickers: { type: "array", items: { type: "string" } },
          kind: { type: "string", enum: ["income", "balance_sheet", "cash_flow"] },
          period: { type: "string", enum: ["annual", "quarterly"] },
          limit_per_instrument: { type: "number" },
          as_of: { type: "string", description: "Optional YYYY-MM-DD point-in-time date." },
        },
        required: ["tickers"],
      },
      execute: async ({ tickers, kind = "income", period = "annual", limit_per_instrument = 5, as_of }) => {
        const opts = { period, limit_per_instrument, as_of };
        if (kind === "balance_sheet") return (await client.balance_sheet(tickers, opts)).data;
        if (kind === "cash_flow") return (await client.cash_flow(tickers, opts)).data;
        return (await client.income(tickers, opts)).data;
      },
    },
    quantset_etf_lookthrough: {
      description:
        "Unpack any ETF's Form N-PORT constituent holdings (reverse_exposure=false) or find every ETF holding a stock ordered by portfolio weight (reverse_exposure=true) across 4,899 funds.",
      parameters: {
        type: "object",
        properties: {
          ticker: { type: "string" },
          reverse_exposure: { type: "boolean" },
          limit: { type: "number" },
        },
        required: ["ticker"],
      },
      execute: async ({ ticker, reverse_exposure = false, limit = 30 }) => {
        if (reverse_exposure) return client.get("etf-exposures", { ticker, limit });
        return (await client.etf_holdings(ticker, { limit })).data;
      },
    },
    quantset_screen_stocks: {
      description:
        "Screen 52,000+ US or 67-country global stocks by market cap, ROIC %, EV/FCF, P/E, sector, and 1-year net share buybacks.",
      parameters: {
        type: "object",
        properties: {
          namespace: { type: "string", enum: ["us", "global"] },
          country: { type: "string" },
          sector: { type: "string" },
          min_market_cap_b: { type: "number" },
          min_roic: { type: "number" },
          max_ev_to_fcf: { type: "number" },
          max_pe_ttm: { type: "number" },
          max_share_count_change_1y: { type: "number" },
          limit: { type: "number" },
        },
      },
      execute: async (filters) => (await client.screener(filters)).data,
    },
  };
}
