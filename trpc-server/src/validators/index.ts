import { z } from "zod";

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