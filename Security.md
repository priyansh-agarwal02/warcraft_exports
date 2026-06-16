# 🔒 WARCRAFT EXPORTS — COMPREHENSIVE SECURITY AUDIT

> **Audited:** 2026-06-17  
> **Auditor Role:** Full-Stack Developer + Cyber Security Analyst + Manual QA Tester  
> **Scope:** All API routes, middleware, server actions, client components, payment flows, auth, admin panel, forms, data exposure

---

## 📊 SEVERITY LEGEND

| Severity | Meaning |
|----------|---------|
| 🔴 **CRITICAL** | Immediate exploitation risk — data breach, payment bypass, privilege escalation |
| 🟠 **HIGH** | Significant security gap — can be exploited with moderate effort |
| 🟡 **MEDIUM** | Needs fixing — poor practice, defense-in-depth failure |
| 🟢 **LOW** | Minor hygiene issue — best-practice improvement |

---

## 🔴 CRITICAL ISSUES

---

### C-01: Checkout Success Page — IDOR (Insecure Direct Object Reference)

**File:** `src/app/(store)/checkout/success/page.tsx` (Lines 42–47)  
**Severity:** 🔴 CRITICAL

**Problem:** The checkout success page takes an `order_id` from query params and fetches the full order using the **service client** (bypasses RLS) with **zero authentication check**. Anyone can view ANY order's full details (customer name, address, items, total) by guessing or iterating order UUIDs.

```typescript
// VULNERABLE: No auth check, uses service client
const serviceClient = createServiceClient()
const { data } = await serviceClient
  .from("orders")
  .select("id, order_number, total_usd, shipping_usd, created_at, customer_name, shipping_address, ...")
  .eq("id", order_id)
  .single()
```

**Attack vector:**  
- Visit `/checkout/success?order_id=<any-uuid>` → see full order details of ANY customer
- UUIDs are exposed in URLs after checkout, browser history, referrer headers

**FIX:**
```typescript
// Add authentication or order-ownership verification
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

// Option A: Require user match
const { data } = await serviceClient
  .from("orders")
  .select("...")
  .eq("id", order_id)
  .eq("user_id", user?.id ?? "impossible-id")
  .single()

// Option B: Require a one-time token passed from checkout
// Generate a secure token when order is created, pass it as query param,
// and verify it matches before showing details
```

---

### C-02: Admin Dashboard API — MISSING Authentication

**File:** `src/app/api/admin/dashboard/route.ts` (Lines 43–251)  
**Severity:** 🔴 CRITICAL

**Problem:** The dashboard API returns sensitive business data (total revenue, all orders, customer counts, latest orders with emails, low stock products, coupon codes, wholesale inquiries) but has **NO `requireAdmin()` call**. Any unauthenticated user can access this endpoint.

```typescript
// MISSING: No requireAdmin() check!
export async function GET(request: NextRequest) {
  // ... proceeds to fetch all business data using service client
}
```

**Attack vector:** `GET /api/admin/dashboard` → full business intelligence data exposed

**FIX:**
```typescript
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  // ... rest of handler
}
```

---

### C-03: Admin Analytics API — MISSING Authentication

**File:** `src/app/api/admin/analytics/route.ts` (Lines 10–251)  
**Severity:** 🔴 CRITICAL

**Problem:** Same as C-02 — no `requireAdmin()` check. Exposes PostHog analytics data including pageviews, top pages, referrers, and visitor metrics to unauthenticated requests.

**FIX:** Add `requireAdmin()` at the start of the `GET` handler.

---

### C-04: Welcome Email API — No Rate Limiting, No Auth, Email Abuse Vector

**File:** `src/app/api/auth/welcome/route.ts` (Lines 4–13)  
**Severity:** 🔴 CRITICAL

