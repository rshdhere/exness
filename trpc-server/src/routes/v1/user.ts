import { v5 } from "uuid";
import { publicProcedure, router } from "../../trpc";
import { authSchema } from "../../validators";
import { JWT_SECRET, PLACEHOLDER } from "../../config/config";
import { USERS } from "../../data/data";
import { TRPCError } from "@trpc/server";
import { toInternalUSD } from "../../utils/utils";
import jwt from "jsonwebtoken";

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
    .mutation(( { input } ) => {
        const uuid = v5(input.email, PLACEHOLDER);

        if (!USERS[uuid]){
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "user was not found in-memory"
            })
        };

        if (USERS[uuid].password !== input.password) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "password do not match"
            })
        };

        if (!JWT_SECRET) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "JWT_SECRET went missing"
            })
        };

        const token = jwt.sign({
            userId: uuid
        }, JWT_SECRET, {
            expiresIn: "1h"
        });

        return {
            token
        }
    })
})