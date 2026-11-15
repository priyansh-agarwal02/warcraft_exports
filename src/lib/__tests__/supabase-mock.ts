// Minimal chainable Supabase query mock for unit tests.
// Every builder method returns the builder; awaiting it (or .single/.maybeSingle) resolves
// with whatever the test configured for that table via `results[table]`.
import { vi } from "vitest"

export type MockResult = { data?: unknown; error?: unknown; count?: number | null }
export type Call = { table: string; method: string; args: unknown[] }

export function createSupabaseMock(results: Record<string, MockResult | ((calls: Call[]) => MockResult)>) {
  const calls: Call[] = []
  const inserts: { table: string; row: unknown }[] = []

  function builder(table: string) {
    const own: Call[] = []
    const resolve = () => {
      const r = results[table]
      const out = typeof r === "function" ? r(own) : r
      return Promise.resolve({ data: null, error: null, count: null, ...(out ?? {}) })
    }
    const b: Record<string, unknown> = {}
    for (const m of ["select", "eq", "in", "ilike", "is", "order", "limit", "update", "upsert", "delete", "or", "gt"]) {
      b[m] = (...args: unknown[]) => {
        const c = { table, method: m, args }
        calls.push(c)
        own.push(c)
        return b
      }
    }
    b.insert = (row: unknown) => {
      inserts.push({ table, row })
      const c = { table, method: "insert", args: [row] }
      calls.push(c)
      own.push(c)
      return b
    }
    b.single = () => resolve()
    b.maybeSingle = () => resolve()
    b.then = (onF: (v: unknown) => unknown, onR?: (e: unknown) => unknown) => resolve().then(onF, onR)
    return b
  }

  const client = {
    from: vi.fn((table: string) => builder(table)),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null } })),
      admin: {
        listUsers: vi.fn(() => Promise.resolve({ data: { users: [] }, error: null })),
        createUser: vi.fn(() => Promise.resolve({ data: { user: { id: "11111111-1111-4111-8111-111111111111" } }, error: null })),
      },
    },
  }
  return { client, calls, inserts }
}
