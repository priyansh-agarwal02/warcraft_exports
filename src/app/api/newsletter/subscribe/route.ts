import { NextRequest, NextResponse } from "next/server"
import { sendNewsletterWelcome } from "@/lib/email"
import { checkRateLimit } from "@/lib/rate-limit"
import { createServiceClient } from "@/lib/supabase/service"
import { evaluateNewsletterBot } from "@/lib/anti-bot"
import { revalidatePath } from "next/cache"

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!checkRateLimit(`newsletter:${ip}`, 5, 3_600_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const body = await req.json()
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

    // 🛡️ INVISIBLE MULTI-LAYER ANTI-BOT VALIDATION
    // (Checks: Deceptive Honeypots, Time-Lock Token, Same-Origin, Spam Domain / Gibberish Patterns)
    const botCheck = evaluateNewsletterBot(req, body, email)
    if (botCheck.isBot) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[NEWSLETTER ANTI-BOT]: Bot trapped (${botCheck.reason}) for email: ${email}`)
      }
      // 🍯 SILENT POISON-PILL DROP: Return 200 OK so bot thinks it succeeded.
      // ZERO database insert, ZERO Resend welcome emails dispatched!
      return NextResponse.json({ ok: true })
    }

    const supabase = createServiceClient()

    // Check if subscriber already exists
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    const isNew = !existing

    const { error: upsertError } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        { email, is_active: true },
        { onConflict: "email" }
      )

    if (upsertError) {
      console.error("[NEWSLETTER SUBSCRIBE ERROR]:", upsertError)
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    if (isNew) {
      await sendNewsletterWelcome(email)
    }

    revalidatePath("/admin/subscribers")

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[NEWSLETTER SUBSCRIBE EXCEPTION]:", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
