// Server-only helpers shared by the payment routes and /api/orders.

export function isLiveEnvironment(): boolean {
  return (
    process.env.VERCEL_ENV === "production" ||
    (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_APP_URL?.includes("localhost"))
  )
}

// ── Exchange rates ────────────────────────────────────────────────
// Returns null when the rate is unknown. Callers must NOT fall back to 1,
// otherwise a USD amount would be charged as the same number of rupees/yen.
export async function getUsdRate(currency: string): Promise<number | null> {
  const cur = currency.toUpperCase()
  if (cur === "USD") return 1
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { rates?: Record<string, number> }
    const rate = data.rates?.[cur]
    return typeof rate === "number" && rate > 0 ? rate : null
  } catch {
    return null
  }
}

// ── PayPal ────────────────────────────────────────────────────────
export const PAYPAL_ZERO_DECIMAL = new Set(["JPY", "HUF", "TWD"])

export function getPayPalBaseUrl(): string {
  if (process.env.PAYPAL_API_URL) return process.env.PAYPAL_API_URL
  return isLiveEnvironment() ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com"
}

// "auth" = PayPal rejected our credentials (or none configured): no customer can have paid through
// a broken account, so verification must refuse. "network" = PayPal unreachable / erroring: a real
// customer may have paid, so the order is kept for review.
type PayPalToken = { token: string } | { error: "auth" | "network" }

async function getPayPalTokenDetailed(): Promise<PayPalToken> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !clientSecret) return { error: "auth" }
  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
    const res = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
      method: "POST",
      headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials",
      cache: "no-store",
    })
    if (res.status === 400 || res.status === 401 || res.status === 403) return { error: "auth" }
    if (!res.ok) return { error: "network" }
    const data = (await res.json()) as { access_token?: string }
    return data.access_token ? { token: data.access_token } : { error: "network" }
  } catch {
    return { error: "network" }
  }
}

export async function getPayPalAccessToken(): Promise<string | null> {
  const t = await getPayPalTokenDetailed()
  return "token" in t ? t.token : null
}

async function paypalTokenOrFailure(): Promise<{ token: string } | { failure: VerifiedPayment }> {
  const t = await getPayPalTokenDetailed()
  if ("token" in t) return t
  return t.error === "auth"
    ? { failure: { status: "not_paid", reason: "PayPal rejected the store's credentials" } }
    : { failure: { status: "unverifiable", reason: "PayPal unreachable" } }
}

// ── Razorpay ──────────────────────────────────────────────────────
const RAZORPAY_ZERO_DECIMAL = new Set(["JPY"])

export function toRazorpaySmallestUnit(amount: number, currency: string): number {
  return RAZORPAY_ZERO_DECIMAL.has(currency.toUpperCase()) ? Math.round(amount) : Math.round(amount * 100)
}
export function fromRazorpaySmallestUnit(amount: number, currency: string): number {
  return RAZORPAY_ZERO_DECIMAL.has(currency.toUpperCase()) ? amount : amount / 100
}

export function getRazorpayKeys(): { keyId?: string; keySecret?: string } {
  if (isLiveEnvironment()) {
    return {
      keyId: process.env.RAZORPAY_KEY_ID_LIVE || process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      keySecret: process.env.RAZORPAY_KEY_SECRET_LIVE || process.env.RAZORPAY_KEY_SECRET,
    }
  }
  return {
    keyId: process.env.RAZORPAY_KEY_ID_TEST || process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET_TEST || process.env.RAZORPAY_KEY_SECRET,
  }
}

// ── Payment verification ──────────────────────────────────────────
// amount/currency = what the gateway actually captured (the source of truth).
export type VerifiedPayment =
  | { status: "paid"; amount: number; currency: string; captureId: string }
  | { status: "not_paid"; reason: string } // fake / unpaid / foreign ids → reject the order
  | { status: "unverifiable"; reason: string } // gateway unreachable / still settling → pending review

// Does the captured amount cover the server-calculated USD total?
// USD must match to the cent. Other currencies allow 3% for exchange-rate movement
// between payment creation and verification. Anything else → pending review (never auto-confirmed).
export async function paymentCoversTotal(
  amount: number,
  currency: string,
  totalUsd: number
): Promise<{ ok: boolean; chargedUsd: number | null }> {
  const cur = currency.toUpperCase()
  if (cur === "USD") return { ok: amount + 0.01 >= totalUsd, chargedUsd: Math.round(amount * 100) / 100 }
  const rate = await getUsdRate(cur)
  if (!rate) return { ok: false, chargedUsd: null }
  const chargedUsd = Math.round((amount / rate) * 100) / 100
  return { ok: chargedUsd >= totalUsd * 0.97, chargedUsd }
}

