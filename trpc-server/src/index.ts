import express from "express";
import { createClient } from "redis";
import { router } from "./trpc";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config/config";
import { userRouter } from "./routes/v1/user";
import * as trpcExpress from "@trpc/server/adapters/express";
import { tradesRouter } from "./routes/v1/trades";
import { tradeRouter } from "./routes/v1/trade";
import { assetRouter } from "./routes/v1/asset";
import { candlesRouter } from "./routes/v1/candles";
import { PRICE_STORE } from "./data/data";
import { checkOpenPositions } from "./service/ordersChecker";

export const appRouter = router({
    v1: router({
        user: userRouter,
        asset: assetRouter,
        trade: tradeRouter,
        trades: tradesRouter,
        candles: candlesRouter,
    })
});

export type AppRouter = typeof appRouter;

export const app = express();

app.use(express.json());

app.use("/trpc", trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext({ req }: trpcExpress.CreateExpressContextOptions) {

        const authHeader = req.headers.authorization;

        if (!JWT_SECRET || !authHeader || !authHeader.startsWith("Bearer ")) {
            return {
                userId: undefined
            }
        };

        const token = authHeader?.split(" ")[1];

        if (!token){
            return {
                userId: undefined
            }
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);

            if (typeof decoded !== 'object' || typeof decoded.userId !== 'string' || decoded === null){
                return {
                    userId: undefined
                }
            };

            return {
                userId: decoded.userId
            }

        } catch {

            return {
                userId: undefined
            }
        }
    }
}));

type RedisPriceMessage = {
    symbol: string;
    askPrice: number;
    bidPrice: number;
    decimals?: number;
};

const CHANNELS = ["BTC", "ETH", "SOL"] as const;

async function connectRedisWithFallback() {
    const candidates = [
        process.env.REDIS_URL,
        "redis://redis_service:6379",
        "redis://localhost:6379",
    ].filter((value): value is string => Boolean(value));

    for (const url of candidates) {
        const client = createClient({ url });
        try {
            await client.connect();
            return client;
        } catch {
            client.destroy();
        }
    }

    throw new Error("unable to connect to redis for market feed");
}

function normalizePrice(value: number, decimals = 4) {
    const scale = 10 ** decimals;
    return value / scale;
}

async function startMarketFeedSubscriber() {
    try {
        const redis = await connectRedisWithFallback();

        for (const channel of CHANNELS) {
            await redis.subscribe(channel, (message) => {
                try {
                    const payload = JSON.parse(message) as RedisPriceMessage;
                    const symbol = payload.symbol;
                    const decimals =
                        typeof payload.decimals === "number" && payload.decimals > 0
                            ? payload.decimals
                            : 4;

                    if (!(symbol in PRICE_STORE)) {
                        PRICE_STORE[symbol] = {
                            ask: "0",
                            bid: "0",
                        };
                    }

                    const ask = normalizePrice(Number(payload.askPrice), decimals);
                    const bid = normalizePrice(Number(payload.bidPrice), decimals);
                    if (!Number.isFinite(ask) || !Number.isFinite(bid)) {
                        return;
                    }

                    PRICE_STORE[symbol] = {
                        ask: ask.toString(),
                        bid: bid.toString(),
                    };

                    void checkOpenPositions(symbol, { ask, bid });
                } catch {
                    // Skip malformed feed messages and keep stream alive.
                }
            });
        }
    } catch (error) {
        console.error("market feed subscription failed", error);
    }
}

void startMarketFeedSubscriber();