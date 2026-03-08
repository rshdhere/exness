import { createClient } from "redis";

async function main(){
    const redis = await createClient({
        url: "redis://redis_service:6379"
    }).connect();
}

main();