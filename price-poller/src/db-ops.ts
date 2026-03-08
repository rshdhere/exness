import type { TradeBatchItem } from "./utils";

export async function saveTradeBatch(tradeBatch: TradeBatchItem[]){
    if (tradeBatch.length === 0){
        return;
    };

    const response = await prisma.trade.createMany({
        data: tradeBatch,
        skipDuplicates: true
    });

    console.log("updated the batch :" + response.count);
}