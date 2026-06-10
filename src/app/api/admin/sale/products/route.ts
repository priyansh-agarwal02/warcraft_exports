import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const serviceHeaders = {
  "apikey": SERVICE_KEY,
  "Authorization": `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  // Query all active products with sale fields, ordered by name
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=id,name,sku,price_usd,sale_price_usd,is_on_sale,stock_quantity,images:product_images(url)&is_active=eq.true&order=name.asc`,
    {
      method: "GET",
      headers: serviceHeaders,
    }
  )

  if (!res.ok) {
    const errorText = await res.text()
    return NextResponse.json({ error: errorText }, { status: res.status })
  }

  const products = await res.json()
  return NextResponse.json({ products })
}
