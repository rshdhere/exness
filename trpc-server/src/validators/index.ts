import { z } from "zod";

// trade-procedure validation
export type TradeAsset = z.infer<typeof tradeSchema>["asset"];

export const tradeOpenOutputSchema = z.object({
    orderId: z.uuid()
}).strict();

export const tradeCloseInputSchema = z.object({
    orderId: z.uuid()
}).strict();

export const tradeCloseOutputSchema = z.object({
    pnl: z.number(),
    message: z.string()
}).strict();

export const tradeSchema = z.object({
    type: z.enum(["buy", "sell"]),
    margin: z.number().positive(),
    leverage: z.union([
        z.literal(1),
        z.literal(5),
        z.literal(10),
        z.literal(20),
        z.literal(100),
    ]),
    asset: z.enum(["BTC", "ETH", "SOL"]),
    takeProfit: z.number().positive().optional(),
    stopLoss: z.number().positive().optional(),
});

// trades-procedure validation
const tradesOutputSchema = z.object({
    orderId: z.string().min(1),
    type: z.enum(["buy", "sell"]),
    margin: z.number().positive(),
    leverage: z.number().positive(),
    asset: z.string().min(1),
    openPrice: z.number().positive(),
    takeProfit: z.number().positive().optional(),
    stopLoss: z.number().positive().optional(),
    liquidationPrice: z.number().positive().optional()
}).strict();

const closedTradesOutputSchema = z.object({
    orderId: z.string().min(1),
    type: z.enum(["buy", "sell"]),
    margin: z.number().positive(),
    leverage: z.number().positive(),
    openPrice: z.number().positive(),
    closePrice: z.number().positive(),
    pnl: z.number()
}).strict();

export const orderSchema = {
    openInput: z.void(),
    getAllInput: z.void(),
    trade: tradesOutputSchema,
    closedTrade: closedTradesOutputSchema,
    openOutput: z.object({
        trades: z.array(tradesOutputSchema)
    }).strict(),
    getAllOutput: z.object({
        trades: z.array(closedTradesOutputSchema)
    }).strict()
}

// user-procedure validation
export const authSchema = {
    input: z.object({
        email: z.email( { message: "invalid email for sign-up procedure" } ),
        password: z.string()
        .min(8, {message: "password should be minimum of 8 charachters"})
        .max(24, {message: "password should be maximum of 24 charachters"})
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
            {
                message: "password must contain at least one upper-case letter, one lower-case letter, a number, and a special-character"
            }
        )
    }).strict(),

    output: z.object({
        userId: z.uuid()
    }).strict(),

    signinOutput: z.object({
        token: z.string().min(1)
    }).strict()

}