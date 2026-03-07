import { USD_SCALE } from "../config/config";

export function toInternalUSD(usd: number) :number {
    return Math.round(usd * USD_SCALE)
}