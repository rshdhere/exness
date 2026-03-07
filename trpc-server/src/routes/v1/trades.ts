import { ORDERS } from "../../data/data";
import { privateProcedure, router } from "../../trpc";
import { orderSchema } from "../../validators";

export const tradesRouter = router({
    open: privateProcedure
    .input(orderSchema.openInput)
    .output(orderSchema.openOutput)
    .mutation( ({ ctx }) => {
        const userId = ctx.userId;

        if (!ORDERS[userId]){
            return {
                trades: []
            }
        };

        const formattedTrades = Object.entries(ORDERS[userId]).map(
            ([orderId, order]) => ({
                orderId,
                type: order.type,
                margin: order.margin,
                leverage: order.leverage,
                asset: order.asset,
                openPrice: order.openPrice,
                takeProfit: order.takeProfit,
                stopLoss: order.stopLoss,
                liquidationPrice: order.liquidationPrice,
            })
        );

        return {
            trades: formattedTrades
        }


    } ),

    getAll: privateProcedure
    .output(orderSchema.getAllOutput)
    .query()
})