import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { computeOrderPricing, type PricingItemInput } from "@/lib/orders/pricing"
import { getRazorpayKeys, getUsdRate, toRazorpaySmallestUnit } from "@/lib/payments/gateways"

const RAZORPAY_ALLOWED_CURRENCIES = new Set(["USD", "EUR", "GBP", "AUD", "CAD", "JPY", "INR", "RUB", "CNY"])

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!(await checkRateLimit(`rzp-order:${ip}`, 10, 60_000))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const { keyId: KEY_ID, keySecret: KEY_SECRET } = getRazorpayKeys()
  if (!KEY_ID || !KEY_SECRET) {
    return NextResponse.json(
      { error: "Razorpay is not configured. Please contact us to complete your order." },
      { status: 503 }
    )
  }

  let body: {
    items: PricingItemInput[]
    country: string
    shippingMethod?: "standard" | "express"
    couponCode?: string | null
    email?: string | null
    currency?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  // The amount is calculated on the server from the cart — never taken from the browser.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const pricing = await computeOrderPricing(createServiceClient(), {
    items: body.items,
    country: body.country,
    shippingMethod: body.shippingMethod,
    couponCode: body.couponCode,
    email: body.email,
    userId: user?.id ?? null,
  })
  if (!pricing.ok) return NextResponse.json({ error: pricing.error }, { status: pricing.status })
  if (pricing.total <= 0 || pricing.total > 25000) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
  }

  // Only the store's own display currencies (all 2-decimal except JPY). Anything else is charged in USD:
  // 3-decimal currencies such as KWD would otherwise be charged at a tenth of the price.
  const requested = String(body.currency ?? "USD").toUpperCase()
  const currency = RAZORPAY_ALLOWED_CURRENCIES.has(requested) ? requested : "USD"
  const rate = await getUsdRate(currency)
  if (!rate) {
    return NextResponse.json(
      { error: "Currency conversion is temporarily unavailable. Please switch to USD and try again." },
      { status: 503 }
    )
  }
  const amountSmallest = toRazorpaySmallestUnit(pricing.total * rate, currency)
  if (amountSmallest < 100) {
    return NextResponse.json(
      { error: "Amount must be at least 1.00 in target currency (e.g. 100 paise or cents)" },
      { status: 400 }
    )
  }

  const credentials = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64")
  const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: amountSmallest,
      currency,
      receipt: `we-${Date.now().toString(36)}`,
      payment_capture: 1,
      notes: { we_total: `usd:${pricing.total.toFixed(2)}` },
    }),
  })

  if (!rzpRes.ok) {
    const err = await rzpRes.json().catch(() => ({}))
    console.error("Razorpay order error:", err)
    if (rzpRes.status === 401) {
      return NextResponse.json({ error: "Payment provider rejected the request. Please contact support." }, { status: 502 })
    }
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 502 })
  }

  const order = (await rzpRes.json()) as { id: string; amount: number; currency: string }
  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: KEY_ID,
    totalUsd: pricing.total,
  })
}
