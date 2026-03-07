import express from "express";
import { router } from "./trpc";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config/config";
import { userRouter } from "./routes/v1/user";
import * as trpcExpress from "@trpc/server/adapters/express";
import { tradesRouter } from "./routes/v1/trades";
import { tradeRouter } from "./routes/v1/trade";
import { assetRouter } from "./routes/v1/asset";

export const appRouter = router({
    v1: router({
        user: userRouter,
        asset: assetRouter,
        trade: tradeRouter,
        trades: tradesRouter,
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
}))