import { TRPCError } from "@trpc/server";
import { pgClient } from "../../client";
import { publicProcedure, router } from "../../trpc";
import { candlesSchema } from "../../validators";
import { ASSET_SYMBOL_MAP, DURATION_TABLE_MAP } from "../../data/data";
import { BUCKET_SQL_MAP, formatCandles, formatCandlesFromTrades, tableExists, type CandleRow } from "../../utils/utils";

export const candlesRouter = router({
    getAll: publicProcedure
    .input(candlesSchema.getAllInput)
    .output(candlesSchema.getAllOutput)
    .query(
        async ({ input }) => {

        const dbtable = DURATION_TABLE_MAP[input.ts];
        const symbol = ASSET_SYMBOL_MAP[input.asset];
        const startDate = new Date(input.startTime * 1000);
        const endDate = new Date(input.endTime * 1000);

        try {
            const hasAggregateTable = await tableExists(dbtable);

            if (hasAggregateTable) {
                const aggregateQuery =
                `SELECT bucket, open, high, low, close FROM ${dbtable} WHERE symbol = $1 AND bucket >= $2 AND bucket <= $3 ORDER BY bucket ASC`;
                const { rows } = await pgClient.query<CandleRow>(aggregateQuery, [
                    symbol,
                    startDate,
                    endDate,
                ]);

                return {
                    candles: formatCandles(rows),
                };
            }

            const bucketSql = BUCKET_SQL_MAP[input.ts];
            const fallbackQuery = `
            WITH filtered AS (
                SELECT timestamp, price
                FROM "Trade"
                WHERE symbol = $1
                AND timestamp >= $2
                AND timestamp <= $3
            ),
            bucketed AS (
                SELECT
                ${bucketSql} AS bucket,
                timestamp,
                price
                FROM filtered
            ),
            ranked AS (
                SELECT
                bucket,
                first_value(price) OVER (
                    PARTITION BY bucket
                    ORDER BY timestamp ASC
                ) AS open,
                max(price) OVER (PARTITION BY bucket) AS high,
                min(price) OVER (PARTITION BY bucket) AS low,
                first_value(price) OVER (
                    PARTITION BY bucket
                    ORDER BY timestamp DESC
                ) AS close
                FROM bucketed
            )
            SELECT DISTINCT bucket, open, high, low, close
            FROM ranked
            ORDER BY bucket ASC`;

            const { rows } = await pgClient.query<CandleRow>(fallbackQuery, [
                symbol,
                startDate,
                endDate,
            ]);

            const candles = formatCandlesFromTrades(rows);

            return { candles };
        } catch (error) {
            console.error("failed to fetch candles", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "failed to fetch candles"
            });
        }
    })
});