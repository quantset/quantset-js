// Generated from public contract models by scripts/generate-sdk-types.py.

export interface ShareBasisBreak {
  basis_break_date: string;
  break_kind: string;
  overnight_ratio: number | null;
}

export interface Provenance {
  as_of: string | null;
  observed_at: string | null;
  currency: string | null;
  unit: string;
  scale: 1;
  basis: string;
  point_in_time: boolean;
  comparable_from: string | null;
  share_basis_breaks: Array<ShareBasisBreak>;
  limitations: Array<string>;
}

export interface Price {
  instrument_id: string;
  quote_currency: string | null;
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  split_adj_close: number | null;
  adj_close: number | null;
  adjusted_as_of: string | null;
  change_pct: number | null;
  volume: number | null;
  dollar_volume: number | null;
  market_cap: number | null;
  shares_outstanding: number | null;
  volume_unit: "shares" | "base_asset_units" | "index_points";
  adjustment: string;
}

export interface Instrument {
  sector: string | null;
  sector_as_of: string | null;
  sector_funds: Array<string>;
  directory_sector: string | null;
  sector_coverage: "direct" | "linked_isin" | "directory_only" | "industry_only" | "not_applicable" | "unclassified";
  sector_asset_type: string | null;
  sector_isin: string | null;
  sector_link_venue: string | null;
  sector_link_ticker: string | null;
  directory_link_venue: string | null;
  directory_link_ticker: string | null;
  industry_label: string | null;
  sic_code: string | null;
  sic_description: string | null;
  instrument_id: string;
  namespace: "us" | "global" | "crypto" | "index";
  symbol: string;
  listing_symbol: string | null;
  name: string | null;
  country: string | null;
  exchange: string | null;
  asset_type: string;
  quote_currency: string | null;
  base_asset: string | null;
  quote_asset: string | null;
  cik: string | null;
  sic: string | null;
  industry: string | null;
  sector_label: string | null;
  sector_scheme: "sec_division" | "directory" | null;
  has_financials: boolean;
  reference_market: string | null;
  reference_group: string | null;
  reference_symbol: string | null;
  is_active: boolean;
  listing_status: "active" | "stale" | "inactive_or_delisted";
  latest_price_date: string | null;
  latest_close: number | null;
  usd_price: number | null;
  market_cap_b: number | null;
  pe_ttm: number | null;
  dividend_yield_pct: number | null;
  rev_growth_qoq_pct: number | null;
  etf_asset_class: string | null;
  backing_type: string | null;
  fund_category: string | null;
  category_basis: string | null;
  daily_target_multiple: number | null;
  multiple_basis: string | null;
  direction: string | null;
  corroboration_status: string | null;
  weighted_maturity_years: number | null;
  credit_quality: string | null;
  benchmark_index: string | null;
  benchmark_instrument_id: string | null;
  underlying_instrument_id: string | null;
  expense_ratio_pct: number | null;
}

export interface IntradayBar {
  instrument_id: string;
  quote_currency: "USD";
  ts_utc: string;
  date_local: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
  cross_checked: boolean;
  quarantined_days: number;
}

