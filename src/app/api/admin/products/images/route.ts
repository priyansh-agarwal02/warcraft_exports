import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createServiceClient } from "@/lib/supabase/service"

/**
 * Admin Product Images API
 * Handles adding images to products via the admin panel.
 * Replaces direct client-side Supabase REST calls for security.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await req.json() as {
      product_id: string
      url: string
      alt_text?: string
      sort_order?: number
      is_hero?: boolean
    }

    if (!body.product_id || !body.url) {
      return NextResponse.json({ error: "product_id and url are required" }, { status: 400 })
    }

    // Basic URL validation
    if (!body.url.startsWith("https://")) {
      return NextResponse.json({ error: "Image URL must use HTTPS" }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from("product_images")
      .insert([{
        product_id: body.product_id,
        url: body.url,
        alt_text: body.alt_text || null,
        sort_order: body.sort_order ?? 0,
        is_hero: body.is_hero ?? false,
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 })
  }
}
