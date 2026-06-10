import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"
import { checkRateLimit } from "@/lib/rate-limit"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const INJECTION_PATTERNS = [
  /ignore\s+(previous|above|all)\s+instructions/i,
  /system\s*prompt/i,
  /you\s+are\s+now/i,
  /forget\s+(everything|all)/i,
  /new\s+instructions/i,
  /jailbreak/i,
  /DAN\s+mode/i,
]

function containsInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((re) => re.test(text))
}

const SYSTEM_PROMPT = `You are a knowledgeable customer service assistant for Warcraft Exports, a manufacturer and global exporter of WW1 and WW2 historical reproduction military gear based in Kanpur, India.

You help customers with:
- Product information (holsters, pouches, belts, slings, reenactment kits)
- Sizing and fit guidance
- Order tracking: Guide users to "Manage Orders" under their Account dashboard (/account/orders) where they can view full order details, or use the "Track Order" facility page (/track-order) with their Order Number (e.g. WE-2026-0001) and checkout email.
- US Warehouse: Select items ship directly from our US warehouse (marked with a "Ships from USA" badge and USA flag). These products default to Expedited Shipping at checkout, while other items default to Standard Shipping.
- Sales, Promotions & Coupons: Guide users to our Sale page (/sale) for discounted gear. We offer auto-applied tiered Quantity Discounts in the cart (e.g. Buy 2+ Save 10%), Combo Deals (discounted bundles like Holster + Belt), and Coupon/Promo Codes that can be entered manually at checkout.
- Wholesale inquiries (minimum 100 pieces, direct from factory)
- Shipping information (worldwide shipping, 10-20 business days, free over $150)
- Returns (30-day return policy)
- Materials (genuine leather, canvas, brass hardware)

Be concise, helpful, and knowledgeable about historical military gear. Keep responses under 150 words. Do not make up specific product prices — say "visit our shop for current pricing". If asked about payment, mention we accept PayPal and Razorpay. Do not discuss unrelated topics.`

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  if (!checkRateLimit(`chat:${ip}`, 20, 60_000)) {
    return NextResponse.json({ reply: "Too many messages. Please wait a minute before continuing." }, { status: 429 })
  }

  try {
    const body = await req.json() as { messages?: unknown }
    const messages = body?.messages

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const safeMessages = (messages as { role: unknown; content: unknown }[])
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m) => ({ role: m.role as "user" | "assistant", content: String(m.content).slice(0, 1000) }))
      .slice(-8)

    if (safeMessages.length === 0) {
      return NextResponse.json({ error: "No valid messages" }, { status: 400 })
    }

    const lastUserMsg = [...safeMessages].reverse().find((m) => m.role === "user")
    if (lastUserMsg && containsInjection(lastUserMsg.content)) {
      return NextResponse.json({
        reply: "I can only help with questions about Warcraft Exports products and orders.",
      })
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...safeMessages],
      max_tokens: 300,
      temperature: 0.7,
    })

    const reply =
      completion.choices[0]?.message?.content ??
      "I'm sorry, I couldn't process that. Please email warcraftexports@gmail.com for assistance."
    return NextResponse.json({ reply })
  } catch (err) {
    console.error("Chat API error:", err)
    return NextResponse.json({
      reply: "I'm temporarily unavailable. Please email warcraftexports@gmail.com for help.",
    }, { status: 200 })
  }
}
