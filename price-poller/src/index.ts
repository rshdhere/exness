import { createClient } from "redis";
import { saveTradeBatch } from "./db-ops";
import { BATCH_TIMMINGS, BINANCE_STREAMS, BINANCE_URL, toInternalPrice, type TradeBatchItem } from "./utils";
import { pushToRedis } from "./redis-ops";

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

    const ws = new WebSocket(BINANCE_URL);

    ws.addEventListener("open", () => {
        console.log('connected to the redis db stream of binance');
        ws.send(
          JSON.stringify({
            method: "SUBSCRIBE",
            params: BINANCE_STREAMS,
            id: 1,
          }),
        );
    });

    ws.addEventListener("message", (event) => {
        if (typeof event.data !== "string") {
            return;
        }

        const messages = JSON.parse(event.data);
        if (messages.e === "aggTrade"){
            const intPrice = toInternalPrice(messages.p);
            const intQty = toInternalPrice(messages.q);

            pushToRedis(redis, intPrice, messages.s, new Date(messages.T));

            tradeBatch.push({
                symbol: messages.s,
                price: intPrice,
                quantity: intQty,
                tradeId: BigInt(messages.a),
                timestamp: new Date(messages.T),
            });
        }
    });

    ws.addEventListener("error", (err) => {
        console.log("error from the websocket", err);
    });

    ws.addEventListener("close", () => {
        console.log("server is closed ");
        clearInterval(batchProcess);
        saveTradeBatch(tradeBatch);
    });

}

main();