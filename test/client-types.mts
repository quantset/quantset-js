import { Quantset, type Price } from "quantset";

const qs = new Quantset();
const bars = await qs.prices("IBM");
const bar: Price = bars.data[0];
const numericFields: (number | null)[] = [
  bar.open, bar.high, bar.low, bar.split_adj_close, bar.change_pct, bar.market_cap
];
const units: "shares" | "base_asset_units" | "index_points" = bar.volume_unit;
const liabilities: number | null = (await qs.balance_sheet(["AAPL"])).data[0].values.total_liabilities;
const currency: string = (await qs.fx({ base_currency: "EUR" })).data[0].base_currency;
const csv: string = await qs.get("quotes", { format: "csv", tickers: ["AAPL"] });
const capabilities = await qs.get<{ resources: string[] }>("capabilities");
void [numericFields, units, liabilities, currency, csv, capabilities.resources];
