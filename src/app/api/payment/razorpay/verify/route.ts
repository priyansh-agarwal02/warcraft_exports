import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { checkRateLimit } from "@/lib/rate-limit"

function getRazorpayKeys() {
  const isVercelProd = process.env.VERCEL_ENV === "production" || (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_APP_URL?.includes("localhost"))
  if (isVercelProd) {
    return {
      keySecret: process.env.RAZORPAY_KEY_SECRET_LIVE || process.env.RAZORPAY_KEY_SECRET
    }
  } else {
    return {
      keySecret: process.env.RAZORPAY_KEY_SECRET_TEST || process.env.RAZORPAY_KEY_SECRET
    }
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!checkRateLimit(`rzp-verify:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const { keySecret: KEY_SECRET } = getRazorpayKeys()
  if (!KEY_SECRET) {
    return NextResponse.json({ error: "Payment not configured" }, { status: 503 })
  }

  let body: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json({ error: "Missing payment fields" }, { status: 400 })
  }

  // HMAC-SHA256 verification
  const payload = `${razorpayOrderId}|${razorpayPaymentId}`
  const expected = crypto.createHmac("sha256", KEY_SECRET).update(payload).digest("hex")

  if (expected !== razorpaySignature) {
    console.warn("Razorpay signature mismatch", { razorpayOrderId, razorpayPaymentId })
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
  }

  return NextResponse.json({ verified: true, paymentId: razorpayPaymentId })
}