export async function verifyPayPalPayment(paypalOrderId: string): Promise<VerifiedPayment> {
  if (!/^[A-Z0-9]{10,30}$/.test(paypalOrderId)) return { status: "not_paid", reason: "Invalid PayPal order id" }
  const auth = await paypalTokenOrFailure()
  if ("failure" in auth) return auth.failure
  const token = auth.token

  let res: Response
  try {
    res = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${paypalOrderId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
  } catch {
    return { status: "unverifiable", reason: "PayPal unreachable" }
  }
  if (res.status === 404 || res.status === 400) return { status: "not_paid", reason: "PayPal order not found" }
  if (!res.ok) return { status: "unverifiable", reason: `PayPal returned ${res.status}` }

  const order = (await res.json()) as {
    status?: string
    purchase_units?: {
      payments?: { captures?: { id: string; status: string; amount?: { value: string; currency_code: string } }[] }
    }[]
  }
  const allCaptures = (order.purchase_units ?? []).flatMap((u) => u.payments?.captures ?? [])
  const captures = allCaptures.filter((c) => c.status === "COMPLETED")
  // PENDING captures (eCheck, PayPal risk review) are real payments that settle later:
  // keep the order for review instead of rejecting the customer.
  if (captures.length === 0 && allCaptures.some((c) => c.status === "PENDING")) {
    return { status: "unverifiable", reason: "PayPal capture is pending (eCheck or PayPal review)" }
  }
  if (order.status !== "COMPLETED" || captures.length === 0) {
    return { status: "not_paid", reason: `PayPal order status ${order.status ?? "unknown"}` }
  }
  const currency = captures[0].amount?.currency_code ?? ""
  if (!currency || captures.some((c) => c.amount?.currency_code !== currency)) {
    return { status: "unverifiable", reason: "PayPal capture currency unclear" }
  }
  const amount = captures.reduce((s, c) => s + Number(c.amount?.value ?? 0), 0)
  return { status: "paid", amount, currency, captureId: captures[0].id }
}

// Used only for checkouts started on the previous version of the site (they send the PayPal
// capture id but not the PayPal order id). Reads the capture directly from PayPal.
export async function verifyPayPalCapture(captureId: string): Promise<VerifiedPayment> {
  if (!/^[A-Z0-9]{10,30}$/.test(captureId)) return { status: "not_paid", reason: "Invalid PayPal capture id" }
  const auth = await paypalTokenOrFailure()
  if ("failure" in auth) return auth.failure
  const token = auth.token
  let res: Response
  try {
    res = await fetch(`${getPayPalBaseUrl()}/v2/payments/captures/${captureId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
  } catch {
    return { status: "unverifiable", reason: "PayPal unreachable" }
  }
  if (res.status === 404 || res.status === 400) return { status: "not_paid", reason: "PayPal capture not found" }
  if (!res.ok) return { status: "unverifiable", reason: `PayPal returned ${res.status}` }
  const cap = (await res.json()) as { id?: string; status?: string; amount?: { value: string; currency_code: string } }
  if (cap.status === "PENDING") return { status: "unverifiable", reason: "PayPal capture is pending" }
  if (cap.status !== "COMPLETED" || !cap.amount) return { status: "not_paid", reason: `PayPal capture status ${cap.status ?? "unknown"}` }
  return { status: "paid", amount: Number(cap.amount.value), currency: cap.amount.currency_code, captureId: cap.id ?? captureId }
}

// razorpayOrderId may be null for checkouts started on the previous version of the site;
// the payment is still fetched with this store's own keys, so it must belong to this account.
export async function verifyRazorpayPayment(razorpayOrderId: string | null, razorpayPaymentId: string): Promise<VerifiedPayment> {
  if ((razorpayOrderId !== null && !/^order_[A-Za-z0-9]{6,40}$/.test(razorpayOrderId)) || !/^pay_[A-Za-z0-9]{6,40}$/.test(razorpayPaymentId)) {
    return { status: "not_paid", reason: "Invalid Razorpay ids" }
  }
  const { keyId, keySecret } = getRazorpayKeys()
  // No keys = no customer could have paid through this store's Razorpay → refuse (never "pending")
  if (!keyId || !keySecret) return { status: "not_paid", reason: "Razorpay not configured" }

  let res: Response
  try {
    res = await fetch(`https://api.razorpay.com/v1/payments/${razorpayPaymentId}`, {
      headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}` },
      cache: "no-store",
    })
  } catch {
    return { status: "unverifiable", reason: "Razorpay unreachable" }
  }
  if (res.status === 400 || res.status === 404) return { status: "not_paid", reason: "Razorpay payment not found" }
  // Razorpay rejected the store's own keys: the payment can't be confirmed as ours → refuse
  if (res.status === 401 || res.status === 403) return { status: "not_paid", reason: "Razorpay rejected the store's credentials" }
  if (!res.ok) return { status: "unverifiable", reason: `Razorpay returned ${res.status}` }

  const payment = (await res.json()) as { order_id?: string; status?: string; amount?: number; currency?: string }
  if (razorpayOrderId !== null && payment.order_id !== razorpayOrderId) return { status: "not_paid", reason: "Payment does not belong to this order" }
  // Auto-capture can lag a few seconds behind "authorized": keep for review rather than reject a real payer.
  if (payment.status === "authorized") return { status: "unverifiable", reason: "Razorpay payment authorized, capture pending" }
  if (payment.status !== "captured" || typeof payment.amount !== "number" || !payment.currency) {
    return { status: "not_paid", reason: `Razorpay payment status ${payment.status ?? "unknown"}` }
  }
  return {
    status: "paid",
    amount: fromRazorpaySmallestUnit(payment.amount, payment.currency),
    currency: payment.currency,
    captureId: razorpayPaymentId,
  }
}
