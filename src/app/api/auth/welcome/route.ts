import { NextRequest, NextResponse } from "next/server"
import { sendWelcomeEmail } from "@/lib/email"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!checkRateLimit(`welcome:${ip}`, 3, 3_600_000)) {
    return NextResponse.json({ ok: false }, { status: 429 })
  }

  try {
    const { name, email } = await req.json() as { name: string; email: string }
    if (!name || !email) return NextResponse.json({ ok: false }, { status: 400 })
    await sendWelcomeEmail(name, email)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
