import { privateProcedure, router } from "../../trpc";

export const assetRouter = router({
    getAll: privateProcedure
    .output()
    .query()
});