**Problem:** This endpoint accepts arbitrary `name` + `email` and sends a welcome email with **no authentication, no rate limiting, no CAPTCHA**. An attacker can:
1. **Spam any email address** with welcome emails (email bombing)
2. **Use your domain for phishing** by sending crafted emails from your verified sender

**FIX:**
```typescript
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!checkRateLimit(`welcome:${ip}`, 3, 3600_000)) {
    return NextResponse.json({ ok: false }, { status: 429 })
  }

  // Also validate that the email belongs to a recently-created user
  // by checking Supabase auth or using a signed token
}
```

---

### C-05: Coupon Race Condition — Times Used Not Atomic

**File:** `src/app/api/orders/route.ts` (Lines 327–350)  
**Severity:** 🔴 CRITICAL

**Problem:** The coupon usage increment is a **read-then-write** (non-atomic) operation. Multiple concurrent checkouts can read the same `times_used` value and all succeed, effectively bypassing the usage limit.

```typescript
// NON-ATOMIC: Race condition
const { data: currCoupon } = await serviceClient
  .from("coupons")
  .select("times_used")
  .eq("id", couponId)
  .single()

await serviceClient
  .from("coupons")
  .update({ times_used: (currCoupon?.times_used ?? 0) + 1 })
  .eq("id", couponId)
```

**FIX:** Use a Supabase RPC (SQL function) with atomic increment:
```sql
-- Create in supabase/ folder
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_uuid UUID)
RETURNS VOID AS $$
  UPDATE coupons
  SET times_used = COALESCE(times_used, 0) + 1
  WHERE id = coupon_uuid;
$$ LANGUAGE sql;
```
Then call:
```typescript
await serviceClient.rpc("increment_coupon_usage", { coupon_uuid: couponId })
```

---

### C-06: Product Image Insert — Client-Side Supabase Direct REST Call with ANON KEY

**File:** `src/components/admin/product-edit-form.tsx` (Lines 144–158)  
**Severity:** 🔴 CRITICAL

**Problem:** When adding a product image, the admin form makes a **direct REST API call to Supabase** from the browser using the **anon key**, bypassing the server-side admin auth entirely. If RLS on `product_images` is not tightly configured, any authenticated user could insert images. Additionally, this **exposes the raw Supabase REST endpoint pattern** in the browser.

```typescript
// CLIENT-SIDE: Direct Supabase REST call from browser
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
await fetch(`${SUPABASE_URL}/rest/v1/product_images`, {
  method: "POST",
  headers: { "apikey": ANON_KEY, "Content-Type": "application/json" },
  body: JSON.stringify([...]),
})
```

**FIX:** Route this through the existing `/api/admin/products` API endpoint which already has `requireAdmin()` protection.

---

## 🟠 HIGH ISSUES

---

### H-01: No Per-User Coupon Limit — Same User Can Reuse Coupons Unlimited Times

**File:** `src/app/api/orders/route.ts` (Lines 126–145) & `src/app/actions/coupon.ts`  
**Severity:** 🟠 HIGH

**Problem:** Coupon validation only checks global `usage_limit` and `times_used`. There is no check to see if the **same user/email** has already used this coupon. A customer can apply the same coupon on every order.

**FIX:** Query `coupon_uses` table to check if the current user/email already used this coupon:
```typescript
if (orderUserId || customer.email) {
  const { count } = await serviceClient
    .from("coupon_uses")
    .select("id", { count: "exact", head: true })
    .eq("coupon_id", couponId)
    .or(`user_id.eq.${orderUserId},order_id.in.(SELECT id FROM orders WHERE customer_email='${customer.email}')`)
  if (count && count > 0) {
    return NextResponse.json({ error: "You have already used this coupon." }, { status: 400 })
  }
}
```

---

### H-02: Order API — No Payment Verification Before Order Creation

**File:** `src/app/api/orders/route.ts` (Lines 9–382)  
**Severity:** 🟠 HIGH

