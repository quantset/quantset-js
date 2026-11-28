import type {
  Price, Instrument, IntradayBar, InstrumentSnapshot, Fundamentals, Statement as StatementRow,
  IncomeStatementValues, BalanceSheetValues, CashFlowValues, AnalystConsensusRow, Estimate, Earnings, CorporateAction,
  EtfConstituent, SecFact, MacroObservation, MacroSeriesInfo, TreasuryYieldCurvePoint, FxRate, Provenance,
  LineItemsSearchRequest, ProjectedLineItems, ScreenerSearchRequest, ScreenerSearchHit
} from "./models.js";
export type * from "./models.js";
export type { InstrumentSnapshot as Snapshot } from "./models.js";

// Sent with every request so QuantSet can tell which client and version made it. Equal to the version in package.json.
const AGENT = "quantset-js/0.1.9";

export interface CreditReceipt {
  credit_cost: number | null;
  credits_remaining: number | null;
  rate_card_version: string | null;
  request_id: string | null;
}
export interface BilledResponse<T> { data: T; receipt: CreditReceipt }
export type BillingUnit = "request" | "selector" | "bars" | "periods" | "screen" | "rows";
export interface RateRule { unit: BillingUnit; base: number; block_size: number; increment: number; included_units: number; rounding: "ceil" | "floor" }
type CreditLimit = { maxCredits?: number; workflowId?: string };
function creditLimit(n: number | undefined) {
  if (n !== undefined && (!Number.isSafeInteger(n) || n < 0 || n >= 1e12)) throw new RangeError("Credit limits must be integers between 0 and 999999999999");
  return n;
}
function creditReceipt(headers: Headers): CreditReceipt {
  const number = (header: string) => {
    const value = headers.get(header);
    return value !== null && /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : null;
  };
  return { credit_cost: number("X-Credit-Cost"), credits_remaining: number("X-Credits-Remaining"),
    rate_card_version: headers.get("X-Rate-Card-Version"), request_id: headers.get("X-Request-Id") };
}

export interface Page<Row> {
  receipt?: CreditReceipt;
  page_receipts?: CreditReceipt[];
  data: Row[];
  schema_version: "1.0";
  snapshot_id: string | null;
  total_count: number | null;
  next_cursor: string | null;
  provenance: Provenance;
}

export type Query = Record<string, string | number | boolean | readonly string[] | undefined>;
type Dates = { start?: string; end?: string };
type Continuation = { cursor?: string; snapshot_id?: string };
type PricesOptions = Dates & Continuation & { limit?: number; basis?: "raw" | "comparable" };
type StatementOptions = Dates & Continuation & {
  period?: StatementRow["period"]; limit_per_instrument?: number; as_of?: string;
};
type Values = { income: IncomeStatementValues; balance_sheet: BalanceSheetValues; cash_flow: CashFlowValues };
type Tickers = readonly string[];
type SecFactSelector = { ticker: string; issuer_cik?: never } | { ticker?: never; issuer_cik: string };

export interface ErrorBody {
  code?: string;
  affordable_page?: { field: string; value: number };
  required_credits?: number;
  maximum_credits?: number;
  credits_remaining?: number;
  detail: string;
  field?: string;
  hint?: string;
  docs_url?: string;
  candidates?: string[];
  snapshot_id?: string;
}

export class QuantsetError extends Error {
  public readonly retryAfter: string | null;
  public readonly receipt: CreditReceipt;
  constructor(public readonly response: Response, public readonly error: ErrorBody) {
    const retry = response.headers.get("Retry-After");
    super("Quantset HTTP " + response.status + ": " + error.detail
      + (retry === null ? "" : " (Retry-After: " + retry + ")"));
    this.name = "QuantsetError";
    this.retryAfter = retry;
    this.receipt = creditReceipt(response.headers);
  }

  get code() { return this.error.code; }
  get detail() { return this.error.detail; }
  get field() { return this.error.field; }
  get candidates() { return this.error.candidates; }
}

// Only the Node environment field used for authentication. Consumers need no Node typings.
declare const process: { env: { QUANTSET_API_KEY?: string } };
function defaultKey() {
  return (typeof process !== "undefined" && process.env?.QUANTSET_API_KEY) || "mw_demo";
}

export class Quantset {
  private readonly maxCreditsPerRequest?: number;
  private readonly workflowId?: string;
  constructor(private readonly apiKey = defaultKey(), private readonly baseUrl = "https://api.quantset.dev",
              options: { maxCreditsPerRequest?: number; workflowId?: string } = {}) {
    this.maxCreditsPerRequest = creditLimit(options.maxCreditsPerRequest);
    this.workflowId = options.workflowId;
  }