export interface InstrumentSnapshot {
  sector: string | null;
  sector_as_of: string | null;
  sector_funds: Array<string>;
  directory_sector: string | null;
  sector_coverage: "direct" | "linked_isin" | "directory_only" | "industry_only" | "not_applicable" | "unclassified";
  sector_asset_type: string | null;
  sector_isin: string | null;
  sector_link_venue: string | null;
  sector_link_ticker: string | null;
  directory_link_venue: string | null;
  directory_link_ticker: string | null;
  industry_label: string | null;
  sic_code: string | null;
  sic_description: string | null;
  instrument_id: string;
  namespace: "us" | "global" | "crypto" | "index";
  symbol: string;
  name: string | null;
  country: string | null;
  exchange: string | null;
  security_type: string | null;
  asset_type: string | null;
  cik: string | null;
  sic: string | null;
  industry: string | null;
  sec_sector: string | null;
  gics_sector: string | null;
  latest_date: string | null;
  stale_days: number | null;
  is_active: boolean | null;
  has_financials: boolean | null;
  quote_currency: string | null;
  native_close: number | null;
  usd_rate: number | null;
  fx_date: string | null;
  price: number | null;
  daily_open: number | null;
  daily_high: number | null;
  daily_low: number | null;
  volume: number | null;
  shares_out: number | null;
  price_adjustment: string | null;
  last_share_change: string | null;
  change_1d_pct: number | null;
  change_5d_pct: number | null;
  change_1m_pct: number | null;
  change_6m_pct: number | null;
  change_1y_pct: number | null;
  ytd_pct: number | null;
  total_return_start_date: string | null;
  total_return_1y_pct: number | null;
  dividend_basis: string | null;
  dividend_price_observation: string | null;
  sma_50: number | null;
  sma_50_days: number | null;
  sma_200: number | null;
  sma_200_days: number | null;
  ema_15: number | null;
  rsi14: number | null;
  mfi14: number | null;
  realized_volatility: number | null;
  beta: number | null;
  high_52w: number | null;
  low_52w: number | null;
  range_52w_days: number | null;
  weekly_high: number | null;
  weekly_low: number | null;
  monthly_high: number | null;
  monthly_low: number | null;
  market_cap_b: number | null;
  quote_market_cap_b: number | null;
  market_cap_basis: string | null;
  market_cap_shares_as_of: string | null;
  market_cap_filed: string | null;
  market_cap_accession: string | null;
  market_cap_ordinary_per_us_share: number | null;
  financial_currency: string | null;
  valuation_eligible: boolean | null;
  fundamentals_basis: string | null;
  fundamentals_as_of: string | null;
  latest_fy_date: string | null;
  revenue_ttm: number | null;
  revenue_prev: number | null;
  rev_growth_yoy_pct: number | null;
  rev_growth_qoq_pct: number | null;
  rev_growth_qyoy_pct: number | null;
  gross_profit_ttm: number | null;
  operating_income_ttm: number | null;
  net_income_ttm: number | null;
  ebitda_ttm: number | null;
  eps_ttm: number | null;
  eps_ttm_basis: string | null;
  eps_fy: number | null;
  eps_growth_yoy_pct: number | null;
  eps_growth_3y_cagr_pct: number | null;
  eps_growth_5y_cagr_pct: number | null;
  gross_margin_pct: number | null;
  operating_margin_pct: number | null;
  net_margin_pct: number | null;
  roe_pct: number | null;
  roic_pct: number | null;
  debt_to_equity: number | null;
  current_ratio: number | null;
  interest_coverage: number | null;
  balance_sheet_as_of: string | null;
  balance_equation_consistent: boolean | null;
  cash: number | null;
  total_assets: number | null;
  long_term_debt: number | null;
  total_debt: number | null;
  total_liabilities: number | null;
  total_equity: number | null;
  book_value_per_share: number | null;
  operating_cash_flow: number | null;
  capex: number | null;
  free_cash_flow: number | null;
  cash_flow_as_of: string | null;
  cash_flow_currency: string | null;
  cash_flow_basis: string | null;
  fcf_shares_used: number | null;
  fcf_share_basis: string | null;
  fcf_per_share: number | null;
  fcf_yield_pct: number | null;
  pe_ttm: number | null;
  pe_forward: number | null;
  pb_ratio: number | null;
  ffo_ttm: number | null;
  price_to_ffo: number | null;
  enterprise_value_b: number | null;
  ev_to_ebitda: number | null;
  ev_to_fcf: number | null;
  net_debt_to_ebitda: number | null;
  fcf_margin_pct: number | null;
  share_count_change_1y_pct: number | null;
  eps_current_fy: number | null;
  current_fy_end: string | null;
  eps_next_fy: number | null;
  next_fy_end: string | null;
  current_fy_estimate_as_of: string | null;
  next_fy_estimate_as_of: string | null;
  forward_eps: number | null;
  analyst_count: number | null;
  analyst_rank: string | null;
  value_grade: string | null;
  growth_grade: string | null;
  momentum_grade: string | null;
  vgm_grade: string | null;
  annual_dividend: number | null;
  dividend_yield_pct: number | null;
  dividend_years_10y: number | null;
  dividend_increase_streak_years: number | null;
  last_ex_dividend_date: string | null;
  insider_buys: number | null;
  insider_sells: number | null;
  insider_latest_date: string | null;
  insider_data_through_date: string | null;
  insider_window_end: string | null;
  insider_coverage: string | null;
  employees: number | null;
  etf_asset_class: string | null;
  backing_type: string | null;
  fund_category: string | null;
  category_basis: string | null;
  daily_target_multiple: number | null;
  multiple_basis: string | null;
  direction: string | null;
  corroboration_status: string | null;
  weighted_maturity_years: number | null;
  credit_quality: string | null;
  benchmark_index: string | null;
  benchmark_instrument_id: string | null;
  underlying_instrument_id: string | null;
  expense_ratio_pct: number | null;
}

