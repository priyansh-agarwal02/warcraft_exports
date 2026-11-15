import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { computeOrderPricing, type PricingItemInput } from "@/lib/orders/pricing"
import { getPayPalAccessToken, getPayPalBaseUrl, getUsdRate, PAYPAL_ZERO_DECIMAL } from "@/lib/payments/gateways"

// PayPal supported global currencies
const PAYPAL_SUPPORTED_CURRENCIES = new Set([
  "USD", "EUR", "GBP", "CAD", "AUD", "JPY", "NZD", "CHF", "HKD", "SGD", "SEK", "DKK", "PLN", "NOK", "MXN", "ILS",
])

function formatAmount(amount: number, currency: string): string {
  return PAYPAL_ZERO_DECIMAL.has(currency) ? String(Math.round(amount)) : amount.toFixed(2)
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!(await checkRateLimit(`pp-order:${ip}`, 10, 60_000))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "PayPal is not configured. Please contact us to complete your order." },
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

  const requested = String(body.currency ?? "USD").toUpperCase()
  const targetCurrency = PAYPAL_SUPPORTED_CURRENCIES.has(requested) ? requested : "USD"
  let amount = pricing.total
  if (targetCurrency !== "USD") {
    const rate = await getUsdRate(targetCurrency)
    if (!rate) {
      // Never guess a conversion. (The PayPal button is loaded in this currency, so switching to USD here would fail anyway.)
      return NextResponse.json(
        { error: "Currency conversion is temporarily unavailable. Please switch to USD and try again." },
        { status: 503 }
      )
    }
    amount = pricing.total * rate
  }

  const accessToken = await getPayPalAccessToken()
  if (!accessToken) return NextResponse.json({ error: "PayPal is temporarily unavailable" }, { status: 502 })

  const ppRes = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: targetCurrency, value: formatAmount(amount, targetCurrency) },
          custom_id: `usd:${pricing.total.toFixed(2)}`,
          description: "Warcraft Exports — Historical Reproduction Gear",
        },
      ],
      application_context: {
        brand_name: "Warcraft Exports",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
      },
    }),
  })

  if (!ppRes.ok) {
    const err = await ppRes.json().catch(() => ({}))
    console.error("PayPal create order error:", err)
    return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 502 })
  }

  const order = (await ppRes.json()) as { id: string }
  return NextResponse.json({ paypalOrderId: order.id, totalUsd: pricing.total })
}