  /** Fetch one response relative to /api/v1. Lists and non-page objects retain their wire shape. */
  get(path: string, params: Query & { format: "csv" }): Promise<string>;
  get<T = unknown>(path: string, params?: Query): Promise<T>;
  async get<T = unknown>(path: string, params: Query = {}): Promise<T> {
    return (await this.getWithReceipt<T>(path, params)).data;
  }

  async post<T = unknown>(path: string, body: object): Promise<T> {
    return (await this.postWithReceipt<T>(path, body)).data;
  }

  getWithReceipt<T = unknown>(path: string, params: Query = {}, options: CreditLimit = {}): Promise<BilledResponse<T>> {
    return this.request("GET", path, params, undefined, options);
  }

  postWithReceipt<T = unknown>(path: string, body: object, options: CreditLimit = {}): Promise<BilledResponse<T>> {
    return this.request("POST", path, {}, body, options);
  }

  rateCard() {
    return this.get<{ rate_card_version: string; rules: Record<string, RateRule> }>("billing/rate-card");
  }

  private async request<T>(method: "GET" | "POST", path: string, params: Query, body: object | undefined,
                           options: CreditLimit): Promise<BilledResponse<T>> {
    const decoded = decodeURIComponent(path);
    if (!path || path.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(path) ||
        /[?#]/.test(path) || decoded.includes("\\") || decoded.split("/").includes("..")) {
      throw new Error("Expected a relative API path with query parameters passed separately");
    }
    const url = new URL(this.baseUrl.replace(/\/$/, "") + "/api/v1/" + path.replace(/^\/api\/v1\/|^\//, ""));
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, Array.isArray(value) ? value.join(",") : String(value));
    }
    const headers = new Headers({ "X-API-Key": this.apiKey, "User-Agent": AGENT });
    const cap = creditLimit(options.maxCredits);
    if (cap !== undefined || this.maxCreditsPerRequest !== undefined) {
      headers.set("X-Max-Credits", String(Math.min(cap ?? Infinity, this.maxCreditsPerRequest ?? Infinity)));
    }
    const workflow = options.workflowId ?? this.workflowId;
    if (workflow !== undefined) headers.set("X-Workflow-Id", workflow);
    if (body !== undefined) headers.set("Content-Type", "application/json");
    const response = await fetch(url, {
      method, headers, redirect: "error", signal: AbortSignal.timeout(30_000),
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    if (!response.ok) {
      const text = await response.text();
      let error: ErrorBody = { detail: text || response.statusText };
      try {
        const parsed = JSON.parse(text);
        if (typeof parsed?.detail === "string") error = parsed;
      } catch { /* Plain-text and empty error bodies use the HTTP fallback. */ }
      throw new QuantsetError(response, error);
    }
    const data = params.format === "csv" ? await response.text() as T : await response.json() as T;
    return {data, receipt: creditReceipt(response.headers)};
  }

  private async page<T>(path: string, params: Query, options: CreditLimit = {}): Promise<Page<T>> {
    const { data: result, receipt } = await this.getWithReceipt<Page<T>>(path, params, options);
    if (!Array.isArray(result?.data) || !(result.snapshot_id === null || typeof result.snapshot_id === "string") ||
        !(result.next_cursor === null || typeof result.next_cursor === "string")) {
      throw new Error("Expected a Quantset JSON page. Use get() for other response formats");
    }
    return { ...result, receipt };
  }

  async *paginate<T = Record<string, unknown>>(path: string, params: Query = {}, maxPages?: number, creditBudget?: number): AsyncGenerator<Page<T>> {
    let credits = creditLimit(creditBudget);
    if (maxPages !== undefined && (!Number.isInteger(maxPages) || maxPages < 1)) {
      throw new RangeError("maxPages must be a positive integer");
    }
    const query = { ...params };
    const seen = new Set([query.cursor]);
    let snapshot = query.snapshot_id;
    for (let count = 0; maxPages === undefined || count < maxPages; count++) {
      const page = await this.page<T>(path, query, {maxCredits: credits});
      if (credits !== undefined) {
        const spent = page.receipt?.credit_cost;
        if (spent == null || spent > credits) throw new Error("Missing or inconsistent credit receipt on a budgeted read");
        credits -= spent;
      }
      if (snapshot !== undefined && page.snapshot_id !== snapshot) throw new Error("Quantset changed snapshots during pagination");
      snapshot = page.snapshot_id ?? undefined;
      const cursor = page.next_cursor;
      if (cursor !== null && seen.has(cursor)) throw new Error("Quantset returned a repeated cursor");
      yield page;
      if (cursor === null || credits === 0) return;
      if (snapshot === undefined) throw new Error("Quantset returned a continuation without a snapshot");
      seen.add(cursor);
      Object.assign(query, { cursor, snapshot_id: snapshot });
    }
  }

  /** Fetch one daily price page, with rows in ascending order. */
  prices(ticker: string, options: PricesOptions = {}): Promise<Page<Price>> {
    return this.page("prices", { ...options, ticker });
  }

  /** Fetch at most maxPages daily price pages and combine them in ascending order. */
  async priceHistory(ticker: string, { maxPages, creditBudget, ...options }: PricesOptions & { maxPages: number; creditBudget?: number }): Promise<Page<Price>> {
    if (!Number.isInteger(maxPages) || maxPages < 1) throw new RangeError("maxPages must be a positive integer");
    const pages: Page<Price>[] = [];
    for await (const page of this.paginate<Price>("prices", { ...options, ticker }, maxPages, creditBudget)) pages.push(page);
    const newest = pages[0];
    const next_cursor = pages[pages.length - 1].next_cursor;
    const page_receipts = pages.flatMap(page => page.receipt ? [page.receipt] : []);
    return { ...newest, next_cursor, receipt: pages.length === 1 ? newest.receipt : undefined,
      page_receipts, data: pages.reverse().flatMap(page => page.data) };
  }

  statements<K extends keyof Values>(kind: K, tickers: Tickers, options: StatementOptions = {}) {
    if (!["income", "balance_sheet", "cash_flow"].includes(kind)) throw new Error("Unknown statement kind");
    return this.page<StatementRow & { values: Values[K] }>("financial-statements/" + kind, { ...options, tickers });
  }

  income(tickers: Tickers, options: StatementOptions = {}) { return this.statements("income", tickers, options); }
  balance_sheet(tickers: Tickers, options: StatementOptions = {}) { return this.statements("balance_sheet", tickers, options); }
  cash_flow(tickers: Tickers, options: StatementOptions = {}) { return this.statements("cash_flow", tickers, options); }

  instruments(params: Query = {}) { return this.page<Instrument>("instruments", params); }
  instrument(instrumentId: string, params: Query = {}) {
    return this.page<Instrument>("instruments/" + encodeURIComponent(instrumentId), params);
  }
  quotes(tickers: Tickers, params: Query = {}) { return this.page<Price>("quotes", { ...params, tickers }); }
  intraday(ticker: string, params: Query = {}) { return this.page<IntradayBar>("intraday", { ...params, ticker }); }
  snapshot(ticker: string, params: Query = {}) { return this.page<InstrumentSnapshot>("snapshots", { ...params, ticker }); }
  fundamentals(params: Query = {}) { return this.page<Fundamentals>("fundamentals", params); }
  screener(params: Query = {}) { return this.page<InstrumentSnapshot>("screener", params); }
  analyst_consensus(ticker: string, params: Query = {}) { return this.page<AnalystConsensusRow>("analyst-consensus", { ...params, ticker }); }
  estimates(ticker: string, params: Query = {}) { return this.page<Estimate>("estimates", { ...params, ticker }); }
  earnings(ticker: string, params: Query = {}) { return this.page<Earnings>("earnings", { ...params, ticker }); }
  corporate_actions(ticker: string, params: Query = {}) { return this.page<CorporateAction>("calendar/corporate-actions", { ...params, ticker }); }
  etf_holdings(ticker: string, params: Query = {}) { return this.page<EtfConstituent>("etf-holdings", { ...params, ticker }); }
  sec_facts(selector: SecFactSelector, params: Query = {}) {
    return this.page<SecFact>("sec/company-facts", { ...params, ...selector });
  }
  searchScreener(body: ScreenerSearchRequest) {
    return this.postWithReceipt<Page<ScreenerSearchHit>>("screener/search", body).then(({data, receipt}) => ({...data, receipt}));
  }
  lineItems(body: LineItemsSearchRequest) {
    return this.postWithReceipt<Page<ProjectedLineItems>>("financial-statements/line-items", body).then(({data, receipt}) => ({...data, receipt}));
  }
  macro(params: Query = {}) { return this.page<MacroObservation>("macro/indicators", params); }
  macro_series(params: Query = {}) { return this.page<MacroSeriesInfo>("macro/series", params); }
  treasury_yields(params: Query = {}) { return this.page<TreasuryYieldCurvePoint>("macro/treasury-yields", params); }
  fx(params: Query = {}) { return this.page<FxRate>("fx/rates", params); }
}

export { createQuantsetTools, type QuantsetToolSpec } from "./tools.js";

