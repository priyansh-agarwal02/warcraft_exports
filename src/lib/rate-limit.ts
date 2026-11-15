import { createServiceClient } from "@/lib/supabase/service"

/**
 * Rate limiting.
 *
 * Primary: a shared counter in Supabase (`check_rate_limit` function, migration 024).
 * Vercel runs many short-lived server instances, so an in-memory counter alone resets
 * whenever a new instance starts — the database counter holds across all of them.
 *
 * Fallback: the original in-memory sliding window, used automatically if the database
 * function is missing or unreachable, so a database problem never blocks real customers.
 */

type RateLimitEntry = { timestamps: number[] }
const store = new Map<string, RateLimitEntry>()
let cleanupScheduled = false

function scheduleCleanup() {
  if (cleanupScheduled) return
  cleanupScheduled = true
  setInterval(() => {
    const cutoff = Date.now() - 120_000
    for (const [key, entry] of store.entries()) {
      entry.timestamps = entry.timestamps.filter((t) => t > cutoff)
      if (entry.timestamps.length === 0) store.delete(key)
    }
  }, 300_000)
}

function checkRateLimitMemory(key: string, limit: number, windowMs: number): boolean {
  scheduleCleanup()
  const now = Date.now()
  const cutoff = now - windowMs
  const entry = store.get(key) ?? { timestamps: [] }
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff)

  if (entry.timestamps.length >= limit) {
    store.set(key, entry)
    return false
  }

  entry.timestamps.push(now)
  store.set(key, entry)
  return true
}

// If the database function is unavailable, skip it for a few minutes instead of retrying every request.
let dbUnavailableUntil = 0

/**
 * Returns true if the request is allowed, false if rate limited.
 * @param key - unique key (e.g. "orders:<ip>")
 * @param limit - max requests per window
 * @param windowMs - window size in milliseconds
 */
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  // The in-memory check always runs: it stops bursts on a single instance even when the DB is fine.
  const memoryAllowed = checkRateLimitMemory(key, limit, windowMs)
  if (!memoryAllowed) return false

  if (Date.now() < dbUnavailableUntil || !process.env.SUPABASE_SERVICE_ROLE_KEY) return true

  try {
    const { data, error } = await createServiceClient().rpc("check_rate_limit", {
      p_key: key.slice(0, 200),
      p_limit: limit,
      p_window_seconds: Math.max(1, Math.round(windowMs / 1000)),
    })
    if (error || typeof data !== "boolean") {
      dbUnavailableUntil = Date.now() + 5 * 60_000
      return true
    }
    return data
  } catch {
    dbUnavailableUntil = Date.now() + 5 * 60_000
    return true
  }
}
