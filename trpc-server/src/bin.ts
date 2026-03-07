import { app } from ".";
import { BACKEND_PORT } from "./config/config";

app.listen(BACKEND_PORT, () => {
    console.log(`your trpc-server is listening on http://localhost:${BACKEND_PORT}`)
})