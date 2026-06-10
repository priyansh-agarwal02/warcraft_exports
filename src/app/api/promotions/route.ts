import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from("quantity_promotions")
      .select("id, name, description, min_quantity, discount_percent, applies_to, product_ids, is_active, expires_at, created_at")
      .eq("is_active", true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order("min_quantity", { ascending: true })

    if (error) {
      // Table may not exist yet
      return NextResponse.json({ promotions: [] })
    }

    return NextResponse.json({ promotions: data ?? [] }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    })
  } catch {
    return NextResponse.json({ promotions: [] })
  }
}
