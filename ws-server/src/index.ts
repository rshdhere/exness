import { createClient } from "redis";
import { WebSocketServer, WebSocket } from "ws";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const wsPort = Number(process.env.WS_PORT ?? 8086);

const redis = createClient({
    url: redisUrl
});

const websocket = new WebSocketServer({
    port: wsPort
});

const client = new Map<WebSocket, Set<string>>();

export const Channels = ['SOL', 'ETH', 'BTC'];

const start = async () => {
    await redis.connect();
    console.log(`your ws-server is listening on ws://localhost:${wsPort}`);

    Channels.forEach((ch) => {
        redis.subscribe(ch, (data) => {
            client.forEach((symbs, ws: WebSocket) => {
                if (symbs.has(ch)) {
                    ws.send(data);
                }
            });
        });
    });

    websocket.on("connection", (ws: WebSocket) => {
        
        client.set(ws, new Set());

        ws.on("message", (msg) => {
            const message = JSON.parse(msg.toString());

            if (message.type === "SUBSCRIBE"){
                if (!client.has(ws)) {
                    client.set(ws, new Set());
                };
                const symbs = client.get(ws);
                symbs?.add(message.symbol)
            };

            if (message.type === "UNSUBSCRIBE"){
                const symbs = client.get(ws);
                symbs?.delete(message.symbol);

                if (symbs?.size === 0){
                    client.delete(ws)
                }
            }
        })
    })

};

start().catch(console.error);