import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"

// PayPal zero-decimal currencies
const ZERO_DECIMAL = new Set(["JPY", "HUF", "TWD"])

function formatAmount(amount: number, currency: string): string {
  return ZERO_DECIMAL.has(currency) ? String(Math.round(amount)) : amount.toFixed(2)
}

function getPayPalBaseUrl(): string {
  if (process.env.PAYPAL_API_URL) return process.env.PAYPAL_API_URL
  const isVercelProd = process.env.VERCEL_ENV === "production" || (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_APP_URL?.includes("localhost"))
  return isVercelProd ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com"
}

async function getPayPalAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const base = getPayPalBaseUrl()
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })
  const data = await res.json()
  return data.access_token
}

async function getRate(currency: string): Promise<number> {
  if (currency === "USD") return 1
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
      next: { revalidate: 3600 },
    })
    const data = await res.json()
    return data.rates?.[currency] ?? 1
  } catch {
    return 1
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!checkRateLimit(`pp-order:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json(
      { error: "PayPal is not configured. Please contact us to complete your order." },
      { status: 503 }
    )
  }

  let body: { totalUsd: number; currency: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { totalUsd, currency = "USD" } = body
  if (!totalUsd || totalUsd <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
  }

  // PayPal supported global currencies
  const PAYPAL_SUPPORTED_CURRENCIES = new Set([
    "USD", "EUR", "GBP", "CAD", "AUD", "JPY", "NZD", "CHF", "HKD", "SGD", "SEK", "DKK", "PLN", "NOK", "MXN", "ILS"
  ])

  const targetCurrency = PAYPAL_SUPPORTED_CURRENCIES.has(currency.toUpperCase()) ? currency.toUpperCase() : "USD"
  let formattedAmount = ""
  
  if (targetCurrency === "USD") {
    formattedAmount = formatAmount(totalUsd, "USD")
  } else {
    const rate = await getRate(targetCurrency)
    const convertedAmount = totalUsd * rate
    formattedAmount = formatAmount(convertedAmount, targetCurrency)
  }

  const base = getPayPalBaseUrl()
  const accessToken = await getPayPalAccessToken(CLIENT_ID, CLIENT_SECRET)

  const ppRes = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: targetCurrency,
            value: formattedAmount,
          },
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

  const order = await ppRes.json()
  return NextResponse.json({ paypalOrderId: order.id })
}
