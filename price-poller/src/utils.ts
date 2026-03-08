import type { Prisma } from "./generated/client";

export type TradeBatchItem = Prisma.TradeCreateManyInput;
export const BATCH_TIMMINGS = 10000; //ms