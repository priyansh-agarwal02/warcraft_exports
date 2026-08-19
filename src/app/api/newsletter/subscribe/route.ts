import { NextRequest, NextResponse } from "next/server"
import { sendNewsletterWelcome } from "@/lib/email"
import { checkRateLimit } from "@/lib/rate-limit"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!checkRateLimit(`newsletter:${ip}`, 3, 3_600_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const body = await req.json()

    // 🍯 INVISIBLE HONEYPOT TRAP: Bots fill hidden inputs automatically
    if (typeof body?.b_website === "string" && body.b_website.trim().length > 0) {
      // Return fake 200 OK success so bot thinks it succeeded — zero DB insert, zero Resend emails
      return NextResponse.json({ ok: true })
    }

    let email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : null

    if (!email || !EMAIL_REGEX.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }

    // 🔒 GMAIL DOT-TRICK DEDUPLICATION:
    // Gmail ignores dots (c.a.t.h.y@gmail.com === cathy@gmail.com).
    // Strip dots so duplicate submissions of any dot variant map to 1 record and 1 welcome email.
    if (email.endsWith("@gmail.com") || email.endsWith("@googlemail.com")) {
      const parts = email.split("@")
      const userWithoutDots = parts[0].replace(/\./g, "").split("+")[0]
      email = `${userWithoutDots}@${parts[1]}`
    }

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/newsletter_subscribers`,
      {
        method: "POST",
        headers: {
          "apikey": SERVICE_KEY,
          "Authorization": `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates",
        },
        body: JSON.stringify({ email }),
      }
    )

    if (!res.ok && res.status !== 409) {
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    const isNew = res.status !== 409
    if (isNew) {
      await sendNewsletterWelcome(email)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
