import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const supabase = await createClient()
  const { data } = await supabase
    .from("content_blocks")
    .select("value")
    .eq("key", "sale_banner")
    .single()

  let settings = null
  if (data?.value) {
    try {
      settings = JSON.parse(data.value)
    } catch (e) {
      console.error("Failed to parse sale banner settings:", e)
    }
  }

  return NextResponse.json({ settings })
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const body = await req.json()
  const supabase = await createClient()

  const { error } = await supabase
    .from("content_blocks")
    .upsert(
      { key: "sale_banner", type: "json", value: JSON.stringify(body) },
      { onConflict: "key" }
    )

  if (error) {
    console.error("[sale-settings PATCH] Database upsert failed:", error)
    return NextResponse.json({ error: error.message || "Failed to save settings" }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
