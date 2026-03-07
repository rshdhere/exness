import { publicProcedure, router } from "../../trpc";

export const userRouter = router({
    signup: publicProcedure
    .input()
    .output()
    .mutation(),

    signin: publicProcedure
    .input()
    .output()
    .mutation()
})