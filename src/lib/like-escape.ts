/**
 * Make a user-supplied value safe for Supabase `.ilike()` / `.like()` so it matches exactly
 * (case-insensitive) instead of acting as a pattern.
 *
 * Escapes the SQL wildcards `%` and `_` and the escape char `\`. PostgREST also treats `*`
 * as `%`, so `*` is turned into an escaped literal `%` — it can never act as a wildcard.
 * Without this, a coupon code of "%" or a checkout email like "*@gmail.com" could match
 * (and reveal or attach to) someone else's record.
 */
export function likeExact(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&").replace(/\*/g, "\\%")
}
