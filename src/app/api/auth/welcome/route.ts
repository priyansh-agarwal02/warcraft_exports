import { NextRequest, NextResponse } from "next/server"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json() as { name: string; email: string }
    if (!name || !email) return NextResponse.json({ ok: false }, { status: 400 })
    await sendWelcomeEmail(name, email)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
