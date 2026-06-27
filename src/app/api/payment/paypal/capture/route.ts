import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"

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

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!checkRateLimit(`pp-capture:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json({ error: "PayPal not configured" }, { status: 503 })
  }

  let body: { paypalOrderId: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  if (!body.paypalOrderId) {
    return NextResponse.json({ error: "Missing order ID" }, { status: 400 })
  }

  const base = getPayPalBaseUrl()
  const accessToken = await getPayPalAccessToken(CLIENT_ID, CLIENT_SECRET)

  const captureRes = await fetch(`${base}/v2/checkout/orders/${body.paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  if (!captureRes.ok) {
    const err = await captureRes.json().catch(() => ({}))
    console.error("PayPal capture error:", err)
    return NextResponse.json({ error: "PayPal capture failed" }, { status: 502 })
  }

  const captured = await captureRes.json()
  const captureId =
    captured.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? captured.id

  return NextResponse.json({ captured: true, captureId, orderId: body.paypalOrderId })
}
