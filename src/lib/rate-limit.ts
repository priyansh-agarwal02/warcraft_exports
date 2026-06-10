type RateLimitEntry = { timestamps: number[] }

const store = new Map<string, RateLimitEntry>()

// Clean up entries older than 2 minutes every 5 minutes
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

/**
 * Sliding window rate limiter.
 * Returns true if the request is allowed, false if rate limited.
 * @param key - unique key (e.g. IP address)
 * @param limit - max requests per window
 * @param windowMs - window size in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
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
