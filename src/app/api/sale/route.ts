import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const [{ data: products }, { data: banner }] = await Promise.all([
    supabase
      .from("products")
      .select(
        `id, name, slug, price_usd, sale_price_usd, nation, era, is_featured,
         stock_quantity, is_on_sale,
         images:product_images(url, is_hero)`
      )
      .or("is_on_sale.eq.true,sale_price_usd.not.is.null")
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("content_blocks")
      .select("value")
      .eq("key", "sale_banner")
      .single(),
  ])

  let bannerSettings = null
  if (banner?.value) {
    try {
      bannerSettings = JSON.parse(banner.value)
    } catch (e) {
      console.error("Failed to parse sale banner settings:", e)
    }
  }

  return NextResponse.json({ products: products ?? [], bannerSettings })
}
