import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "../../../trpc-server/src/index";

type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

export type AssetSymbol = RouterInputs["v1"]["candles"]["getAll"]["asset"];
export type CandleInterval = RouterInputs["v1"]["candles"]["getAll"]["ts"];
export type AuthInput = RouterInputs["v1"]["user"]["signin"];
export type OpenTradeInput = RouterInputs["v1"]["trade"]["open"];
export type OpenTrade = RouterOutputs["v1"]["trades"]["open"]["trades"][number];
export type Candle = RouterOutputs["v1"]["candles"]["getAll"]["candles"][number];
export type AssetItem = RouterOutputs["v1"]["asset"]["getAll"]["assets"][number];
export type AccountSnapshot = RouterOutputs["v1"]["user"]["me"];

export type PriceQuote = {
  symbol: AssetSymbol;
  askPrice: number;
  bidPrice: number;
  decimals: number;
  time: number;
};

export const TRADE_ASSETS: AssetSymbol[] = ["BTC", "ETH", "SOL"];
export const CANDLE_INTERVALS: CandleInterval[] = ["1m", "1d", "1w"];

export function isAssetSymbol(value: string): value is AssetSymbol {
  return TRADE_ASSETS.includes(value as AssetSymbol);
}
