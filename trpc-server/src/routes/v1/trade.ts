import { TRPCError } from "@trpc/server";
import { ORDERS, PRICE_STORE, USERS } from "../../data/data";
import { closeOrder } from "../../service/closeOrder";
import { privateProcedure, router } from "../../trpc";
import { tradeCloseInputSchema, tradeCloseOutputSchema, tradeOpenOutputSchema, tradeSchema, type TradeAsset } from "../../validators";
import { v4 } from "uuid";

export const tradeRouter = router({
    open: privateProcedure
    .input(tradeSchema)
    .output(tradeOpenOutputSchema)
    .mutation(( { ctx, input } ) => {
        const userId = ctx.userId;

        if (!USERS[userId]){
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "user not found"
            })
        };

        let asset = input.asset;
        const user = USERS[userId];

        if (asset && asset.endsWith("USDT")){
            asset = asset.replace('USDT', '') as TradeAsset
        };

        const basePriceData = PRICE_STORE[asset];

        const openPriceRaw =
        input.type === 'buy' ? basePriceData.ask : basePriceData.bid;

        const openPrice = Number(openPriceRaw);

        if (!openPriceRaw || Number.isNaN(openPrice) || user.balance.usd_balance < input.margin) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "invalid assets or insuffecient funds"
            })
        };

        user.balance.usd_balance -= input.margin;

        const liquidationPrice =
        input.type === 'buy'
        ? Math.floor(openPrice * (1 - 1 / input.leverage))
        : Math.floor(openPrice * (1 + 1 / input.leverage))

        const order = {
            type: input.type,
            margin: input.margin,
            leverage: input.leverage,
            asset,
            openPrice,
            timeStamp: Date.now(),
            takeProfit: input.takeProfit,
            stopLoss: input.stopLoss,
            liquidationPrice,
        }

        const orderId = v4();

        if (!ORDERS[userId]){
            ORDERS[userId] = {}
        };

        ORDERS[userId][orderId] = order;

        return {
            orderId
        }
    }),

    close: privateProcedure
    .input(tradeCloseInputSchema)
    .output(tradeCloseOutputSchema)
    .mutation(( { ctx, input } ) => {
        const userId = ctx.userId;
        const user = USERS[userId];

        if (!user){
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "user not found"
            })
        };

        const orderId = input.orderId;
        if (!ORDERS[userId]?.[orderId]) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "order not found"
            });
        };

        const pnl = closeOrder(userId, orderId, "manual");
        if (pnl === null) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Invalid asset or missing price"
            });
        };

        return {
            pnl,
            message: "position closed successfully"
        }
    })
})