**Problem:** The orders API accepts a `status` field directly from the client request body (`status = "confirmed"`). There is no server-side verification that payment was actually completed. The `handleSubmit` function in the checkout form (COD path) creates an order without any payment at all.

```typescript
// Client can set status to anything
const { status = "confirmed" } = body
```

**Attack vector:** 
- Send a direct POST to `/api/orders` with `status: "confirmed"` and no payment info
- Order is created and confirmation email is sent without any payment

**FIX:**
1. Remove the `status` field from client-accepted input — always default to `"pending"` unless payment is verified
2. Only set `status: "confirmed"` when `paymentIntentId` is present AND verified server-side
3. If COD is intentional, require admin approval or add a `payment_pending` status

---

### H-03: `getSession()` Used Instead of `getUser()` in Auth Action

**File:** `src/app/actions/auth.ts` (Line 21)  
**Severity:** 🟠 HIGH

**Problem:** The `getUserProfile` server action uses `getSession()` which reads from cookies/local storage and **can be spoofed**. Supabase explicitly recommends using `getUser()` for server-side authentication as it validates the JWT against the auth server.

```typescript
// INSECURE: getSession() is not server-verified
const { data: { session } } = await supabaseSession.auth.getSession()
```

**FIX:**
```typescript
const { data: { user } } = await supabaseSession.auth.getUser()
if (!user?.id) return null
```

---

### H-04: Admin Products API — No Input Sanitization on Body Fields

**File:** `src/app/api/admin/products/route.ts` (Lines 16–91)  
**Severity:** 🟠 HIGH

**Problem:** The POST and PATCH handlers accept arbitrary JSON and pass it directly through to Supabase REST API without any schema validation or field whitelisting. An attacker with admin access could potentially inject unexpected fields.

**FIX:** Define an explicit allowlist of fields and validate types before passing to Supabase.

---

### H-05: In-Memory Rate Limiting — Resets on Deploy, Not Distributed

**File:** `src/lib/rate-limit.ts` (Lines 1–42)  
**Severity:** 🟠 HIGH

**Problem:** The rate limiter uses an in-memory `Map`. On Vercel's serverless environment:
- Each function invocation may use a different instance → rate limits are per-instance, not per-user
- Redeployment resets all limits
- Multiple concurrent function containers won't share state

**Attack:** An attacker can bypass rate limits by making requests that hit different serverless instances.

**FIX:** Use an external store like **Upstash Redis** or Vercel KV for distributed rate limiting.

---

### H-06: Track Order — Information Leakage via Brute Force

**File:** `src/app/(store)/track-order/page.tsx` (Lines 12–21)  
**Severity:** 🟠 HIGH

**Problem:** Track order requires only `order_number` + `email`. Order numbers follow a predictable pattern (`WE-{base36_timestamp}`). An attacker who knows a customer's email could brute-force order numbers. No rate limiting, no CAPTCHA.

Also exposes a link to `/account/orders/${order.id}` which reveals the internal UUID.

**FIX:**
1. Add rate limiting on the track order form (max 5 attempts per IP per hour)
2. Add a CAPTCHA for guest tracking
3. Don't expose the internal order UUID — use order_number for the details link

---

### H-07: Debug/Test Scripts Committed to Repository

**Files:** `check-orders.js`, `check-user.js`, `check-tables.js`, `check-rendered-html.js`, `reset-admin-creds.js`, `test-admin-login-and-patch.js`, `test-api-endpoint.js`, etc.  
**Severity:** 🟠 HIGH

**Problem:** Multiple debug/test scripts are present in the project root that use the **Supabase Service Role Key** to directly access the database. While `.gitignore` has `*.js`, these files:
1. Reveal the database schema and admin operations
2. Show patterns that could be used against the system
3. `reset-admin-creds.js` is particularly dangerous if it contains admin credential reset logic
4. If accidentally deployed (e.g., via a misconfigured build), they expose critical secrets