export interface Fundamentals {
  instrument_id: string;
  basis: "ttm" | "fiscal_year" | null;
  period_end: string | null;
  currency: string | null;
  revenue: number | null;
  gross_profit: number | null;
  operating_income: number | null;
  net_income: number | null;
  eps: number | null;
  eps_method: "reported_or_net_income_per_average_share";
  revenue_growth_yoy_pct: number | null;
  revenue_growth_qoq_pct: number | null;
  revenue_growth_quarter_yoy_pct: number | null;
  eps_growth_yoy_pct: number | null;
  eps_growth_5y_cagr_pct: number | null;
}

export interface BalanceSheetValues extends Record<string, number | null> {
  cash_and_equivalents: number | null;
  total_current_assets: number | null;
  total_assets: number | null;
  total_current_liabilities: number | null;
  total_liabilities: number | null;
  total_equity: number | null;
  minority_interest: number | null;
  equity_including_noncontrolling_interest: number | null;
  notes_payable: number | null;
  current_portion_long_term_debt: number | null;
  current_portion_capital_leases: number | null;
  long_term_debt: number | null;
  non_current_capital_leases: number | null;
  convertible_debt: number | null;
  mortgages: number | null;
  shares_outstanding: number | null;
  book_value_per_share: number | null;
}

export interface CashFlowValues extends Record<string, number | null> {
  operating_cash_flow: number | null;
  capex: number | null;
  free_cash_flow: number | null;
  dividends_paid: number | null;
  investing_cash_flow: number | null;
  financing_cash_flow: number | null;
  net_change_in_cash_and_equivalents: number | null;
  cash_at_beginning_of_period: number | null;
  cash_at_end_of_period: number | null;
}

export interface IncomeStatementValues extends Record<string, number | null> {
  revenue: number | null;
  cost_of_revenue: number | null;
  gross_profit: number | null;
  operating_income: number | null;
  interest_expense: number | null;
  pretax_income: number | null;
  income_taxes: number | null;
  net_income: number | null;
  ebitda: number | null;
  average_shares: number | null;
  weighted_average_basic_shares: number | null;
  weighted_average_diluted_shares: number | null;
  reported_diluted_eps: number | null;
  net_income_per_average_share: number | null;
}

export interface Statement {
  instrument_id: string;
  period_end: string;
  period_start: string | null;
  available_at: string | null;
  period: "annual" | "quarterly";
  period_basis: "annual" | "discrete_quarter" | "instant" | "mixed_fiscal_ytd_and_discrete";
  currency: string | null;
  values: IncomeStatementValues | BalanceSheetValues | CashFlowValues;
  eps_method: string | null;
  accession: string | null;
  form: string | null;
  concepts: Record<string, string>;
  quality_issues: Array<string>;
}

export interface Estimate {
  instrument_id: string;
  as_of: string;
  period_end: string;
  period: string;
  consensus: number | null;
  recent: number | null;
  analyst_count: number | null;
  high: number | null;
  low: number | null;
  year_ago: number | null;
  scale_verified: boolean | null;
}

export interface AnalystConsensusRow {
  instrument_id: string;
  symbol: string;
  name: string | null;
  quote_currency: string | null;
  financial_currency: string | null;
  current_price: number | null;
  target_mean_price: number | null;
  target_median_price: number | null;
  target_high_price: number | null;
  target_low_price: number | null;
  upside_pct: number | null;
  analyst_count: number | null;
  recommendation_key: string | null;
  strong_buy: number | null;
  buy: number | null;
  hold: number | null;
  sell: number | null;
  strong_sell: number | null;
  forward_pe: number | null;
  peg_ratio: number | null;
  beta: number | null;
  shares_short: number | null;
  short_pct_of_float: number | null;
  held_pct_insiders: number | null;
  held_pct_institutions: number | null;
  next_earnings_date: string | null;
  website: string | null;
  employees: number | null;
  business_summary: string | null;
  observed_on: string | null;
}

