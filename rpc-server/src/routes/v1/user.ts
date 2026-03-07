import { publicProcedure, router } from "../../trpc";
import { authSchema } from "../../validators";

export const userRouter = router({
    signup: publicProcedure
    .input(authSchema.input)
    .output(authSchema.output)
    .mutation(),

    signin: publicProcedure
    .input(authSchema.input)
    .output(authSchema.signinOutput)
    .mutation()
})