**FIX:** Move all test scripts to a `scripts/` directory (already exists) and ensure they're never deployed. Better yet, delete them from the project root and use proper testing tools.

---

## 🟡 MEDIUM ISSUES

---

### M-01: No Email Validation on Checkout Form (Client-Side)

**File:** `src/components/checkout/checkout-form.tsx` (Lines 162–178)  
**Severity:** 🟡 MEDIUM

**Problem:** The checkout form `validateForm()` only checks if `email.trim()` is non-empty. It does not validate the email format. Users can enter `abc` as an email and the order will be created.

**FIX:**
```typescript
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!EMAIL_RE.test(form.email.trim())) {
  setError("Please enter a valid email address.")
  return false
}
```

Also add server-side email validation in the orders API.

---

### M-02: No Phone Number Validation — Accepts Alphabetic Characters

**File:** `src/components/checkout/checkout-form.tsx` (Line 276)  
**Severity:** 🟡 MEDIUM

**Problem:** The phone field uses `type="tel"` but has no pattern validation. Users can enter alphabetic characters, emojis, or any string as a phone number. No server-side validation either.

**FIX:**
```typescript
// Client-side
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/
if (!PHONE_RE.test(form.phone.trim())) {
  setError("Please enter a valid phone number with country code.")
  return false
}

// Server-side in orders API
if (customer.phone && !/^\+?[\d\s\-().]{7,20}$/.test(customer.phone)) {
  return NextResponse.json({ error: "Invalid phone number" }, { status: 400 })
}
```

---

### M-03: No Postal Code Validation

**File:** `src/components/checkout/checkout-form.tsx` (Line 341)  
**Severity:** 🟡 MEDIUM

**Problem:** Postal code accepts any string with no format validation. Should validate based on country (e.g., US ZIP: 5 digits, UK: alphanumeric pattern).

**FIX:** At minimum, validate length (3–10 chars) and alphanumeric-only characters.

---

### M-04: No `maxLength` on Text Inputs — Potential DoS

**File:** `src/components/checkout/checkout-form.tsx`, `src/components/contact/contact-form.tsx`, `src/components/wholesale/wholesale-form.tsx`  
**Severity:** 🟡 MEDIUM

**Problem:** No `maxLength` attribute on any text input fields. A malicious user could submit extremely long strings (megabytes) in the name, address, notes, or message fields, causing:
- Database storage abuse
- Email rendering issues
- Potential denial of service

**FIX:** Add `maxLength` attributes to all inputs:
- Name: 100
- Email: 254
- Phone: 20
- Address lines: 200
- City/State: 100
- Notes/Message: 2000
- Also validate lengths server-side.

---

### M-05: Order Notes — No XSS Sanitization

**File:** `src/app/api/orders/route.ts` (Lines 244–247)  
**Severity:** 🟡 MEDIUM

**Problem:** Customer notes are stored in the database and displayed in the admin panel without sanitization. If notes contain `<script>` tags or HTML, it could execute when rendered in the admin dashboard (Stored XSS).

**FIX:** Sanitize the notes field server-side:
```typescript
const sanitizedNotes = customer.notes?.replace(/<[^>]*>/g, '').slice(0, 2000) || ""
```

---

### M-06: Contact Form — No Rate Limiting

**File:** `src/components/contact/contact-form.tsx`  
**Severity:** 🟡 MEDIUM

**Problem:** The contact form has no rate limiting on the server-side action. An attacker could spam the contact form, flooding the inbox with spam messages. The `onSubmit` prop function is expected to handle this, but there's no visible rate limiting.

**FIX:** Add rate limiting in the contact form server action.

---

### M-07: Wholesale Form — No Rate Limiting

**File:** `src/components/wholesale/wholesale-form.tsx`  
**Severity:** 🟡 MEDIUM

**Problem:** Same as M-06 — no rate limiting on wholesale inquiry submission.

---

