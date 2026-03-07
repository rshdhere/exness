import { v5 } from "uuid";
import { publicProcedure, router } from "../../trpc";
import { authSchema } from "../../validators";
import { PLACEHOLDER } from "../../config/config";

export const userRouter = router({
    signup: publicProcedure
    .input(authSchema.input)
    .output(authSchema.output)
    .mutation(( { input } ) => {
        const uuid = v5(input.email, PLACEHOLDER);
    }),

    signin: publicProcedure
    .input(authSchema.input)
    .output(authSchema.signinOutput)
    .mutation()
})