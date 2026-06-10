import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"

// Razorpay currencies that need smallest-unit × 1 (zero-decimal)
const ZERO_DECIMAL = new Set(["JPY"])

function toSmallestUnit(amount: number, currency: string): number {
  return ZERO_DECIMAL.has(currency) ? Math.round(amount) : Math.round(amount * 100)
}

// Fetch live USD exchange rates from server side
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
  if (!checkRateLimit(`rzp-order:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const KEY_ID = process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

  if (!KEY_ID || !KEY_SECRET) {
    return NextResponse.json(
      { error: "Razorpay is not configured. Please contact us to complete your order." },
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

  const rate = await getRate(currency)
  const convertedAmount = totalUsd * rate
  const amountSmallest = toSmallestUnit(convertedAmount, currency)

  if (amountSmallest < 100) {
    return NextResponse.json(
      { error: "Amount must be at least 1.00 in target currency (e.g. 100 paise or cents)" },
      { status: 400 }
    )
  }

  const credentials = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64")

  const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountSmallest,
      currency,
      receipt: `we-${Date.now().toString(36)}`,
      payment_capture: 1,
    }),
  })

  if (!rzpRes.ok) {
    const err = await rzpRes.json().catch(() => ({}))
    console.error("Razorpay order error:", err)
    if (rzpRes.status === 401) {
      return NextResponse.json({ error: "Razorpay credentials are invalid or unauthorized." }, { status: 401 })
    }
    return NextResponse.json(
      { error: err.error?.description ?? "Failed to create payment order" },
      { status: 502 }
    )
  }

  const order = await rzpRes.json()
  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: KEY_ID,
  })
}
