import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!checkRateLimit(`register:${ip}`, 5, 3_600_000)) {
    return NextResponse.json({ error: "Too many registration attempts. Please try again in an hour." }, { status: 429 })
  }

  try {
    const { fullName, email, password, phone, turnstileToken } = await req.json()

    if (!fullName?.trim() || !email?.trim() || !password || !phone?.trim() || !turnstileToken) {
      return NextResponse.json({ error: "Missing required registration fields" }, { status: 400 })
    }

    // 1. Verify Cloudflare Turnstile token
    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY || "1x00000000000000000000000000000000A",
        response: turnstileToken,
        remoteip: ip,
      }),
    })
    
    const verifyData = await verifyRes.json()
    if (!verifyData.success) {
      return NextResponse.json({ error: "Security check failed. Please verify you are human." }, { status: 400 })
    }

    // 2. Register user via Supabase Server Client
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim()
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, user: data.user })
  } catch (err) {
    return NextResponse.json({ error: "An unexpected error occurred during registration." }, { status: 500 })
  }
}
