import { pgClient } from "../client";
import { PRICE_SCALE, USD_SCALE } from "../config/config";

export function toInternalUSD(usd: number): number {
    return Math.round(usd * USD_SCALE);
}

export function fromInternalUSD(value: number): number {
    return value / USD_SCALE;
}

export const BUCKET_SQL_MAP = {
    "1m": "date_trunc('minute', timestamp)",
    "1d": "date_trunc('day', timestamp)",
    "1w": "date_trunc('week', timestamp)",
} as const;

export type CandleRow = {
    bucket: Date | string;
    open: number | string;
    high: number | string;
    low: number | string;
    close: number | string;
};

export function toUnixTimestamp(value: Date | string): number {
    return Math.floor(new Date(value).getTime() / 1000);
}

export function formatCandles(rows: CandleRow[]) {
    return rows.map((row) => ({
        timestamp: toUnixTimestamp(row.bucket),
        open: Number(row.open),
        high: Number(row.high),
        low: Number(row.low),
        close: Number(row.close),
        decimal: 4 as const,
    }));
}

export function formatCandlesFromTrades(rows: CandleRow[]) {
    return rows.map((row) => ({
        timestamp: toUnixTimestamp(row.bucket),
        open: Number(row.open) / PRICE_SCALE,
        high: Number(row.high) / PRICE_SCALE,
        low: Number(row.low) / PRICE_SCALE,
        close: Number(row.close) / PRICE_SCALE,
        decimal: 4 as const,
    }));
}

export async function tableExists(tableName: string) {
    const { rows } = await pgClient.query<{ value: string | null }>(
        "SELECT to_regclass($1) AS value",
        [`public.${tableName}`],
    );

    return Boolean(rows[0]?.value);
}