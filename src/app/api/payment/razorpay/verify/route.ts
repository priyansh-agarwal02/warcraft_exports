import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { checkRateLimit } from "@/lib/rate-limit"

function getRazorpayKeys() {
  const isVercelProd = process.env.VERCEL_ENV === "production" || (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_APP_URL?.includes("localhost"))
  if (isVercelProd) {
    return {
      keyId: process.env.RAZORPAY_KEY_ID_LIVE || process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      keySecret: process.env.RAZORPAY_KEY_SECRET_LIVE || process.env.RAZORPAY_KEY_SECRET
    }
  } else {
    return {
      keyId: process.env.RAZORPAY_KEY_ID_TEST || process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      keySecret: process.env.RAZORPAY_KEY_SECRET_TEST || process.env.RAZORPAY_KEY_SECRET
    }
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!checkRateLimit(`rzp-verify:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const { keyId: KEY_ID, keySecret: KEY_SECRET } = getRazorpayKeys()
  if (!KEY_SECRET || !KEY_ID) {
    return NextResponse.json({ error: "Payment not configured" }, { status: 503 })
  }

  let body: {
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
    expectedAmount?: number   // smallest-unit amount the client expects (e.g. 190000 paise)
    expectedCurrency?: string // e.g. "INR"
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, expectedAmount, expectedCurrency } = body

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json({ error: "Missing payment fields" }, { status: 400 })
  }

  // Step 1: HMAC-SHA256 signature verification
  const payload = `${razorpayOrderId}|${razorpayPaymentId}`
  const expected = crypto.createHmac("sha256", KEY_SECRET).update(payload).digest("hex")

  if (expected !== razorpaySignature) {
    console.warn("Razorpay signature mismatch", { razorpayOrderId, razorpayPaymentId })
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
  }

  // Step 2 (M-5 FIX): Cross-check paid amount against Razorpay order
  // Fetch the order from Razorpay API to confirm amount_paid matches expected total
  try {
    const credentials = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64")
    const rzpRes = await fetch(`https://api.razorpay.com/v1/orders/${razorpayOrderId}`, {
      headers: { Authorization: `Basic ${credentials}` },
    })

    if (rzpRes.ok) {
      const rzpOrder = await rzpRes.json()

      // Verify the Razorpay order status is "paid"
      if (rzpOrder.status !== "paid") {
        console.warn("Razorpay order not fully paid", { razorpayOrderId, status: rzpOrder.status })
        return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
      }

      // If the client sent expectedAmount, cross-check it against what Razorpay actually charged
      if (expectedAmount && typeof expectedAmount === "number") {
        if (rzpOrder.amount_paid !== expectedAmount) {
          console.warn("Razorpay amount mismatch", {
            razorpayOrderId,
            expectedAmount,
            actualAmountPaid: rzpOrder.amount_paid,
          })
          return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 })
        }
      }

      // If the client sent expectedCurrency, verify it matches
      if (expectedCurrency && rzpOrder.currency !== expectedCurrency) {
        console.warn("Razorpay currency mismatch", {
          razorpayOrderId,
          expectedCurrency,
          actualCurrency: rzpOrder.currency,
        })
        return NextResponse.json({ error: "Payment currency mismatch" }, { status: 400 })
      }
    } else {
      // Non-critical: if Razorpay API is temporarily down, signature alone is still valid
      console.warn("Could not fetch Razorpay order for amount verification", {
        razorpayOrderId,
        status: rzpRes.status,
      })
    }
  } catch (err) {
    // Non-critical: don't block payment if amount-check fetch fails
    console.warn("Razorpay order fetch failed (non-blocking):", err)
  }

  return NextResponse.json({ verified: true, paymentId: razorpayPaymentId })
}
