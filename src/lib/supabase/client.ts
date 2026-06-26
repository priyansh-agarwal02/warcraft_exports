import { createBrowserClient } from "@supabase/ssr";

let clientInstance: any = null;

export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (typeof window === "undefined") {
    return client;
  }

  if (!clientInstance) {
    clientInstance = client;
  }

  return clientInstance as typeof client;
}