### M-08: Admin Layout — Client-Side Only, No Server Auth Guard

**File:** `src/app/admin/layout.tsx`  
**Severity:** 🟡 MEDIUM

**Problem:** The admin layout is a `"use client"` component with no server-side authentication check. While the middleware protects admin routes, the layout itself doesn't verify admin status. If middleware is ever bypassed or misconfigured, the admin UI renders for non-admins.

**Note:** The middleware DOES protect this route, so this is defense-in-depth, not a standalone vulnerability.

**FIX:** Consider making the admin layout a server component with a `requireAdmin()` check, or add a client-side auth verification.

---

### M-09: `unsafe-inline` and `unsafe-eval` in CSP

**File:** `next.config.ts` (Line 38)  
**Severity:** 🟡 MEDIUM

**Problem:** The Content Security Policy includes `'unsafe-inline'` and `'unsafe-eval'` for scripts, which significantly weakens XSS protection. This is often necessary for Next.js/React frameworks but should be tightened.

**FIX:** Use nonce-based CSP for scripts instead of `unsafe-inline`. Next.js 13+ supports `nonce` via middleware. At minimum, remove `unsafe-eval` if not strictly needed.

---

### M-10: Verbose Console Logging of Sensitive Data

**File:** `src/middleware.ts` (Lines 186, 203, 209, 216)  
**Severity:** 🟡 MEDIUM

**Problem:** The middleware logs user emails and roles to the console in production. On Vercel, these logs are visible in the dashboard and could expose PII.

```typescript
console.log("[MIDDLEWARE] User:", user ? user.email : "none")
console.log("[MIDDLEWARE] Profile query result:", profile, "Error: none")
```

**FIX:** Remove or conditionalize these logs behind a `NODE_ENV !== 'production'` check.

---

### M-11: Honeypot Field Returns Fake Success — Potential for Data Loss

**File:** `src/app/api/orders/route.ts` (Lines 40–42)  
**Severity:** 🟡 MEDIUM

**Problem:** If the honeypot field is filled (by a bot), the API returns a fake success response. However, the checkout form's `handlePaymentSuccess` flow uses this response. If a legitimate user somehow triggers the honeypot (e.g., autofill), they'll think the order was placed but it wasn't, AND their payment was already captured.

```typescript
if (customer?.honeypot) {
  return NextResponse.json({ orderId: "ok", orderNumber: "WE-OK" })
}
```

**FIX:** The honeypot field in the form has `readOnly value=""` which is good, but consider returning a `202 Accepted` with a delay instead of a fake success. Also, ensure payment is NOT captured before order creation.

---

### M-12: PayPal Order ID — No Validation Before Capture

**File:** `src/app/api/payment/paypal/capture/route.ts` (Line 46)  
**Severity:** 🟡 MEDIUM

**Problem:** The `paypalOrderId` from the client is used directly in the capture URL without format validation. While PayPal's API will reject invalid IDs, it's a best practice to validate the format before making external API calls.

**FIX:** Validate that `paypalOrderId` matches PayPal's order ID format (alphanumeric, ~17 chars).

---

### M-13: Missing CSRF Protection on Signout Form

**File:** `src/app/(store)/account/page.tsx` (Line 107)  
**Severity:** 🟡 MEDIUM

**Problem:** The sign-out form uses `action="/auth/signout" method="POST"` without a CSRF token. An attacker could create a page that auto-submits a POST to `/auth/signout`, logging the user out.

**FIX:** Add CSRF token validation or use a server action instead of a form action.

---

## 🟢 LOW ISSUES

---

### L-01: `X-Frame-Options` Conflict — DENY vs SAMEORIGIN

**File:** `next.config.ts` (Line 19) vs `src/middleware.ts` (Line 223)  
**Severity:** 🟢 LOW

**Problem:** The Next.js config sets `X-Frame-Options: DENY` but the middleware sets `X-Frame-Options: SAMEORIGIN`. The middleware value will override the config value. These should be consistent.

