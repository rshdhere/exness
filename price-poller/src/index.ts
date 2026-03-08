import { createClient } from "redis";
import { saveTradeBatch } from "./db-ops";
import { BATCH_TIMMINGS, type TradeBatchItem } from "./utils";

let tradeBatch: TradeBatchItem[] = [];

async function main(){
    const redis = await createClient({
        url: "redis://redis_service:6379"
    }).connect();

    console.log('connected to redis successfully');

    const batchProcess = setInterval(() => {
        const batchSave = [...tradeBatch];
        tradeBatch = [];
        saveTradeBatch(batchSave)
    }, BATCH_TIMMINGS);

}

main();