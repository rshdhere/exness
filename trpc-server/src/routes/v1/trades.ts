import { privateProcedure, router } from "../../trpc";

export const tradesRouter = router({
    open: privateProcedure
    .input()
    .output()
    .mutation(),

    getAll: privateProcedure
    .output()
    .query()
})