**FIX:** Choose one (DENY is more secure unless you need same-origin iframes) and remove the duplicate.

---

### L-02: Razorpay Key ID Fallback to NEXT_PUBLIC

**File:** `src/app/api/payment/razorpay/create-order/route.ts` (Line 31)  
**Severity:** 🟢 LOW

**Problem:** 
```typescript
const KEY_ID = process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
```
Falls back to the `NEXT_PUBLIC_` version, which is exposed to the client. While Razorpay Key ID is a public key, the fallback pattern could be confusing and suggests inconsistent env var management.

**FIX:** Use one consistent env var name: `RAZORPAY_KEY_ID` (server-side only).

---

### L-03: Cart Data Stored in localStorage — Tamperable

**File:** `src/lib/cart.ts` (Lines 107–109)  
**Severity:** 🟢 LOW

**Problem:** Cart data including `priceUsd` is persisted in localStorage via Zustand. While the server recalculates prices (which is good!), a user could manipulate `maxQuantity` in localStorage to add more items than stock allows.

**Status:** Partially mitigated by server-side price recalculation (Line 64–118 of orders API).

**FIX:** Add server-side stock quantity validation in the orders API:
```typescript
if (qty > (product.stock_quantity ?? 999)) {
  return NextResponse.json({ error: `Not enough stock for ${product.name}` }, { status: 400 })
}
```

---

### L-04: No `rel="noopener noreferrer"` on Some External Links

**File:** Various components  
**Severity:** 🟢 LOW

**Problem:** Some links that open in new tabs may be missing `rel="noopener noreferrer"`. Modern browsers handle this automatically for `target="_blank"`, but it's still best practice.

---

### L-05: Missing `autocomplete="off"` on Sensitive Admin Forms

**File:** `src/components/admin/product-edit-form.tsx`  
**Severity:** 🟢 LOW

**Problem:** Admin form fields for SKU, price, etc., don't have `autocomplete="off"`, allowing browsers to cache sensitive product data.

---

### L-06: Shipping Rates API — No Auth, Returns All Rates

**File:** `src/app/api/shipping-rates/route.ts`  
**Severity:** 🟢 LOW

**Problem:** Returns all shipping rates publicly. While this data isn't sensitive, it could be used to understand business pricing strategies.

---

### L-07: Register Form — Weak Password Policy

**File:** `src/components/auth/register-form.tsx` (Line 25)  
**Severity:** 🟢 LOW

**Problem:** Password requirement is only 6 characters minimum with no complexity requirements (no uppercase, number, or special character requirement).

**FIX:** Enforce stronger passwords:
```typescript
if (password.length < 8) {
  setError("Password must be at least 8 characters.")
  return
}
if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
  setError("Password must contain at least one uppercase letter and one number.")
  return
}
```

---

### L-08: Newsletter Subscribe — Duplicate Rate Limiter

**File:** `src/app/api/newsletter/subscribe/route.ts` (Lines 10–22)  
**Severity:** 🟢 LOW

**Problem:** This file implements its own in-memory rate limiter instead of using the shared `checkRateLimit` from `@/lib/rate-limit`. Code duplication leads to inconsistent behavior.

**FIX:** Use the shared rate limiter:
```typescript
import { checkRateLimit } from "@/lib/rate-limit"
// Replace local implementation
```

---

### L-09: `page.tsx.backup` File in Admin Directory

**File:** `src/app/admin/page.tsx.backup`  
**Severity:** 🟢 LOW

**Problem:** Backup file left in the codebase. While not directly exploitable, it may contain outdated code patterns and clutters the project.

**FIX:** Delete the backup file.

---

## 🏗️ ARCHITECTURE OBSERVATIONS

---

### A-01: No CAPTCHA on Any Public Form

