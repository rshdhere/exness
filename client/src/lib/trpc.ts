import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../trpc-server/src/index";
import { getAuthToken } from "../lib/auth";

const TRPC_URL = import.meta.env.VITE_TRPC_URL ?? "/trpc";

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: TRPC_URL,
      headers() {
        const token = getAuthToken();
        if (!token) {
          return {};
        }

        return {
          authorization: `Bearer ${token}`,
        };
      },
    }),
  ],
});