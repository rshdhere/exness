import express from "express";
import { userRouter } from "./routes/v1/user";
import { router } from "./trpc";

export const appRouter = router({
    v1: router({
        user: userRouter
    })
});

export type AppRouter = typeof appRouter;

const app = express();

app.use(express.json());