import { NextRequest, NextResponse } from "next/server"
import { sendNewsletterWelcome } from "@/lib/email"
import { checkRateLimit } from "@/lib/rate-limit"
import { createServiceClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"

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