**Affected:** Contact form, wholesale form, newsletter subscribe, track order, register  
**Recommendation:** Add reCAPTCHA v3 or Turnstile (Cloudflare) to all public-facing forms.

---

### A-02: No Audit Log for Admin Actions

**Observation:** Admin actions (product create/update/delete, order status change) have no audit logging. If an admin account is compromised, there's no trail.

**Recommendation:** Log all admin mutations to an `admin_activity_log` table with user_id, action, entity, timestamp.

---

### A-03: No Account Lockout After Failed Login Attempts

**Observation:** No mechanism to lock accounts after repeated failed login attempts. Supabase handles this partially, but no additional protection exists.

---

### A-04: Session Management — No Explicit Session Expiry or Rotation

**Observation:** No custom session timeout or rotation logic. Relies entirely on Supabase defaults.

---

### A-05: Missing `Permissions-Policy: payment=()` Conflict

**File:** `next.config.ts` (Line 25)

**Problem:** The Permissions-Policy header includes `payment=()` which explicitly disables the Payment Request API. However, the site uses Razorpay and PayPal which may benefit from the Payment Request API. Consider removing `payment=()` if you want to support browser-native payment flows.

---

## ✅ WHAT'S ALREADY DONE WELL

| Feature | Status | Notes |
|---------|--------|-------|
| Server-side price recalculation | ✅ Excellent | Never trusts client prices (orders API) |
| Razorpay HMAC signature verification | ✅ Good | Proper crypto verification |
| Rate limiting on critical APIs | ✅ Good | Present on orders, chat, payments, newsletter |
| Admin route middleware protection | ✅ Good | Middleware checks role from profiles table |
| Security headers (CSP, HSTS, X-Frame) | ✅ Good | Comprehensive header configuration |
| Honeypot spam protection | ✅ Good | Silent bot rejection |
| UUID validation on product IDs | ✅ Good | Regex validation before DB queries |
| Prompt injection protection on chat | ✅ Good | Pattern matching for injection attempts |
| Service role key server-side only | ✅ Good | Never exposed via NEXT_PUBLIC |
| `.env.local` in `.gitignore` | ✅ Good | Env files properly ignored |
| Account pages auth-gated | ✅ Good | Middleware redirects unauthenticated users |
| Order detail page — user_id filter | ✅ Good | `.eq("user_id", user.id)` prevents IDOR |
| Addresses API — auth-gated | ✅ Good | Checks user before returning addresses |

---

## 📋 PRIORITY FIX ORDER

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 1 | C-01: Checkout success IDOR | 🔴 CRITICAL | Small |
| 2 | C-02: Admin dashboard missing auth | 🔴 CRITICAL | Small |
| 3 | C-03: Admin analytics missing auth | 🔴 CRITICAL | Small |
| 4 | C-04: Welcome email abuse | 🔴 CRITICAL | Small |
| 5 | C-06: Product image direct Supabase call | 🔴 CRITICAL | Medium |
| 6 | H-02: Order status from client | 🟠 HIGH | Small |
| 7 | H-03: getSession → getUser | 🟠 HIGH | Small |
| 8 | C-05: Coupon race condition | 🔴 CRITICAL | Medium |
| 9 | M-01: Email validation | 🟡 MEDIUM | Small |
| 10 | M-02: Phone validation | 🟡 MEDIUM | Small |
| 11 | H-07: Debug scripts cleanup | 🟠 HIGH | Small |
| 12 | H-05: Distributed rate limiting | 🟠 HIGH | Medium |
| 13 | M-10: Remove verbose logging | 🟡 MEDIUM | Small |
| 14 | M-04: Add maxLength to inputs | 🟡 MEDIUM | Small |
| 15 | M-05: XSS sanitization on notes | 🟡 MEDIUM | Small |

---

> **Next Step:** Review this document and approve which fixes to implement. I will then execute the fixes in priority order with surgical, minimal changes.
