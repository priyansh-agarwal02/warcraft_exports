import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"
import { checkRateLimit } from "@/lib/rate-limit"
import { createServiceClient } from "@/lib/supabase/service"

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

const STOP_WORDS = new Set([
  "do", "you", "have", "any", "the", "a", "an", "is", "are", "can", "i",
  "want", "need", "looking", "for", "what", "how", "much", "does", "it",
  "your", "my", "me", "please", "thanks", "thank", "hi", "hello", "hey",
  "show", "find", "get", "buy", "order", "about", "tell", "with", "and",
  "or", "in", "on", "of", "to", "from", "this", "that", "these", "those",
  "item", "items", "product", "products", "gear", "store", "shop",
])

const SYNONYMS: Record<string, string[]> = {
  legging: ["leggings", "puttees", "gaiter", "gaiters", "leg wrap", "gaitor"],
  leggings: ["legging", "puttees", "gaiter", "gaiters", "leg wrap", "gaitor"],
  gaiter: ["gaiters", "leggings", "puttees", "gaitor"],
  gaiters: ["gaiter", "leggings", "puttees", "gaitor"],
  puttee: ["puttees", "leggings", "gaiters"],
  puttees: ["puttee", "leggings", "gaiters"],
  holster: ["holsters", "pouch", "case"],
  holsters: ["holster", "pouch", "case"],
  pouch: ["pouches", "ammo", "bag"],
  pouches: ["pouch", "ammo", "bag"],
  belt: ["belts", "strap", "waistband"],
  belts: ["belt", "strap", "waistband"],
  helmet: ["helmets", "cap", "hat"],
  helmets: ["helmet", "cap", "hat"],
  boot: ["boots", "shoe", "footwear"],
  boots: ["boot", "shoe", "footwear"],
}

function extractSearchKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
    .slice(0, 5)
}

function expandKeywords(words: string[]): string[] {
  const expanded = new Set<string>()
  for (const w of words) {
    const clean = w.toLowerCase()
    expanded.add(clean)

    if (clean.endsWith("ies")) expanded.add(clean.slice(0, -3) + "y")
    else if (clean.endsWith("es")) expanded.add(clean.slice(0, -2))
    else if (clean.endsWith("s")) expanded.add(clean.slice(0, -1))

    if (SYNONYMS[clean]) {
      SYNONYMS[clean].forEach((syn) => expanded.add(syn))
    }
  }
  return Array.from(expanded).filter((w) => w.length > 2)
}

async function searchProducts(userQuery: string): Promise<string> {
  const rawKeywords = extractSearchKeywords(userQuery)
  const keywords = expandKeywords(rawKeywords)

  try {
    const serviceClient = createServiceClient()
    let products: any[] = []

    if (keywords.length > 0) {
      const orConditions = keywords.flatMap((kw) => [
        `name.ilike.%${kw}%`,
        `short_description.ilike.%${kw}%`,
        `description.ilike.%${kw}%`,
        `material.ilike.%${kw}%`,
        `slug.ilike.%${kw}%`,
      ])

      const { data } = await serviceClient
        .from("products")
        .select("name, slug, price_usd, sale_price_usd, short_description, nation, era")
        .eq("is_active", true)
        .or(orConditions.join(","))
        .limit(6)

      if (data && data.length > 0) {
        products = data
      }
    }

    if (products.length === 0) {
      const { data } = await serviceClient
        .from("products")
        .select("name, slug, price_usd, sale_price_usd, short_description, nation, era")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .limit(4)

      if (data && data.length > 0) {
        products = data
      }
    }

    if (products.length === 0) return ""

    const productLines = products.map((p) => {
      const price = p.sale_price_usd ? `$${p.sale_price_usd} (was $${p.price_usd})` : `$${p.price_usd}`
      const desc = p.short_description ? ` — ${p.short_description.slice(0, 75)}` : ""
      return `• ${p.name} | ${price}${desc} | Direct Link: [${p.name}](/product/${p.slug})`
    }).join("\n")

    return `\n\n--- MATCHING PRODUCTS FROM CATALOG ---\n${productLines}\n--- END CATALOG RESULTS ---\nWhen recommending products, ALWAYS use the embedded markdown link format [Product Name](/product/slug).`
  } catch (err) {
    console.error("Chat product search error:", err)
    return ""
  }
}

const SYSTEM_PROMPT = `You are Warex, the expert customer support AI assistant for Warcraft Exports (warcraftexports.com), a premier manufacturer and exporter of WW1 & WW2 military reproduction gear, reenactment equipment, holsters, pouches, gaiters, puttees, belts, uniforms, helmets, and accessories.

KEY RESPONSIBILITIES & GUIDELINES:
1. CATALOG GUIDANCE & RECOMMENDATIONS:
   - When matching products from catalog are provided below, ALWAYS recommend them with exact prices and embedded markdown links formatted as [Product Name](/product/slug).
   - If the user asks for a category (e.g. leggings, gaiters, puttees, holsters, pouches, belts, slings, boots, helmets), guide them to the specific products or direct them to browse [Browse Full Shop](/shop).
2. ORDER TRACKING & MY ORDERS:
   - When asked about order status, tracking, or order history, ALWAYS provide direct clickable markdown links:
     - For tracking with Order ID: [Track Order Page](/track-order)
     - For logged-in account order history: [My Orders Dashboard](/account/orders)
   - Explain that customers can enter their Order Number (e.g. WE-2026-0001) and email on [Track Order](/track-order).
3. PROMOTIONS & DEALS:
   - Guide users to [Sale & Discounted Gear](/sale) for active deals.
   - Mention auto-applied Quantity Discounts in cart (e.g. Buy 2+ Save 10%) and Combo Deals.
4. WHOLESALE & B2B:
   - For bulk or factory orders (minimum 100 items), guide users to submit a query at [B2B Wholesale Inquiries](/wholesale).
5. SHIPPING & RETURNS:
   - Free worldwide standard shipping on orders over $50.
   - Select items ship directly from US Warehouse ("Ships from USA" badge) with 1-3 day expedited delivery.
   - 30-day return policy. Contact support at [Contact Us](/contact).

CRITICAL FORMATTING RULE:
Never output raw URLs. Always write links in standard markdown format: [Link Label](/path).
Examples:
- [P37 Canvas Gaiters Leggings](/product/p37-gaiters-leggings)
- [Track Order](/track-order)
- [My Account Orders](/account/orders)
- [Browse Full Shop](/shop)
- [Sale Page](/sale)
- [Contact Support](/contact)

Be concise, friendly, professional, and knowledgeable. Keep responses under 220 words with clear formatting.`

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  if (!checkRateLimit(`chat:${ip}`, 25, 60_000)) {
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

    let catalogContext = ""
    if (lastUserMsg) {
      catalogContext = await searchProducts(lastUserMsg.content)
    }

    const dynamicSystemPrompt = SYSTEM_PROMPT + catalogContext

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "system", content: dynamicSystemPrompt }, ...safeMessages],
      max_tokens: 450,
      temperature: 0.6,
    })

    const reply =
      completion.choices[0]?.message?.content ??
      "I'm sorry, I couldn't process that right now. Please email warcraftexports@gmail.com for assistance."
    return NextResponse.json({ reply })
  } catch (err) {
    console.error("Chat API error:", err)
    return NextResponse.json({
      reply: "I'm temporarily unavailable. Please visit our [Contact Us](/contact) page or email warcraftexports@gmail.com for help.",
    }, { status: 200 })
  }
}
