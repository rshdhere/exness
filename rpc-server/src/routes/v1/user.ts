import { v5 } from "uuid";
import { publicProcedure, router } from "../../trpc";
import { authSchema } from "../../validators";
import { PLACEHOLDER } from "../../config/config";
import { USERS } from "../../data/data";
import { TRPCError } from "@trpc/server";
import { toInternalUSD } from "../../utils/utils";

export const userRouter = router({
    signup: publicProcedure
    .input(authSchema.input)
    .output(authSchema.output)
    .mutation(( { input } ) => {
        const uuid = v5(input.email, PLACEHOLDER);

        if (USERS[uuid]){
            throw new TRPCError({
                code: "CONFLICT",
                message: "user already exists try sign-in"
            })
        };

        USERS[uuid] = {
            email: input.email,
            password: input.password,
            balance: {
                usd_balance: toInternalUSD(50000)
            },
            asset: {}
        }

        return {
            userId: uuid
        }
    }),

    signin: publicProcedure
    .input(authSchema.input)
    .output(authSchema.signinOutput)
    .mutation()
})