export interface Earnings {
  instrument_id: string;
  period_end: string;
  actual_eps: number | null;
  estimated_eps: number | null;
  surprise_pct: number | null;
}

export interface CorporateAction extends Record<string, unknown> {
  instrument_id: string;
  symbol: string | null;
  name: string | null;
  market_cap_b: number | null;
  action_kind: "dividend" | "split" | "shareholder_return" | "india_exchange_action";
  ex_date: string | null;
  year: number | null;
  amount: number | null;
  buybacks: number | null;
  to_factor: number | null;
  for_factor: number | null;
  split_ratio: number | null;
  exchange: string | null;
  isin: string | null;
  record_date: string | null;
  action_type: string | null;
  ratio_num: number | null;
  ratio_den: number | null;
  cash_amount: number | null;
  face_value_from: number | null;
  face_value_to: number | null;
  raw_subject: string | null;
}

export interface EtfConstituent {
  fund_instrument_id: string;
  fund_symbol: string;
  fund_name: string;
  as_of: string;
  filing_date: string | null;
  constituent_instrument_id: string | null;
  ticker: string;
  issuer: string | null;
  country: string;
  exchange: string;
  sector: string | null;
  weight_pct: number | null;
  shares: number | null;
  market_value: number | null;
  isin: string | null;
  market_currency: string | null;
}

export interface SecFact {
  fact_id: string;
  cik: string;
  entity_name: string | null;
  taxonomy: string;
  concept: string;
  unit: string;
  period_start: string | null;
  period_end: string;
  value: number | null;
  value_text: string | null;
  accession: string | null;
  filed: string | null;
  form: string | null;
  filing_fiscal_year: number | null;
  filing_fiscal_period: string | null;
  frame: string | null;
}

export interface MacroSeriesInfo {
  series_id: string;
  title: string | null;
  category: string | null;
  first_date: string;
  last_date: string;
  observations: number;
  latest_value: number | null;
}

export interface MacroObservation {
  series_id: string;
  date: string;
  value: number | null;
  title: string | null;
}

export interface TreasuryYieldCurvePoint {
  date: string;
  fed_funds_pct: number | null;
  yield_1y_pct: number | null;
  yield_2y_pct: number | null;
  yield_3y_pct: number | null;
  yield_5y_pct: number | null;
  yield_7y_pct: number | null;
  yield_10y_pct: number | null;
  yield_20y_pct: number | null;
  yield_30y_pct: number | null;
  spread_10y_2y_pct: number | null;
  spread_10y_3m_pct: number | null;
  real_yield_10y_pct: number | null;
  breakeven_10y_pct: number | null;
}

export interface FxRate {
  date: string;
  base_currency: string;
  quote_currency: string;
  usd_per_unit: number;
}

export interface ScreenerSearchHit {
  instrument_id: string;
  symbol: string;
  name: string | null;
  sector: string | null;
  industry: string | null;
  report_period: string | null;
  filing_date: string | null;
  currency: string | null;
  values: Record<string, number | string | null>;
}

export interface ProjectedLineItems {
  instrument_id: string;
  report_period: string;
  period: "annual" | "quarterly" | "ttm";
  currency: string | null;
  values: Record<string, number | null>;
}

export interface ScreenerFilterRule {
  field: string;
  operator: "gt" | "lt" | "gte" | "lte" | "eq" | "in";
  value: unknown;
}

export interface ScreenerOrderBy {
  field?: string;
  direction?: "asc" | "desc" | "ASC" | "DESC";
}

export interface ScreenerSearchRequest {
  filters: Array<ScreenerFilterRule>;
  namespace?: "us" | "global";
  as_of?: string | null;
  currency?: string;
  percent_format?: "percent" | "decimal";
  order_by?: ScreenerOrderBy | null;
  limit?: number;
}

export interface LineItemsSearchRequest {
  tickers: Array<string>;
  line_items: Array<string>;
  period?: "annual" | "quarterly" | "ttm";
  start?: string | null;
  end?: string | null;
  limit_per_instrument?: number;
}
