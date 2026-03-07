import { privateProcedure, router } from "../../trpc";

export const tradeRouter = router({
    open: privateProcedure
    .input()
    .output()
    .mutation(),

    close: privateProcedure
    .input()
    .output()
    .mutation()
})