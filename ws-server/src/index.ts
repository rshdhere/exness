import { createClient } from "redis";
import { WebSocketServer, WebSocket } from "ws";

const redis = createClient({
    url: "redis://redis_service:6379"
});

const websocket = new WebSocketServer({
    port: 8086
});

const client = new Map<WebSocket, Set<string>>();

export const Channels = ['SOL', 'ETH', 'BTC'];