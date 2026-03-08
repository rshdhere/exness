import type { Prisma } from "./generated/client";

export type TradeBatchItem = Prisma.TradeCreateManyInput;
export const BINANCE_STREAMS = ["btcusdt@aggTrade", "ethusdt@aggTrade", "solusdt@aggTrade"];
export const BINANCE_URL = "wss://stream.binance.com:9443/ws";
export const BATCH_TIMMINGS = 10000; //ms
export const PRECISION = 10000;

export function toInternalPrice(price: number | string): number {
    // Convert to integer with 4 decimal places (matching spec)
    return Math.round(parseFloat(price as any) * PRECISION);
  }
  
  export function fromInternalPrice(price: bigint): number {
    return Number(price) / PRECISION;
  }
  
  export function toDisplayPrice(price: bigint): string {
    return (Number(price) / PRECISION).toFixed(2);
  }
  
  export function toInternalPriceBigInt(price: number | string): bigint {
    return BigInt(Math.round(parseFloat(price as any) * PRECISION));
  }
  
  export function fromInternalPriceBigInt(price: bigint): number {
    return Number(price) / PRECISION;
  }
  
  export enum Channels {
    SOLUSDT,
    ETHUSDT,
    BTCUSDT,
  }