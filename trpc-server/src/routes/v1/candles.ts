import { TRPCError } from "@trpc/server";
import { pgClient } from "../../client";
import { publicProcedure, router } from "../../trpc";
import { candlesSchema } from "../../validators";
import { ASSET_SYMBOL_MAP, DURATION_TABLE_MAP } from "../../data/data";

export const candlesRouter = router({
    getAll: publicProcedure
    .input(candlesSchema.getAllInput)
    .output(candlesSchema.getAllOutput)
    .query(
        async ({ input }) => {

        const dbtable = DURATION_TABLE_MAP[input.ts];
        const symbol = ASSET_SYMBOL_MAP[input.asset];

        const query =
        `SELECT bucket, open, high, low, close FROM ${dbtable} WHERE symbol = $1 AND bucket >= $2 AND bucket <= $3 ORDER BY bucket ASC`;

        try {
            const { rows } = await pgClient.query(query, [
                symbol,
                new Date(input.startTime * 1000),
                new Date(input.endTime * 1000),
            ]);

            const candles = rows.map((row) => ({
                timestamp: Math.floor(new Date(row.bucket).getTime() / 1000),
                open: Number(row.open),
                high: Number(row.high),
                low: Number(row.low),
                close: Number(row.close),
                decimal: 4 as const,
            }));

            return { candles };
        } catch {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "failed to fetch candles"
            });
        }
    })
});