import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"
import { requireAdmin } from "@/lib/admin-auth"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { name, nation, era, material, style, features } = await req.json() as {
      name: string; nation: string; era: string; material?: string; style?: string; features?: string[]
    }
    if (!name) return NextResponse.json({ error: "Product name required" }, { status: 400 })

    const featuresText = features?.length ? `Key features: ${features.join(", ")}.` : ""
    const materialText = material ? `Material: ${material}.` : ""
    const styleText = style ? `Style: ${style}.` : ""

    const prompt = `Write a compelling product description for a historical reproduction military item sold by Warcraft Exports, a manufacturer in Kanpur, India.

Product: ${name}
Nation: ${nation}
Era: ${era}
${materialText}
${styleText}
${featuresText}

Write two paragraphs:
1. First paragraph (2-3 sentences): Describe the historical context and authenticity of this item — what soldiers used it for, when it was used. Make it sound museum-quality and authoritative.
2. Second paragraph (2-3 sentences): Describe the craftsmanship, materials, and manufacturing quality. Mention it's handcrafted in India by skilled artisans.

Keep total length under 120 words. No bullet points. Tone: expert, historical, premium. Do not use marketing fluff like "amazing" or "incredible".`

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 250,
      temperature: 0.8,
    })

    const description = completion.choices[0]?.message?.content ?? ""
    return NextResponse.json({ description })
  } catch (err) {
    console.error("AI describe error:", err)
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 })
  }
}
