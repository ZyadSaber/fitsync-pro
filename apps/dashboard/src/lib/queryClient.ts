import { QueryClient } from "@tanstack/react-query";

/**
 * Single shared QueryClient instance. Exported as a module singleton so that
 * client-side service modules (which run outside the React tree) can invalidate
 * queries after a mutation — the SPA replacement for Next.js `revalidatePath`.
 */
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});
